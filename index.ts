import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const KNOWLEDGE_BASE = `
CROP RECOMMENDATIONS:
- Red soil with limited water: groundnut, Bengal gram, mango are suitable (low water, drought-tolerant).
- Clay soil with abundant water: rice, sugarcane are ideal (high water requirement).
- Loam soil is versatile: wheat, maize, tomato, soybean all grow well.
- Sandy soil: groundnut, onion, mango (good drainage, low water).
- Black soil (regur): cotton, Bengal gram, soybean (moisture retentive).

IRRIGATION:
- Drip irrigation saves 30-60% water vs flood; best for vegetables, fruits, sugarcane.
- Water early morning or late evening to reduce evaporation.
- Mulching reduces evaporation by up to 50%.
- High-water crops: rice, sugarcane, banana. Low-water: groundnut, Bengal gram, mango.

FERTILIZER:
- NPK basics: Nitrogen for leaf growth, Phosphorus for roots/flowers, Potassium for disease resistance.
- Split nitrogen into 2-3 doses. Apply P and K basally.
- Apply based on soil test. Organic manure improves soil structure.
- Zinc deficiency common in rice; apply zinc sulphate.

WEATHER-BASED ADVICE:
- Rain expected: postpone irrigation and pesticide application.
- High temperature: ensure livestock water, use shade nets for vegetables.
- High humidity: monitor for fungal diseases (mildew, blast).
- High wind: secure young plants and greenhouses.

LIVESTOCK/DAIRY:
- Vaccinate cattle: FMD every 6 months, HS/BQ annually before monsoon, Brucellosis for female calves 4-8 months.
- Maintain records. Consult vet for herd-specific schedule.
- Monitor milk production daily; sudden drop signals health or environment issues.

POULTRY:
- Layers: 16-18 hours light, 16-18% protein feed, 3.5-4% calcium.
- Vaccinate against Newcastle (Ranikhet), Gumboro, Fowl Pox.
- Sudden egg production drop signals health or environment issues.

FISHERIES:
- Ideal pond pH 6.5-9.0, dissolved oxygen >5 mg/L, temperature 25-32°C.
- Monitor morning and evening. Use lime for low pH, aerators for low oxygen.
- Avoid overfeeding to prevent ammonia build-up.

GOVERNMENT SCHEMES (India):
- PM-KISAN: Rs 6,000/year income support for small/marginal farmers. Apply at pmkisan.gov.in.
- PMFBY: subsidized crop insurance (2% kharif, 1.5% rabi, 5% horticulture).
- Soil Health Card: free soil testing every 2 years.
- PMKSY: subsidies for drip/sprinkler irrigation and farm ponds.
- KCC: collateral-free credit up to Rs 1.6 lakh at 4% effective interest.
`;

const SYSTEM_PROMPT = `You are CropWise AI, a farming assistant for Indian farmers. You provide practical, context-aware guidance on crops, soil, irrigation, fertilizer, weather, livestock, dairy, poultry, fisheries, government schemes and farm finance.

RULES:
1. Use the farmer's profile and farm context when provided to give personalized answers.
2. Be practical and specific. Give actionable advice.
3. For disease diagnosis, say "possible issue" — never a definitive diagnosis. Recommend consulting a veterinarian or agriculture officer for confirmation.
4. For medical/veterinary issues, always recommend consulting a qualified professional.
5. For financial figures, use "estimated" language. Never guarantee profit.
6. Keep responses concise (3-6 sentences unless more detail is clearly needed).
7. Use simple, non-technical language. The audience may have limited formal education.
8. If you don't know something, say so honestly rather than guessing.
9. Reference government schemes when relevant.
10. All amounts should be in INR (Rs).

Use this knowledge base as reference:
${KNOWLEDGE_BASE}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, farmContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemContent = farmContext
      ? `${SYSTEM_PROMPT}\n\nFARMER CONTEXT:\n${farmContext}`
      : SYSTEM_PROMPT;

    const apiMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      const lastUser = messages.filter((m: any) => m.role === "user").pop();
      const fallback = generateFallback(lastUser?.content ?? "", farmContext);
      return new Response(JSON.stringify({
        role: "assistant",
        content: fallback,
        note: "Running in offline mode — no AI API key configured. This is a rule-based response. Add OPENAI_API_KEY for full AI responses.",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      const lastUser = messages.filter((m: any) => m.role === "user").pop();
      const fallback = generateFallback(lastUser?.content ?? "", farmContext);
      return new Response(JSON.stringify({
        role: "assistant",
        content: fallback + "\n\n_(AI service temporarily unavailable — showing rule-based guidance. Please try again later.)_",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try rephrasing your question.";

    return new Response(JSON.stringify({ role: "assistant", content }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateFallback(question: string, farmContext?: string): string {
  const q = question.toLowerCase();
  const ctx = farmContext ? `\n\nBased on your farm context: ${farmContext}` : "";

  if (q.includes("soil") && (q.includes("grow") || q.includes("crop") || q.includes("plant"))) {
    if (q.includes("red") || q.includes("sandy")) {
      return `For red/sandy soil with limited water, good options are groundnut (est. Rs 22,000/ac investment, Rs 50,000/ac revenue), Bengal gram (Rs 16,000/ac, Rs 42,000/ac), and mango (long-term, low water). These are drought-tolerant crops suited to well-drained soils. Check the Crop Recommendations page for a full suitability score.${ctx}`;
    }
    if (q.includes("clay")) {
      return `For clay soil, rice and sugarcane are ideal if water is abundant — both need high water. If water is limited, consider wheat (medium water) in rabi season. Clay retains moisture well, so drainage may be a concern in heavy rain.${ctx}`;
    }
    return `The best crop depends on your soil type, water availability and season. In general: loam soil is versatile for wheat, maize, tomato; sandy soil suits groundnut and onion; clay is good for rice. Visit the Crop Recommendations page for personalized matches.${ctx}`;
  }

  if (q.includes("water") || q.includes("irrigat")) {
    return `Drip irrigation is the most water-efficient method, saving 30-60% vs flood irrigation. Subsidies are available under PMKSY. Water early morning or late evening to reduce evaporation. For high-water crops like rice and sugarcane, ensure reliable water supply before planting. Check the Irrigation page for crop-specific schedules.${ctx}`;
  }

  if (q.includes("fertilizer") || q.includes("npk") || q.includes("nutrient")) {
    return `Apply fertilizer based on a soil test. General guidance: Nitrogen (N) for leaf growth, Phosphorus (P) for roots and flowering, Potassium (K) for disease resistance. Split nitrogen into 2-3 doses; apply P and K basally at sowing. Add organic manure (FYM/compost) along with chemical fertilizers. See the Fertilizer Guide for crop-specific NPK recommendations.${ctx}`;
  }

  if (q.includes("weather") || q.includes("rain")) {
    return `Check the Weather page for your farm's 7-day forecast with farming-specific advice. Generally: postpone irrigation and pesticide application when rain is expected; monitor for fungal diseases in high humidity; ensure livestock water during high temperatures.${ctx}`;
  }

  if (q.includes("cow") || q.includes("cattle") || q.includes("dairy") || q.includes("milk") || q.includes("livestock")) {
    return `For cattle/dairy: vaccinate against FMD every 6 months, HS and BQ annually before monsoon, and Brucellosis for female calves aged 4-8 months. Monitor milk production daily — a sudden drop signals health or environment issues. For any health concerns, consult a veterinarian. Track your animals in the Dairy and Livestock modules.${ctx}`;
  }

  if (q.includes("chicken") || q.includes("poultry") || q.includes("egg") || q.includes("bird")) {
    return `For poultry layers: provide 16-18 hours of light, feed with 16-18% protein and 3.5-4% calcium. Vaccinate against Newcastle (Ranikhet), Gumboro and Fowl Pox. Monitor egg production daily — sudden drops signal health or environment issues. Track your flock in the Poultry module.${ctx}`;
  }

  if (q.includes("fish") || q.includes("pond") || q.includes("fisher")) {
    return `For fisheries: maintain pond pH between 6.5-9.0, dissolved oxygen above 5 mg/L, and temperature 25-32°C. Monitor morning and evening. Use lime to correct low pH and aerators for low oxygen. Avoid overfeeding to prevent ammonia build-up. Track your ponds in the Fisheries module.${ctx}`;
  }

  if (q.includes("scheme") || q.includes("government") || q.includes("subsidy") || q.includes("pm-kisan") || q.includes("loan") || q.includes("kcc")) {
    return `Key government schemes for farmers: PM-KISAN (Rs 6,000/year income support, apply at pmkisan.gov.in), PMFBY (subsidized crop insurance), Soil Health Card (free soil testing), PMKSY (irrigation subsidies), KCC (collateral-free credit at 4% interest). Visit the Government Schemes page for full details and eligibility. Always verify with the official source before applying.${ctx}`;
  }

  if (q.includes("profit") || q.includes("expense") || q.includes("revenue") || q.includes("finance") || q.includes("money") || q.includes("cost")) {
    return `Track all expenses (seeds, fertilizer, labour, feed, etc.) and revenue (crop sales, milk, eggs, etc.) in the Finance section. The Profit & Loss page shows your net profit and margin with charts. All figures are based on the data you enter — track every transaction for accuracy.${ctx}`;
  }

  return `I'm CropWise AI, your farming assistant. I can help with crops, soil, irrigation, fertilizer, weather, livestock, dairy, poultry, fisheries, government schemes and farm finance. Ask me a specific question like "What can I grow in red soil with limited water?" or "When should I vaccinate my cows?"${ctx}\n\n_Note: Full AI is not configured — this is rule-based guidance. Add an OPENAI_API_KEY for complete responses._`;
}

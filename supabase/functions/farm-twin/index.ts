import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TWIN_SYSTEM_PROMPT = `You are the "Farm Twin" engine for CropWise, an Indian farming app. You are given a JSON snapshot of one farmer's real farm data: farm details, soil profile, crop records, expenses, revenue, and (if present) livestock/dairy/poultry/fishery logs.

Your job is to return a personalized digital-twin analysis in three parts:

1. "current_state": A short, factual snapshot of where the farm stands right now (soil condition, active crops and their growth stage, recent spending vs revenue trend). 2-4 sentences.

2. "projection": A forward-looking projection for the next 1-4 weeks based on the current crop stage(s), season, and soil/water data. Use "likely" / "estimated" language, never certainty. 2-4 sentences.

3. "pattern_insights": An array of 2-4 short insights (1-2 sentences each) derived ONLY from patterns actually visible in this farmer's own historical data (e.g. recurring expense categories, irrigation gaps, past crop outcomes, seasonal timing habits). Do NOT invent patterns that aren't supported by the provided data. If there isn't enough history to find a genuine pattern, say so honestly in one insight instead of fabricating one.

Rules:
- Never guarantee yields, prices, or profit — use "estimated" / "likely" framing.
- For any disease/health mentions, say "possible issue" and recommend a vet or agriculture officer.
- Keep total output concise. Use simple, non-technical language.
- All money figures in INR (Rs).
- Return ONLY valid JSON matching this shape, no markdown, no preamble:
{"current_state": "...", "projection": "...", "pattern_insights": ["...", "..."]}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { farmId } = await req.json();
    if (!farmId) {
      return new Response(JSON.stringify({ error: "farmId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Use the caller's own auth token so RLS policies apply normally —
    // a user can only ever build a twin for their own farm data.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const [farmRes, soilRes, cropsRes, expensesRes, revenueRes, livestockRes, dairyRes, poultryRes, fisheryRes] =
      await Promise.all([
        supabase.from("farms").select("*").eq("id", farmId).maybeSingle(),
        supabase.from("soil_profiles").select("*").eq("farm_id", farmId).order("test_date", { ascending: false }).limit(3),
        supabase.from("crop_records").select("*").eq("farm_id", farmId).order("created_at", { ascending: false }).limit(20),
        supabase.from("expenses").select("*").eq("farm_id", farmId).order("expense_date", { ascending: false }).limit(50),
        supabase.from("revenue").select("*").eq("farm_id", farmId).order("revenue_date", { ascending: false }).limit(50),
        supabase.from("livestock").select("*").eq("farm_id", farmId).limit(20),
        supabase.from("dairy_records").select("*").eq("farm_id", farmId).order("record_date", { ascending: false }).limit(30),
        supabase.from("poultry").select("*").eq("farm_id", farmId).limit(20),
        supabase.from("fisheries").select("*").eq("farm_id", farmId).limit(20),
      ]);

    if (farmRes.error || !farmRes.data) {
      return new Response(JSON.stringify({ error: "Farm not found or access denied" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const snapshot = {
      farm: farmRes.data,
      soil_history: soilRes.data ?? [],
      crops: cropsRes.data ?? [],
      expenses: expensesRes.data ?? [],
      revenue: revenueRes.data ?? [],
      livestock: livestockRes.data ?? [],
      dairy_history: dairyRes.data ?? [],
      poultry: poultryRes.data ?? [],
      fisheries: fisheryRes.data ?? [],
      generated_at: new Date().toISOString(),
    };

    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiKey) {
      return new Response(JSON.stringify({
        current_state: "AI twin is not configured yet — add a GEMINI_API_KEY to enable this feature.",
        projection: "Not available without an AI key.",
        pattern_insights: ["Add GEMINI_API_KEY as a Supabase secret to enable personalized twin analysis."],
        raw_snapshot: snapshot,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: TWIN_SYSTEM_PROMPT }] },
        contents: [
          { role: "user", parts: [{ text: `Here is the farm data snapshot:\n${JSON.stringify(snapshot)}` }] },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", errText);
      return new Response(JSON.stringify({
        current_state: "AI twin is temporarily unavailable.",
        projection: "Please try again shortly.",
        pattern_insights: [],
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        current_state: text,
        projection: "",
        pattern_insights: [],
      };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import cropData from "./crop_data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Row = { N: number; P: number; K: number; temperature: number; humidity: number; ph: number; rainfall: number; label: string };
type Dataset = { rows: Row[]; means: Record<string, number>; stdevs: Record<string, number> };

const FIELDS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"] as const;

// Bundled at deploy time via the import above — no filesystem read needed at runtime.
const cachedData: Dataset = cropData as Dataset;

function standardize(row: Record<string, number>, means: Record<string, number>, stdevs: Record<string, number>) {
  return FIELDS.map((f) => (row[f] - means[f]) / (stdevs[f] || 1));
}

function knnPredict(input: Record<string, number>, data: Dataset, k = 5) {
  const target = standardize(input, data.means, data.stdevs);
  const distances = data.rows.map((r) => {
    const v = standardize(r as unknown as Record<string, number>, data.means, data.stdevs);
    let sum = 0;
    for (let i = 0; i < v.length; i++) {
      const diff = v[i] - target[i];
      sum += diff * diff;
    }
    return { dist: Math.sqrt(sum), label: r.label };
  });
  distances.sort((a, b) => a.dist - b.dist);
  const top = distances.slice(0, k);

  const votes: Record<string, number> = {};
  for (const t of top) {
    votes[t.label] = (votes[t.label] ?? 0) + 1;
  }
  const ranked = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const [bestLabel, bestVotes] = ranked[0];

  return {
    prediction: bestLabel,
    confidence: Math.round((bestVotes / k) * 100),
    alternatives: ranked.slice(1, 3).map(([label, votes]) => ({ label, votes })),
  };
}

function validateInput(body: unknown): { ok: true; value: Record<string, number> } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Request body must be a JSON object." };
  const b = body as Record<string, unknown>;
  const value: Record<string, number> = {};
  for (const f of FIELDS) {
    const v = b[f];
    if (typeof v !== "number" || Number.isNaN(v)) {
      return { ok: false, error: `Missing or invalid numeric field: ${f}` };
    }
    value[f] = v;
  }
  return { ok: true, value };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = validateInput(body);
    if (!validation.ok) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = knnPredict(validation.value, cachedData, 5);

    return new Response(
      JSON.stringify({
        ...result,
        note: "Statistical estimate from a machine-learning model trained on historical soil/climate data (~96% test accuracy). Not a substitute for local agronomic advice.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FlaskRound, Loader2, Sparkles, Leaf } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { SoilProfile } from '@/types/database';

// Dataset-average defaults, used until the farmer's own soil data overrides them.
const DEFAULTS = {
  N: 50, P: 53, K: 48, temperature: 26, humidity: 71, ph: 6.5, rainfall: 103,
};

type PredictResult = {
  prediction: string;
  confidence: number;
  alternatives: { label: string; votes: number }[];
  note: string;
};

export default function PredictCropPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm } = useFarm();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    (async () => {
      if (!activeFarm) return;
      const { data } = await supabase
        .from('soil_profiles')
        .select('*')
        .eq('farm_id', activeFarm.id)
        .order('test_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      const soil = data as SoilProfile | null;
      if (soil) {
        setForm((f) => ({
          ...f,
          ph: soil.ph ?? f.ph,
          N: soil.nitrogen ?? f.N,
          P: soil.phosphorus ?? f.P,
          K: soil.potassium ?? f.K,
        }));
        setPrefilled(true);
      }
    })();
  }, [activeFarm]);

  const handleChange = (key: keyof typeof form, value: string) => {
    const num = parseFloat(value);
    setForm((f) => ({ ...f, [key]: Number.isNaN(num) ? 0 : num }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/crop-predictor`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as PredictResult;
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || 'Could not get a prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof typeof form; label: string; unit: string; step: string }[] = [
    { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', step: '1' },
    { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', step: '1' },
    { key: 'K', label: 'Potassium (K)', unit: 'kg/ha', step: '1' },
    { key: 'temperature', label: 'Temperature', unit: '°C', step: '0.1' },
    { key: 'humidity', label: 'Humidity', unit: '%', step: '0.1' },
    { key: 'ph', label: 'Soil pH', unit: '', step: '0.1' },
    { key: 'rainfall', label: 'Rainfall', unit: 'mm', step: '1' },
  ];

  return (
    <>
      <PageHeader
        icon={FlaskRound}
        title="AI Crop Predictor"
        description="Get a data-driven crop suggestion based on soil nutrients and climate conditions."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Enter your conditions"
          description={prefilled ? 'Pre-filled from your latest soil test — adjust as needed.' : 'Using typical average values — adjust to match your farm.'}
        >
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label} {f.unit && <span className="text-muted-foreground">({f.unit})</span>}</Label>
                <Input
                  id={f.key}
                  type="number"
                  step={f.step}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full gap-2" onClick={handlePredict} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={16} /> Predict best crop</>}
          </Button>
        </SectionCard>

        <SectionCard title="Prediction">
          {!result && !loading && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-muted-foreground">
              <Leaf size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Enter your soil and climate data, then click Predict.</p>
            </div>
          )}
          {loading && (
            <div className="flex h-full min-h-[200px] items-center justify-center">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary/10 p-5 text-center">
                <p className="text-sm text-muted-foreground">Recommended crop</p>
                <p className="mt-1 font-display text-3xl font-bold capitalize text-primary">{result.prediction}</p>
                <Badge variant="outline" className="mt-2">{result.confidence}% model confidence</Badge>
              </div>
              {result.alternatives.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Other close matches</p>
                  <div className="flex flex-wrap gap-2">
                    {result.alternatives.map((a) => (
                      <Badge key={a.label} variant="outline" className="capitalize">{a.label}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <Disclaimer>{result.note}</Disclaimer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <Disclaimer>
          This tool uses a machine-learning model (k-nearest neighbors) trained on a public dataset of
          2,200 real soil/climate records covering 22 crops, with ~96% accuracy on held-out test data.
          It is a statistical estimate, not a substitute for a soil test report or local agricultural
          officer&apos;s advice.
        </Disclaimer>
      </div>
    </>
  );
}

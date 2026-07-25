'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Loader2, Sprout, Droplets, Wallet, TrendingUp, Scale, CloudRain, FlaskConical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer, StatCard } from '@/components/app/ui';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { CropCatalog } from '@/types/database';
import { recommendCrops, simulate, ScoredCrop } from '@/lib/recommendations';
import { SEASONS, formatCurrency } from '@/lib/constants';

export default function SimulatorPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm } = useFarm();
  const [catalog, setCatalog] = useState<CropCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [landArea, setLandArea] = useState(activeFarm?.land_area?.toString() ?? '1');
  const [season, setSeason] = useState('kharif');
  const [rainfallChange, setRainfallChange] = useState(0);
  const [fertilizerPriceChange, setFertilizerPriceChange] = useState(0);
  const [marketPriceChange, setMarketPriceChange] = useState(0);
  const [irrigationReduction, setIrrigationReduction] = useState(0);
  const [selectedCropId, setSelectedCropId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('crop_catalog').select('*').order('crop_name');
      setCatalog((data as CropCatalog[]) ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (activeFarm?.land_area) setLandArea(activeFarm.land_area.toString());
  }, [activeFarm]);

  const scored: ScoredCrop[] = useMemo(() => {
    if (catalog.length === 0) return [];
    const area = Number(landArea) || 1;
    return recommendCrops(catalog, {
      soilType: activeFarm?.soil_type ?? null,
      waterAvailability: activeFarm?.water_availability ?? null,
      season,
      budget: null,
      landArea: area,
      experience: null,
    }).slice(0, 6);
  }, [catalog, activeFarm, season, landArea]);

  const selectedCrop = scored.find((c) => c.id === selectedCropId) ?? scored[0];

  const scenarios = useMemo(() => {
    return scored.map((crop) => simulate({
      crop,
      rainfallChange,
      fertilizerPriceChange,
      marketPriceChange,
      irrigationReduction,
    }));
  }, [scored, rainfallChange, fertilizerPriceChange, marketPriceChange, irrigationReduction]);

  const chartData = useMemo(() => {
    return scored.map((crop, i) => ({
      name: crop.crop_name,
      Investment: scenarios[i].adjustedInvestment ?? 0,
      Revenue: scenarios[i].adjustedRevenue ?? 0,
      Profit: scenarios[i].adjustedProfit ?? 0,
    }));
  }, [scored, scenarios]);

  const selectedScenario = selectedCrop ? scenarios[scored.findIndex((c) => c.id === selectedCrop.id)] : null;

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Farm Simulator" description="Compare options and run What-If scenarios — all estimates" icon={Calculator} />

      <SectionCard title="Your inputs" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Land area</Label><Input type="number" step="0.01" min={0} value={landArea} onChange={(e) => setLandArea(e.target.value)} /></div>
          <div className="space-y-2"><Label>Season</Label><Select value={season} onValueChange={setSeason}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SEASONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Soil (from farm)</Label><div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">{activeFarm?.soil_type ?? 'Not set'}</div></div>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="What-If scenarios" description="Adjust sliders to simulate changes" className="lg:col-span-1">
          <div className="space-y-5">
            <SliderControl icon={CloudRain} label="Rainfall change" value={rainfallChange} min={-50} max={20} suffix="%" onChange={setRainfallChange} />
            <SliderControl icon={FlaskConical} label="Fertilizer price change" value={fertilizerPriceChange} min={-20} max={50} suffix="%" onChange={setFertilizerPriceChange} />
            <SliderControl icon={TrendingUp} label="Market price change" value={marketPriceChange} min={-30} max={30} suffix="%" onChange={setMarketPriceChange} />
            <SliderControl icon={Droplets} label="Irrigation reduction" value={irrigationReduction} min={0} max={50} suffix="%" onChange={setIrrigationReduction} />
          </div>
          <Disclaimer>Simulation results are estimates based on assumptions. Not guarantees of actual outcome.</Disclaimer>
        </SectionCard>

        <SectionCard title="Comparison (per your land area)" className="lg:col-span-2">
          {chartData.length === 0 ? (
            <EmptyState icon={Calculator} title="No crops to compare" description="Add a farm with soil and water data to get comparisons." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Investment" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {selectedCrop && selectedScenario && (
        <div className="mt-6">
          <SectionCard title="Detailed breakdown" description="Select a crop to see its scenario details" action={
            <Select value={selectedCropId || selectedCrop.id} onValueChange={setSelectedCropId}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{scored.map((c) => <SelectItem key={c.id} value={c.id}>{c.crop_name}</SelectItem>)}</SelectContent>
            </Select>
          }>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Adjusted investment (est.)" value={formatCurrency(selectedScenario.adjustedInvestment)} icon={Wallet} tone="destructive" />
              <StatCard label="Adjusted revenue (est.)" value={formatCurrency(selectedScenario.adjustedRevenue)} icon={TrendingUp} tone="success" />
              <StatCard label="Adjusted profit (est.)" value={formatCurrency(selectedScenario.adjustedProfit)} icon={Scale} tone={selectedScenario.adjustedProfit >= 0 ? 'success' : 'destructive'} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">Crop profile</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Water need:</span> <span className="font-medium text-foreground capitalize">{selectedCrop.water_requirement}</span></p>
                  <p><span className="text-muted-foreground">Growing period:</span> <span className="font-medium text-foreground">{selectedCrop.growing_period_days} days</span></p>
                  <p><span className="text-muted-foreground">Risk level:</span> <span className="font-medium text-foreground capitalize">{selectedCrop.risk_level}</span></p>
                  <p><span className="text-muted-foreground">Difficulty:</span> <span className="font-medium text-foreground capitalize">{selectedCrop.difficulty}</span></p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">Scenario notes</p>
                <ul className="mt-2 space-y-1 text-xs text-foreground">
                  {selectedScenario.notes.length > 0 ? selectedScenario.notes.map((n, i) => <li key={i}>• {n}</li>) : <li className="text-muted-foreground">No adjustments applied — showing base estimates.</li>}
                </ul>
              </div>
            </div>
            {selectedCrop.description && <p className="mt-4 text-sm text-muted-foreground">{selectedCrop.description}</p>}
          </SectionCard>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scored.slice(0, 6).map((crop, i) => (
          <div key={crop.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{crop.crop_name}</p>
              <Badge variant="outline" className={crop.risk_level === 'low' ? 'border-success/30 text-success' : crop.risk_level === 'high' ? 'border-destructive/30 text-destructive' : 'border-warning/30 text-warning'}>{crop.risk_level}</Badge>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Investment</span><span className="font-medium text-foreground">{formatCurrency(scenarios[i].adjustedInvestment)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-medium text-foreground">{formatCurrency(scenarios[i].adjustedRevenue)}</span></div>
              <div className="flex justify-between border-t border-border pt-1"><span className="text-muted-foreground">Profit</span><span className={`font-bold ${scenarios[i].adjustedProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(scenarios[i].adjustedProfit)}</span></div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Droplets size={12} /> {crop.water_requirement} water</div>
          </div>
        ))}
      </div>
      <Disclaimer>Estimated values are based on available reference data. Actual results depend on weather, management, market prices and many other factors.</Disclaimer>
    </div>
  );
}

function SliderControl({ icon: Icon, label, value, min, max, suffix, onChange }: {
  icon: LucideIcon;
  label: string; value: number; min: number; max: number; suffix: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-sm"><Icon size={14} /> {label}</Label>
        <span className={`text-sm font-semibold ${value < 0 ? 'text-destructive' : value > 0 ? 'text-success' : 'text-foreground'}`}>{value > 0 ? '+' : ''}{value}{suffix}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={5} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

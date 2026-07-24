'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, Loader2, Sprout, Droplets, Calendar, Wallet, AlertTriangle, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFarm } from '@/components/providers/farm-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { CropCatalog } from '@/types/database';
import { recommendCrops, ScoredCrop } from '@/lib/recommendations';
import { SEASONS, formatCurrency } from '@/lib/constants';

const RISK_TONE: Record<string, string> = {
  low: 'border-success/30 text-success',
  medium: 'border-warning/30 text-warning',
  high: 'border-destructive/30 text-destructive',
};

export default function RecommendationsPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm } = useFarm();
  const { profile } = useAuth();
  const [catalog, setCatalog] = useState<CropCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<string>('kharif');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('crop_catalog').select('*').order('crop_name');
      if (error) console.error(error);
      setCatalog((data as CropCatalog[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const recommendations: ScoredCrop[] = useMemo(() => {
    if (catalog.length === 0) return [];
    return recommendCrops(catalog, {
      soilType: activeFarm?.soil_type ?? null,
      waterAvailability: activeFarm?.water_availability ?? null,
      season,
      budget: profile?.budget ?? null,
      landArea: activeFarm?.land_area ?? null,
      experience: profile?.experience ?? null,
    });
  }, [catalog, activeFarm, profile, season]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Crop Recommendations" description="Transparent, rule-based matching to your farm conditions" icon={Lightbulb} />

      <SectionCard title="Your conditions" description="Pulled from your farm profile. Change season below." className="mb-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <ConditionItem icon={Sprout} label="Soil" value={activeFarm?.soil_type ?? 'Not set'} />
          <ConditionItem icon={Droplets} label="Water" value={activeFarm?.water_availability ?? 'Not set'} />
          <ConditionItem icon={Wallet} label="Budget" value={formatCurrency(profile?.budget)} />
          <div>
            <Label className="text-xs text-muted-foreground">Season</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{SEASONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Disclaimer>Recommendations use a transparent scoring system based on soil, water, season, budget and experience. Not a guarantee of success.</Disclaimer>
      </SectionCard>

      {recommendations.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No recommendations" description="Set up your farm profile to get recommendations." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((c) => <CropRecCard key={c.id} crop={c} />)}
        </div>
      )}
    </div>
  );
}

function ConditionItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon size={14} /> {label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CropRecCard({ crop }: { crop: ScoredCrop }) {
  const tone = RISK_TONE[crop.risk_level] ?? '';
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">{crop.crop_name}</p>
          <Badge variant="secondary" className="mt-1 capitalize">{crop.category}</Badge>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-primary">{crop.suitabilityScore}</p>
          <p className="text-xs text-muted-foreground">suitability</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted/40 p-2.5"><p className="text-xs text-muted-foreground">Est. investment/ac</p><p className="font-semibold text-foreground">{formatCurrency(crop.estimated_investment_per_acre)}</p></div>
        <div className="rounded-lg bg-muted/40 p-2.5"><p className="text-xs text-muted-foreground">Est. revenue/ac</p><p className="font-semibold text-foreground">{formatCurrency(crop.estimated_revenue_per_acre)}</p></div>
        <div className="rounded-lg bg-muted/40 p-2.5"><p className="text-xs text-muted-foreground">Growing period</p><p className="font-semibold text-foreground">{crop.growing_period_days} days</p></div>
        <div className="rounded-lg bg-muted/40 p-2.5"><p className="text-xs text-muted-foreground">Water need</p><p className="font-semibold text-foreground capitalize">{crop.water_requirement}</p></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className={tone}><AlertTriangle size={12} className="mr-1" /> {crop.risk_level} risk</Badge>
        <Badge variant="outline" className="capitalize"><Star size={12} className="mr-1" /> {crop.difficulty}</Badge>
        <Badge variant="outline"><Calendar size={12} className="mr-1" /> {crop.suitable_seasons.join(', ')}</Badge>
      </div>
      <div className="mt-3 rounded-lg bg-muted/40 p-3">
        <p className="text-xs font-medium text-muted-foreground">Why this match</p>
        <ul className="mt-1 space-y-0.5 text-xs text-foreground">
          {crop.reasons.map((r, i) => <li key={i}>• {r}</li>)}
        </ul>
      </div>
      {crop.description && <p className="mt-3 text-xs text-muted-foreground">{crop.description}</p>}
    </div>
  );
}

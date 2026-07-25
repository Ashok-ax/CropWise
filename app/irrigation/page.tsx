'use client';

import { Droplets, Waves, Sprout } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, Disclaimer } from '@/components/app/ui';
import { Badge } from '@/components/ui/badge';
import { useFarm } from '@/components/providers/farm-provider';


export default function IrrigationPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm, crops } = useFarm();
  const waterNeedMap: Record<string, string> = {
    Rice: 'high', Sugarcane: 'high', Banana: 'high',
    Wheat: 'medium', Maize: 'medium', Cotton: 'medium', Soybean: 'medium', Tomato: 'medium', Onion: 'medium',
    Groundnut: 'low', 'Bengal Gram': 'low', Mango: 'low',
  };

  const activeCrops = crops.filter((c) => c.status !== 'harvested' && c.status !== 'failed');

  const irrigationSchedule = activeCrops.map((c) => {
    const need = waterNeedMap[c.crop_name] ?? 'medium';
    let frequency = '';
    if (need === 'high') frequency = 'Daily or every 2 days';
    else if (need === 'medium') frequency = 'Every 4-7 days';
    else frequency = 'Every 7-14 days';
    return { crop: c, need, frequency };
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Irrigation Management" description="Water guidance based on your crops and irrigation type" icon={Droplets} />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Your irrigation setup" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-xs text-muted-foreground">Water availability</dt><dd className="font-medium text-foreground">{activeFarm?.water_availability ?? 'Not set'}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Irrigation type</dt><dd className="font-medium text-foreground">{activeFarm?.irrigation_type ?? 'Not set'}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Active crops</dt><dd className="font-medium text-foreground">{activeCrops.length}</dd></div>
          </dl>
        </SectionCard>

        <SectionCard title="Crop water needs" description="Estimated frequency — adjust for weather" className="lg:col-span-2">
          {irrigationSchedule.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active crops. Add crops to see irrigation schedules.</p>
          ) : (
            <div className="space-y-3">
              {irrigationSchedule.map(({ crop, need, frequency }) => (
                <div key={crop.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Sprout size={18} className="text-primary" />
                    <div><p className="text-sm font-semibold text-foreground">{crop.crop_name}</p><p className="text-xs text-muted-foreground">{crop.area ?? '—'} {crop.area_unit} · {crop.growth_stage ?? 'no stage'}</p></div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={need === 'high' ? 'border-chart-3/30 text-chart-3' : need === 'low' ? 'border-success/30 text-success' : 'border-warning/30 text-warning'}>{need} water</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SectionCard title="Water-saving tips">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <span className="font-medium text-foreground">Drip irrigation</span> saves 30-60% water vs flood. Subsidies available under PMKSY.</li>
            <li>• <span className="font-medium text-foreground">Mulching</span> with straw or plastic reduces evaporation by up to 50%.</li>
            <li>• Water early morning or late evening to minimize evaporation loss.</li>
            <li>• <span className="font-medium text-foreground">Rainwater harvesting</span> structures recharge borewells and reduce dependence.</li>
          </ul>
        </SectionCard>
        <SectionCard title="Irrigation methods compared">
          <div className="space-y-2 text-sm">
            <div className="rounded-lg bg-muted/40 p-3"><p className="font-medium text-foreground">Drip</p><p className="text-xs text-muted-foreground">Most efficient. Best for vegetables, fruits, sugarcane.</p></div>
            <div className="rounded-lg bg-muted/40 p-3"><p className="font-medium text-foreground">Sprinkler</p><p className="text-xs text-muted-foreground">Good for wheat, pulses. Moderate efficiency.</p></div>
            <div className="rounded-lg bg-muted/40 p-3"><p className="font-medium text-foreground">Flood/Furrow</p><p className="text-xs text-muted-foreground">Traditional. Low efficiency, high water use.</p></div>
          </div>
        </SectionCard>
      </div>
      <Disclaimer>Water needs vary by growth stage, soil and weather. Check weather and soil moisture before irrigating.</Disclaimer>
    </div>
  );
}

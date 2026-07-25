'use client';

import { FlaskConical, Sprout } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Badge } from '@/components/ui/badge';
import { useFarm } from '@/components/providers/farm-provider';

const CROP_FERTILIZER: Record<string, { npk: string; notes: string }> = {
  Rice: { npk: 'N:P:K = 120:60:60 kg/ha', notes: 'Apply 50% N at basal, 25% at tillering, 25% at panicle initiation. Apply zinc sulphate if deficiency observed.' },
  Wheat: { npk: 'N:P:K = 120:60:40 kg/ha', notes: 'Half N at sowing, remaining in two splits at crown root initiation and flowering.' },
  Maize: { npk: 'N:P:K = 120:60:40 kg/ha', notes: 'Apply N in 3-4 splits. Zinc is often required.' },
  Cotton: { npk: 'N:P:K = 150:75:75 kg/ha', notes: 'Split N across square formation, flowering and boll development.' },
  Sugarcane: { npk: 'N:P:K = 175:90:60 kg/ha', notes: 'Apply N in splits through the grand growth phase.' },
  Groundnut: { npk: 'N:P:K = 25:50:75 kg/ha', notes: 'Apply gypsum for calcium. Rhizobium inoculation reduces N need.' },
  Tomato: { npk: 'N:P:K = 120:80:80 kg/ha', notes: 'Fertigation recommended. Apply boron and calcium to prevent blossom-end rot.' },
  Onion: { npk: 'N:P:K = 100:50:100 kg/ha', notes: 'Sulphur improves pungency and bulb quality.' },
  Banana: { npk: 'N:P:K = 200:60:200 g/plant', notes: 'Apply in 4 splits. Potassium critical for fruit quality.' },
  Soybean: { npk: 'N:P:K = 30:60:40 kg/ha', notes: 'Rhizobium inoculation supplies N. Apply sulphur and molybdenum.' },
  'Bengal Gram': { npk: 'N:P:K = 20:50:30 kg/ha', notes: 'Phosphorus important. Rhizobium inoculation recommended.' },
};

export default function FertilizerPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm, crops } = useFarm();
  const activeCrops = crops.filter((c) => c.status !== 'harvested' && c.status !== 'failed');

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Fertilizer Guide" description="General NPK recommendations and tips" icon={FlaskConical} />

      <SectionCard title="Soil-based advice" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs font-medium text-muted-foreground">Your soil type</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{activeFarm?.soil_type ?? 'Not set'}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            Always base fertilizer rates on a <span className="font-medium text-foreground">soil test</span>. The figures below are general recommendations — your actual needs may differ.
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recommendations for your crops">
        {activeCrops.length === 0 ? (
          <EmptyState icon={Sprout} title="No active crops" description="Add crops to get fertilizer recommendations." />
        ) : (
          <div className="space-y-3">
            {activeCrops.map((c) => {
              const rec = CROP_FERTILIZER[c.crop_name];
              return (
                <div key={c.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Sprout size={18} className="text-primary" /><p className="font-semibold text-foreground">{c.crop_name}</p></div>
                    <Badge variant="secondary">{c.area ?? '—'} {c.area_unit}</Badge>
                  </div>
                  {rec ? (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-foreground">NPK: {rec.npk}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{rec.notes}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No specific recommendation for this crop. Consult your local agriculture officer.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SectionCard title="General tips">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Split nitrogen into 2-3 doses to reduce losses.</li>
            <li>• Apply phosphorus and potassium basally at sowing.</li>
            <li>• Use organic manure (FYM/compost) along with chemical fertilizers.</li>
            <li>• Apply micronutrients (zinc, boron, iron) only if soil test shows deficiency.</li>
            <li>• Avoid applying fertilizer before heavy rain to prevent runoff.</li>
          </ul>
        </SectionCard>
        <SectionCard title="Organic alternatives">
          <div className="space-y-2 text-sm">
            <div className="rounded-lg bg-muted/40 p-3"><p className="font-medium text-foreground">Farmyard manure (FYM)</p><p className="text-xs text-muted-foreground">10-15 t/ha improves soil structure and water retention.</p></div>
            <div className="rounded-lg bg-muted/40 p-3"><p className="font-medium text-foreground">Vermicompost</p><p className="text-xs text-muted-foreground">2-5 t/ha rich in nutrients and microbes.</p></div>
            <div className="rounded-lg bg-muted/40 p-3"><p className="font-medium text-foreground">Green manure</p><p className="text-xs text-muted-foreground">Dhaincha, sunhemp add nitrogen and organic matter.</p></div>
          </div>
        </SectionCard>
      </div>
      <Disclaimer>Recommendations are general guidelines from ICAR handbooks. Always confirm with a soil test and local agriculture officer.</Disclaimer>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LandPlot, MapPin, Ruler, Leaf, Sprout, Droplets, Waves, Save, Loader2, Pencil } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { SOIL_TYPES, AREA_UNITS, WATER_AVAILABILITY, IRRIGATION_TYPES, formatCurrency } from '@/lib/constants';
import { CropRecord, Livestock, Poultry, Fishery } from '@/types/database';

export default function MyFarmPage() {
  return <AppShell><FarmContent /></AppShell>;
}

function FarmContent() {
  const { profile } = useAuth();
  const { activeFarm, refresh, crops } = useFarm();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [poultry, setPoultry] = useState<Poultry[]>([]);
  const [fisheries, setFisheries] = useState<Fishery[]>([]);

  const [form, setForm] = useState({
    name: '', location: '', latitude: '', longitude: '', land_area: '',
    area_unit: 'acres', soil_type: '', water_availability: '', irrigation_type: '',
  });

  useEffect(() => {
    if (activeFarm) {
      setForm({
        name: activeFarm.name,
        location: activeFarm.location ?? '',
        latitude: activeFarm.latitude?.toString() ?? '',
        longitude: activeFarm.longitude?.toString() ?? '',
        land_area: activeFarm.land_area?.toString() ?? '',
        area_unit: activeFarm.area_unit,
        soil_type: activeFarm.soil_type ?? '',
        water_availability: activeFarm.water_availability ?? '',
        irrigation_type: activeFarm.irrigation_type ?? '',
      });
    }
  }, [activeFarm]);

  useEffect(() => {
    if (!activeFarm) return;
    (async () => {
      const [l, p, f] = await Promise.all([
        supabase.from('livestock').select('*').eq('farm_id', activeFarm.id),
        supabase.from('poultry').select('*').eq('farm_id', activeFarm.id),
        supabase.from('fisheries').select('*').eq('farm_id', activeFarm.id),
      ]);
      setLivestock((l.data as Livestock[]) ?? []);
      setPoultry((p.data as Poultry[]) ?? []);
      setFisheries((f.data as Fishery[]) ?? []);
    })();
  }, [activeFarm]);

  const save = async () => {
    if (!activeFarm) return;
    setSaving(true);
    const { error } = await supabase
      .from('farms')
      .update({
        name: form.name.trim(),
        location: form.location || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        land_area: form.land_area ? Number(form.land_area) : null,
        area_unit: form.area_unit,
        soil_type: form.soil_type || null,
        water_availability: form.water_availability || null,
        irrigation_type: form.irrigation_type || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeFarm.id);
    if (error) toast.error('Could not save: ' + error.message);
    else {
      toast.success('Farm updated.');
      setEditing(false);
      refresh();
    }
    setSaving(false);
  };

  if (!activeFarm) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="My Farm" description="Your digital farm profile" icon={LandPlot} />
        <EmptyState icon={LandPlot} title="No farm yet" description="Complete onboarding to create your farm." />
      </div>
    );
  }

  const totalBirds = poultry.reduce((s, p) => s + p.bird_count, 0);
  const totalFish = fisheries.reduce((s, f) => s + f.stock_count, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="My Farm"
        description="Your digital farm profile"
        icon={LandPlot}
        action={editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving} className="gap-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1"><Pencil size={14} /> Edit</Button>
        )}
      />

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryItem icon={Ruler} label="Land area" value={`${activeFarm.land_area ?? '—'} ${activeFarm.area_unit}`} />
        <SummaryItem icon={Leaf} label="Soil" value={activeFarm.soil_type ?? '—'} />
        <SummaryItem icon={Sprout} label="Crops" value={String(crops.length)} />
        <SummaryItem icon={Waves} label="Irrigation" value={activeFarm.irrigation_type ?? '—'} />
      </div>

      {editing ? (
        <SectionCard title="Edit farm details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Farm name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Village, District, State" /></div>
            <div className="space-y-2"><Label>Latitude (for weather)</Label><Input type="number" step="0.000001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. 11.0168" /></div>
            <div className="space-y-2"><Label>Longitude (for weather)</Label><Input type="number" step="0.000001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. 76.9558" /></div>
            <div className="space-y-2"><Label>Land area</Label><Input type="number" step="0.01" value={form.land_area} onChange={(e) => setForm({ ...form, land_area: e.target.value })} /></div>
            <div className="space-y-2"><Label>Unit</Label><Select value={form.area_unit} onValueChange={(v) => setForm({ ...form, area_unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AREA_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Soil type</Label><Select value={form.soil_type} onValueChange={(v) => setForm({ ...form, soil_type: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{SOIL_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Water availability</Label><Select value={form.water_availability} onValueChange={(v) => setForm({ ...form, water_availability: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{WATER_AVAILABILITY.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2 sm:col-span-2"><Label>Irrigation type</Label><Select value={form.irrigation_type} onValueChange={(v) => setForm({ ...form, irrigation_type: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{IRRIGATION_TYPES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <Disclaimer>Add latitude and longitude to enable accurate weather forecasts. Find them via Google Maps by right-clicking your location.</Disclaimer>
        </SectionCard>
      ) : (
        <SectionCard title="Farm details">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Detail label="Farm name" value={activeFarm.name} />
            <Detail label="Location" value={activeFarm.location ?? 'Not set'} icon={MapPin} />
            <Detail label="Coordinates" value={activeFarm.latitude && activeFarm.longitude ? `${activeFarm.latitude}, ${activeFarm.longitude}` : 'Not set (add for weather)'} />
            <Detail label="Land area" value={`${activeFarm.land_area ?? '—'} ${activeFarm.area_unit}`} icon={Ruler} />
            <Detail label="Soil type" value={activeFarm.soil_type ?? 'Not set'} icon={Leaf} />
            <Detail label="Water availability" value={activeFarm.water_availability ?? 'Not set'} icon={Droplets} />
            <Detail label="Irrigation type" value={activeFarm.irrigation_type ?? 'Not set'} icon={Waves} />
            <Detail label="Budget" value={formatCurrency(profile?.budget)} />
          </dl>
        </SectionCard>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <SectionCard title="Farming activities" description="Overview of all your activities">
          <div className="space-y-2">
            <ActivityRow label="Crops" count={crops.length} />
            <ActivityRow label="Livestock" count={livestock.length} />
            <ActivityRow label="Poultry (total birds)" count={totalBirds} />
            <ActivityRow label="Fisheries (total fish)" count={totalFish} />
          </div>
        </SectionCard>

        <SectionCard title="Current crops" action={<Button asChild size="sm" variant="outline"><a href="/app/crops">Manage</a></Button>}>
          {crops.length === 0 ? (
            <p className="text-sm text-muted-foreground">No crops added.</p>
          ) : (
            <div className="space-y-2">
              {crops.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                  <div><p className="text-sm font-medium text-foreground">{c.crop_name}</p><p className="text-xs text-muted-foreground">{c.growth_stage ?? 'No stage'}</p></div>
                  <Badge variant="secondary">{c.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <Disclaimer>Farm location is approximate. All activity data is entered by you and stored privately under your account.</Disclaimer>
    </div>
  );
}


function SummaryItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon size={18} className="text-muted-foreground" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Detail({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">{Icon && <Icon size={14} />}{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function ActivityRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{count}</span>
    </div>
  );
}

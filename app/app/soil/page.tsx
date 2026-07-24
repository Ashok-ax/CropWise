'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Leaf, FlaskConical, Plus, Save, Loader2, Trash2, Lightbulb } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { SoilProfile } from '@/types/database';
import { formatDate } from '@/lib/constants';

const DRAINAGE_OPTIONS = ['Excellent', 'Good', 'Moderate', 'Poor', 'Very poor'];
const MOISTURE_OPTIONS = ['Dry', 'Slightly moist', 'Moist', 'Wet', 'Waterlogged'];

export default function SoilPage() {
  return <AppShell><SoilContent /></AppShell>;
}

function SoilContent() {
  const { activeFarm } = useFarm();
  const [profiles, setProfiles] = useState<SoilProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ph: '', nitrogen: '', phosphorus: '', potassium: '', organic_matter: '',
    moisture: '', drainage: '', test_date: new Date().toISOString().slice(0, 10), notes: '',
  });

  useEffect(() => {
    if (!activeFarm) return;
    (async () => {
      const { data, error } = await supabase
        .from('soil_profiles')
        .select('*')
        .eq('farm_id', activeFarm.id)
        .order('test_date', { ascending: false });
      if (error) toast.error('Could not load soil data.');
      setProfiles((data as SoilProfile[]) ?? []);
      setLoading(false);
    })();
  }, [activeFarm]);

  const save = async () => {
    if (!activeFarm) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('soil_profiles')
      .insert({
        farm_id: activeFarm.id,
        ph: form.ph ? Number(form.ph) : null,
        nitrogen: form.nitrogen ? Number(form.nitrogen) : null,
        phosphorus: form.phosphorus ? Number(form.phosphorus) : null,
        potassium: form.potassium ? Number(form.potassium) : null,
        organic_matter: form.organic_matter ? Number(form.organic_matter) : null,
        moisture: form.moisture || null,
        drainage: form.drainage || null,
        test_date: form.test_date || null,
        notes: form.notes || null,
      })
      .select()
      .maybeSingle();
    if (error || !data) {
      toast.error('Could not save: ' + (error?.message ?? 'unknown'));
    } else {
      setProfiles([data as SoilProfile, ...profiles]);
      toast.success('Soil test saved.');
      setShowForm(false);
      setForm({ ph: '', nitrogen: '', phosphorus: '', potassium: '', organic_matter: '', moisture: '', drainage: '', test_date: new Date().toISOString().slice(0, 10), notes: '' });
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('soil_profiles').delete().eq('id', id);
    if (error) toast.error('Delete failed.');
    else { setProfiles(profiles.filter((p) => p.id !== id)); toast.success('Deleted.'); }
  };

  const latest = profiles[0];

  const insights = (() => {
    if (!latest) return [];
    const tips: { title: string; desc: string; tone: 'success' | 'warning' | 'destructive' }[] = [];
    if (latest.ph != null) {
      if (latest.ph < 5.5) tips.push({ title: 'Soil is acidic', desc: 'Apply agricultural lime to raise pH. Acidic soils reduce nutrient availability.', tone: 'warning' });
      else if (latest.ph > 8.5) tips.push({ title: 'Soil is alkaline', desc: 'Apply gypsum or sulphur to lower pH. Alkaline soils cause micronutrient deficiency.', tone: 'warning' });
      else tips.push({ title: 'Soil pH is optimal', desc: 'pH in the ideal 5.5-8.5 range supports most crops.', tone: 'success' });
    }
    if (latest.organic_matter != null && latest.organic_matter < 1) {
      tips.push({ title: 'Low organic matter', desc: 'Add compost or farmyard manure to improve soil fertility and water retention.', tone: 'warning' });
    }
    if (latest.nitrogen != null && latest.nitrogen < 50) {
      tips.push({ title: 'Low nitrogen', desc: 'Apply nitrogen fertilizer (urea) in split doses. Consider legumes in crop rotation.', tone: 'destructive' });
    }
    if (latest.drainage === 'Poor' || latest.drainage === 'Very poor') {
      tips.push({ title: 'Poor drainage', desc: 'Improve drainage with trenches or raised beds. Avoid water-sensitive crops.', tone: 'warning' });
    }
    if (tips.length === 0) tips.push({ title: 'Soil looks balanced', desc: 'Maintain regular soil testing every 2 years and apply balanced NPK.', tone: 'success' });
    return tips;
  })();

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Land & Soil"
        description="Soil health, nutrients, and improvement tips"
        icon={Leaf}
        action={<Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1"><Plus size={14} /> {showForm ? 'Cancel' : 'Add soil test'}</Button>}
      />

      {!activeFarm ? (
        <EmptyState icon={Leaf} title="No farm" description="Complete onboarding to manage soil." />
      ) : (
        <>
          {showForm && (
            <SectionCard title="New soil test" description="Enter values from your soil test report. Leave blank if unknown." className="mb-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>pH (0-14)</Label><Input type="number" step="0.01" value={form.ph} onChange={(e) => setForm({ ...form, ph: e.target.value })} placeholder="e.g. 6.8" /></div>
                <div className="space-y-2"><Label>Nitrogen (kg/ha)</Label><Input type="number" value={form.nitrogen} onChange={(e) => setForm({ ...form, nitrogen: e.target.value })} placeholder="e.g. 120" /></div>
                <div className="space-y-2"><Label>Phosphorus (kg/ha)</Label><Input type="number" value={form.phosphorus} onChange={(e) => setForm({ ...form, phosphorus: e.target.value })} placeholder="e.g. 45" /></div>
                <div className="space-y-2"><Label>Potassium (kg/ha)</Label><Input type="number" value={form.potassium} onChange={(e) => setForm({ ...form, potassium: e.target.value })} placeholder="e.g. 180" /></div>
                <div className="space-y-2"><Label>Organic matter (%)</Label><Input type="number" step="0.01" value={form.organic_matter} onChange={(e) => setForm({ ...form, organic_matter: e.target.value })} placeholder="e.g. 1.5" /></div>
                <div className="space-y-2"><Label>Test date</Label><Input type="date" value={form.test_date} onChange={(e) => setForm({ ...form, test_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>Moisture</Label><Select value={form.moisture} onValueChange={(v) => setForm({ ...form, moisture: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{MOISTURE_OPTIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Drainage</Label><Select value={form.drainage} onValueChange={(v) => setForm({ ...form, drainage: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{DRAINAGE_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2 sm:col-span-3"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <div className="mt-4 flex justify-end"><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save test</Button></div>
            </SectionCard>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {profiles.length === 0 ? (
                <EmptyState icon={FlaskConical} title="No soil tests yet" description="Add a soil test to get pH, nutrient analysis and improvement tips." />
              ) : (
                <>
                  <SectionCard title="Latest soil test">
                    <SoilTestView profile={latest} />
                  </SectionCard>
                  <SectionCard title="Soil improvement tips" description="Based on your latest test data">
                    <div className="space-y-3">
                      {insights.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.tone === 'success' ? 'bg-success/10 text-success' : t.tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                            <Lightbulb size={18} />
                          </span>
                          <div><p className="text-sm font-semibold text-foreground">{t.title}</p><p className="text-xs text-muted-foreground">{t.desc}</p></div>
                        </div>
                      ))}
                    </div>
                    <Disclaimer>Tips are general guidance based on entered values. Consult your local agriculture officer for plot-specific recommendations.</Disclaimer>
                  </SectionCard>
                </>
              )}

              {profiles.length > 1 && (
                <SectionCard title="Test history">
                  <div className="space-y-2">
                    {profiles.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                        <div><p className="text-sm font-medium text-foreground">pH {p.ph ?? '—'} · N {p.nitrogen ?? '—'} · P {p.phosphorus ?? '—'} · K {p.potassium ?? '—'}</p><p className="text-xs text-muted-foreground">{formatDate(p.test_date)}</p></div>
                        <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-destructive"><Trash2 size={14} /></Button>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            <SectionCard title="Soil guide" description="If you don't know your values, here's how to find them">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Soil testing:</span> Visit a government soil testing lab or use a home test kit. Free tests are available under the Soil Health Card scheme.</p>
                <p><span className="font-semibold text-foreground">pH range:</span> Most crops prefer 6.0-7.5. Below 5.5 is acidic; above 8.5 is alkaline.</p>
                <p><span className="font-semibold text-foreground">NPK units:</span> kg/ha — kilograms per hectare of available Nitrogen, Phosphorus, Potassium.</p>
                <p><span className="font-semibold text-foreground">Organic matter:</span> &gt;2% is good; below 1% indicates depleted soil.</p>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}

function SoilTestView({ profile }: { profile: SoilProfile }) {
  const nutrients = [
    { label: 'pH', value: profile.ph, unit: '', optimal: '5.5-8.5' },
    { label: 'Nitrogen', value: profile.nitrogen, unit: 'kg/ha', optimal: '120-280' },
    { label: 'Phosphorus', value: profile.phosphorus, unit: 'kg/ha', optimal: '30-60' },
    { label: 'Potassium', value: profile.potassium, unit: 'kg/ha', optimal: '120-300' },
    { label: 'Organic matter', value: profile.organic_matter, unit: '%', optimal: '1.5-3' },
  ];
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Tested on {formatDate(profile.test_date)}</p>
        <Badge variant="secondary">Soil test</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {nutrients.map((n) => (
          <div key={n.label} className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-xs text-muted-foreground">{n.label}</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">{n.value ?? '—'}{n.unit && <span className="text-xs"> {n.unit}</span>}</p>
            <p className="text-xs text-muted-foreground">opt {n.optimal}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/40 p-3 text-sm"><span className="text-muted-foreground">Moisture:</span> <span className="font-medium text-foreground">{profile.moisture ?? '—'}</span></div>
        <div className="rounded-lg bg-muted/40 p-3 text-sm"><span className="text-muted-foreground">Drainage:</span> <span className="font-medium text-foreground">{profile.drainage ?? '—'}</span></div>
      </div>
      {profile.notes && <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{profile.notes}</p>}
    </div>
  );
}

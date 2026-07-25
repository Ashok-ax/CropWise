'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Fish, Plus, Loader2, Save, Pencil, Trash2 } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer, StatCard } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useFarmTable } from '@/hooks/use-farm-table';
import { Fishery } from '@/types/database';
import { FISH_SPECIES, formatDate } from '@/lib/constants';

const emptyForm = { pond_id: '', fish_species: 'Rohu', stock_count: '', feed_type: '', feed_amount: '', water_quality_ph: '', water_temperature: '', oxygen_level: '', stocking_date: '', expected_harvest_date: '', notes: '' };

export default function FisheriesPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { items: ponds, loading, add, update, remove } = useFarmTable<Fishery>('fisheries');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Fishery | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Fishery) => {
    setEditing(p);
    setForm({
      pond_id: p.pond_id ?? '', fish_species: p.fish_species, stock_count: p.stock_count?.toString() ?? '',
      feed_type: p.feed_type ?? '', feed_amount: p.feed_amount?.toString() ?? '',
      water_quality_ph: p.water_quality_ph?.toString() ?? '', water_temperature: p.water_temperature?.toString() ?? '',
      oxygen_level: p.oxygen_level?.toString() ?? '', stocking_date: p.stocking_date ?? '', expected_harvest_date: p.expected_harvest_date ?? '', notes: p.notes ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.stock_count) { toast.error('Stock count is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        pond_id: form.pond_id || null, fish_species: form.fish_species, stock_count: Number(form.stock_count),
        feed_type: form.feed_type || null, feed_amount: form.feed_amount ? Number(form.feed_amount) : null,
        water_quality_ph: form.water_quality_ph ? Number(form.water_quality_ph) : null,
        water_temperature: form.water_temperature ? Number(form.water_temperature) : null,
        oxygen_level: form.oxygen_level ? Number(form.oxygen_level) : null,
        stocking_date: form.stocking_date || null, expected_harvest_date: form.expected_harvest_date || null, notes: form.notes || null,
      };
      if (editing) await update(editing.id, payload);
      else await add(payload);
      toast.success(editing ? 'Pond updated.' : 'Pond added.');
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const totalFish = ponds.reduce((s, p) => s + p.stock_count, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Fisheries" description={`${ponds.length} ponds · ${totalFish} fish`} icon={Fish} action={<Button size="sm" onClick={openNew} className="gap-1"><Plus size={14} /> Add pond</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total ponds" value={ponds.length} icon={Fish} />
        <StatCard label="Total fish" value={totalFish} icon={Fish} />
        <StatCard label="Species" value={new Set(ponds.map((p) => p.fish_species)).size} icon={Fish} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit pond' : 'Add pond'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Pond ID</Label><Input value={form.pond_id} onChange={(e) => setForm({ ...form, pond_id: e.target.value })} placeholder="e.g. Pond-1" /></div>
              <div className="space-y-2"><Label>Fish species *</Label><Select value={form.fish_species} onValueChange={(v) => setForm({ ...form, fish_species: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FISH_SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Stock count *</Label><Input type="number" value={form.stock_count} onChange={(e) => setForm({ ...form, stock_count: e.target.value })} /></div>
              <div className="space-y-2"><Label>Feed type</Label><Input value={form.feed_type} onChange={(e) => setForm({ ...form, feed_type: e.target.value })} /></div>
              <div className="space-y-2"><Label>Feed amount (kg/day)</Label><Input type="number" step="0.1" value={form.feed_amount} onChange={(e) => setForm({ ...form, feed_amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>Water pH</Label><Input type="number" step="0.01" value={form.water_quality_ph} onChange={(e) => setForm({ ...form, water_quality_ph: e.target.value })} placeholder="6.5-9.0" /></div>
              <div className="space-y-2"><Label>Water temp (°C)</Label><Input type="number" step="0.1" value={form.water_temperature} onChange={(e) => setForm({ ...form, water_temperature: e.target.value })} /></div>
              <div className="space-y-2"><Label>Oxygen (mg/L)</Label><Input type="number" step="0.1" value={form.oxygen_level} onChange={(e) => setForm({ ...form, oxygen_level: e.target.value })} placeholder=">5" /></div>
              <div className="space-y-2"><Label>Stocking date</Label><Input type="date" value={form.stocking_date} onChange={(e) => setForm({ ...form, stocking_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Expected harvest</Label><Input type="date" value={form.expected_harvest_date} onChange={(e) => setForm({ ...form, expected_harvest_date: e.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : ponds.length === 0 ? (
        <EmptyState icon={Fish} title="No fish ponds" description="Add ponds to track fish species, water quality and harvest." action={<Button onClick={openNew} className="gap-1"><Plus size={14} /> Add pond</Button>} />
      ) : (
        <SectionCard title="Your ponds">
          <div className="grid gap-3 sm:grid-cols-2">
            {ponds.map((p) => {
              const phAlert = p.water_quality_ph != null && (p.water_quality_ph < 6.5 || p.water_quality_ph > 9);
              return (
                <div key={p.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div><p className="font-semibold text-foreground">{p.pond_id ?? p.fish_species}</p><p className="text-xs text-muted-foreground">{p.fish_species}</p></div>
                    <Badge variant="secondary">{p.stock_count} fish</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>pH: <span className={`font-medium ${phAlert ? 'text-destructive' : 'text-foreground'}`}>{p.water_quality_ph ?? '—'}{phAlert ? ' (alert)' : ''}</span></p>
                    <p>Temp: <span className="font-medium text-foreground">{p.water_temperature ? `${p.water_temperature}°C` : '—'}</span></p>
                    <p>O₂: <span className="font-medium text-foreground">{p.oxygen_level ? `${p.oxygen_level} mg/L` : '—'}</span></p>
                    <p>Feed: <span className="font-medium text-foreground">{p.feed_type ?? '—'}</span></p>
                    {p.expected_harvest_date && <p className="col-span-2">Harvest: <span className="font-medium text-foreground">{formatDate(p.expected_harvest_date)}</span></p>}
                  </div>
                  <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(p)} className="gap-1"><Pencil size={12} /> Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="gap-1 text-destructive"><Trash2 size={12} /> Delete</Button></div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
      <Disclaimer>Ideal pond pH is 6.5-9.0, dissolved oxygen above 5 mg/L. Monitor water quality daily. Consult aquaculture experts for disease issues.</Disclaimer>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Egg, Plus, Loader2, Save, Pencil, Trash2 } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer, StatCard } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useFarmTable } from '@/hooks/use-farm-table';
import { Poultry } from '@/types/database';
import { POULTRY_PURPOSES, formatDate } from '@/lib/constants';

const emptyForm = { batch_id: '', breed: '', bird_count: '', purpose: 'Layer (eggs)', feed_type: '', feed_amount: '', vaccination_status: '', egg_production: '', mortality_count: '0', acquisition_date: '', notes: '' };

export default function PoultryPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { items: batches, loading, add, update, remove } = useFarmTable<Poultry>('poultry');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Poultry | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (b: Poultry) => {
    setEditing(b);
    setForm({
      batch_id: b.batch_id ?? '', breed: b.breed, bird_count: b.bird_count?.toString() ?? '', purpose: b.purpose ?? 'Layer (eggs)',
      feed_type: b.feed_type ?? '', feed_amount: b.feed_amount?.toString() ?? '', vaccination_status: b.vaccination_status ?? '',
      egg_production: b.egg_production?.toString() ?? '', mortality_count: b.mortality_count?.toString() ?? '0', acquisition_date: b.acquisition_date ?? '', notes: b.notes ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.breed.trim() || !form.bird_count) { toast.error('Breed and bird count are required.'); return; }
    setSaving(true);
    try {
      const payload = {
        batch_id: form.batch_id || null, breed: form.breed.trim(), bird_count: Number(form.bird_count),
        purpose: form.purpose || null, feed_type: form.feed_type || null, feed_amount: form.feed_amount ? Number(form.feed_amount) : null,
        vaccination_status: form.vaccination_status || null, egg_production: form.egg_production ? Number(form.egg_production) : null,
        mortality_count: Number(form.mortality_count) || 0, acquisition_date: form.acquisition_date || null, notes: form.notes || null,
      };
      if (editing) await update(editing.id, payload);
      else await add(payload);
      toast.success(editing ? 'Batch updated.' : 'Batch added.');
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const totalBirds = batches.reduce((s, b) => s + b.bird_count, 0);
  const totalEggs = batches.reduce((s, b) => s + (b.egg_production ?? 0), 0);
  const totalMortality = batches.reduce((s, b) => s + b.mortality_count, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Poultry" description={`${batches.length} batches · ${totalBirds} birds`} icon={Egg} action={<Button size="sm" onClick={openNew} className="gap-1"><Plus size={14} /> Add batch</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total birds" value={totalBirds} icon={Egg} />
        <StatCard label="Eggs/day" value={totalEggs} icon={Egg} tone="success" />
        <StatCard label="Mortality" value={totalMortality} icon={Egg} tone={totalMortality > 0 ? 'destructive' : 'default'} />
        <StatCard label="Batches" value={batches.length} icon={Egg} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit batch' : 'Add batch'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Batch ID</Label><Input value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })} placeholder="e.g. Batch-A" /></div>
              <div className="space-y-2"><Label>Breed *</Label><Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Leghorn" /></div>
              <div className="space-y-2"><Label>Bird count *</Label><Input type="number" value={form.bird_count} onChange={(e) => setForm({ ...form, bird_count: e.target.value })} /></div>
              <div className="space-y-2"><Label>Purpose</Label><Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{POULTRY_PURPOSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Feed type</Label><Input value={form.feed_type} onChange={(e) => setForm({ ...form, feed_type: e.target.value })} placeholder="e.g. Layer mash" /></div>
              <div className="space-y-2"><Label>Feed amount (kg/day)</Label><Input type="number" step="0.1" value={form.feed_amount} onChange={(e) => setForm({ ...form, feed_amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>Vaccination status</Label><Select value={form.vaccination_status} onValueChange={(v) => setForm({ ...form, vaccination_status: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="up to date">Up to date</SelectItem><SelectItem value="due">Due</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Eggs/day</Label><Input type="number" value={form.egg_production} onChange={(e) => setForm({ ...form, egg_production: e.target.value })} /></div>
              <div className="space-y-2"><Label>Mortality count</Label><Input type="number" value={form.mortality_count} onChange={(e) => setForm({ ...form, mortality_count: e.target.value })} /></div>
              <div className="space-y-2"><Label>Acquisition date</Label><Input type="date" value={form.acquisition_date} onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : batches.length === 0 ? (
        <EmptyState icon={Egg} title="No poultry batches" description="Add layer or broiler batches to track birds, eggs and health." action={<Button onClick={openNew} className="gap-1"><Plus size={14} /> Add batch</Button>} />
      ) : (
        <SectionCard title="Your batches">
          <div className="grid gap-3 sm:grid-cols-2">
            {batches.map((b) => (
              <div key={b.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div><p className="font-semibold text-foreground">{b.batch_id ?? b.breed}</p><p className="text-xs text-muted-foreground">{b.breed} · {b.purpose}</p></div>
                  <Badge variant="secondary">{b.bird_count} birds</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>Eggs/day: <span className="font-medium text-foreground">{b.egg_production ?? '—'}</span></p>
                  <p>Mortality: <span className="font-medium text-destructive">{b.mortality_count}</span></p>
                  <p>Feed: <span className="font-medium text-foreground">{b.feed_type ?? '—'}</span></p>
                  <p>Vaccine: <span className="font-medium text-foreground">{b.vaccination_status ?? '—'}</span></p>
                </div>
                <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(b)} className="gap-1"><Pencil size={12} /> Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(b.id)} className="gap-1 text-destructive"><Trash2 size={12} /> Delete</Button></div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      <Disclaimer>Maintain vaccination records and monitor mortality. For disease outbreaks, contact a veterinarian immediately.</Disclaimer>
    </div>
  );
}

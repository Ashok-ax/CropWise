'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Sprout, Plus, Save, Loader2, Trash2, Pencil, Calendar, Ruler } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { CropRecord } from '@/types/database';
import { AREA_UNITS, GROWTH_STAGES, formatDate } from '@/lib/constants';

const STATUS_OPTIONS = ['planned', 'planted', 'growing', 'harvested', 'failed'] as const;

const emptyForm = {
  crop_name: '', variety: '', area: '', area_unit: 'acres',
  planting_date: '', expected_harvest_date: '', growth_stage: 'planned', status: 'planned', notes: '',
};

export default function CropsPage() {
  return <AppShell><CropsContent /></AppShell>;
}

function CropsContent() {
  const { activeFarm, crops, refreshCrops } = useFarm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CropRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: CropRecord) => {
    setEditing(c);
    setForm({
      crop_name: c.crop_name, variety: c.variety ?? '', area: c.area?.toString() ?? '', area_unit: c.area_unit,
      planting_date: c.planting_date ?? '', expected_harvest_date: c.expected_harvest_date ?? '',
      growth_stage: c.growth_stage ?? 'planned', status: c.status, notes: c.notes ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!activeFarm) return;
    if (!form.crop_name.trim()) { toast.error('Crop name is required.'); return; }
    setSaving(true);
    const payload = {
      farm_id: activeFarm.id,
      crop_name: form.crop_name.trim(),
      variety: form.variety || null,
      area: form.area ? Number(form.area) : null,
      area_unit: form.area_unit,
      planting_date: form.planting_date || null,
      expected_harvest_date: form.expected_harvest_date || null,
      growth_stage: form.growth_stage || null,
      status: form.status,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = editing
      ? await supabase.from('crop_records').update(payload).eq('id', editing.id)
      : await supabase.from('crop_records').insert(payload);
    if (error) toast.error('Save failed: ' + error.message);
    else {
      toast.success(editing ? 'Crop updated.' : 'Crop added.');
      setOpen(false);
      refreshCrops();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('crop_records').delete().eq('id', id);
    if (error) toast.error('Delete failed.');
    else { toast.success('Crop deleted.'); refreshCrops(); }
  };

  if (!activeFarm) return <div className="mx-auto max-w-4xl"><PageHeader title="Crops" icon={Sprout} /><EmptyState icon={Sprout} title="No farm" description="Complete onboarding first." /></div>;

  const activeCrops = crops.filter((c) => c.status !== 'harvested' && c.status !== 'failed');
  const pastCrops = crops.filter((c) => c.status === 'harvested' || c.status === 'failed');

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Crops"
        description={`${crops.length} crop records · ${activeCrops.length} active`}
        icon={Sprout}
        action={<Button size="sm" onClick={openNew} className="gap-1"><Plus size={14} /> Add crop</Button>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit crop' : 'Add crop'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Crop name *</Label><Input value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} placeholder="e.g. Rice" /></div>
              <div className="space-y-2"><Label>Variety</Label><Input value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="e.g. IR 64" /></div>
              <div className="space-y-2"><Label>Area</Label><Input type="number" step="0.01" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
              <div className="space-y-2"><Label>Unit</Label><Select value={form.area_unit} onValueChange={(v) => setForm({ ...form, area_unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AREA_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Planting date</Label><Input type="date" value={form.planting_date} onChange={(e) => setForm({ ...form, planting_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Expected harvest</Label><Input type="date" value={form.expected_harvest_date} onChange={(e) => setForm({ ...form, expected_harvest_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Growth stage</Label><Select value={form.growth_stage} onValueChange={(v) => setForm({ ...form, growth_stage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GROWTH_STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {crops.length === 0 ? (
        <EmptyState icon={Sprout} title="No crops yet" description="Add your first crop to start tracking growth, expenses and revenue." action={<Button onClick={openNew} className="gap-1"><Plus size={14} /> Add crop</Button>} />
      ) : (
        <div className="space-y-6">
          <SectionCard title="Active crops" description="Currently growing or planned">
            {activeCrops.length === 0 ? <p className="text-sm text-muted-foreground">No active crops.</p> : (
              <div className="grid gap-3 sm:grid-cols-2">
                {activeCrops.map((c) => <CropCard key={c.id} crop={c} onEdit={() => openEdit(c)} onDelete={() => remove(c.id)} />)}
              </div>
            )}
          </SectionCard>
          {pastCrops.length > 0 && (
            <SectionCard title="Past crops" description="Harvested or failed">
              <div className="grid gap-3 sm:grid-cols-2">
                {pastCrops.map((c) => <CropCard key={c.id} crop={c} onEdit={() => openEdit(c)} onDelete={() => remove(c.id)} />)}
              </div>
            </SectionCard>
          )}
        </div>
      )}
      <Disclaimer>Crop records are entered by you. Estimated harvest dates are based on your input, not scientific prediction.</Disclaimer>
    </div>
  );
}

function CropCard({ crop, onEdit, onDelete }: { crop: CropRecord; onEdit: () => void; onDelete: () => void }) {
  const statusTone = {
    planned: 'border-muted-foreground/30 text-muted-foreground',
    planted: 'border-chart-3/30 text-chart-3',
    growing: 'border-primary/30 text-primary',
    harvested: 'border-success/30 text-success',
    failed: 'border-destructive/30 text-destructive',
  }[crop.status] ?? '';
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-foreground">{crop.crop_name}</p>
          {crop.variety && <p className="text-xs text-muted-foreground">{crop.variety}</p>}
        </div>
        <Badge variant="outline" className={statusTone}>{crop.status}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Ruler size={12} /> {crop.area ?? '—'} {crop.area_unit}</span>
        <span className="flex items-center gap-1"><Sprout size={12} /> {crop.growth_stage ?? 'No stage'}</span>
        {crop.planting_date && <span className="flex items-center gap-1"><Calendar size={12} /> Planted {formatDate(crop.planting_date)}</span>}
        {crop.expected_harvest_date && <span className="flex items-center gap-1"><Calendar size={12} /> Harvest {formatDate(crop.expected_harvest_date)}</span>}
      </div>
      {crop.notes && <p className="mt-2 rounded bg-muted/40 p-2 text-xs text-muted-foreground">{crop.notes}</p>}
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1"><Pencil size={12} /> Edit</Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="gap-1 text-destructive"><Trash2 size={12} /> Delete</Button>
      </div>
    </div>
  );
}

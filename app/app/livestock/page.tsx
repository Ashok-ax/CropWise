'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Milk, Plus, Loader2, Trash2, Save, Pencil } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useFarmTable } from '@/hooks/use-farm-table';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { Livestock, DairyRecord } from '@/types/database';
import { LIVESTOCK_SPECIES, formatDate } from '@/lib/constants';

const emptyForm = { animal_id: '', species: 'Cattle (Cow)', breed: '', gender: 'female', birth_date: '', acquisition_date: '', weight: '', health_status: 'healthy', vaccination_status: '', last_vaccination_date: '', notes: '' };

export default function LivestockPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm } = useFarm();
  const { items: animals, loading, add, update, remove } = useFarmTable<Livestock>('livestock');
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Livestock | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [milkForm, setMilkForm] = useState({ livestock_id: '', record_date: new Date().toISOString().slice(0, 10), morning: '', evening: '', notes: '' });
  const [deleteTarget, setDeleteTarget] = useState<Livestock | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!activeFarm) return;
    const { data } = await supabase.from('dairy_records').select('*').eq('farm_id', activeFarm.id).order('record_date', { ascending: false }).limit(14);
    setRecords((data as DairyRecord[]) ?? []);
  }, [activeFarm]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (a: Livestock) => {
    setEditing(a);
    setForm({
      animal_id: a.animal_id ?? '', species: a.species, breed: a.breed ?? '', gender: a.gender ?? 'female',
      birth_date: a.birth_date ?? '', acquisition_date: a.acquisition_date ?? '', weight: a.weight?.toString() ?? '',
      health_status: a.health_status, vaccination_status: a.vaccination_status ?? '', last_vaccination_date: a.last_vaccination_date ?? '', notes: a.notes ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        animal_id: form.animal_id || null, species: form.species, breed: form.breed || null,
        gender: form.gender || null, birth_date: form.birth_date || null, acquisition_date: form.acquisition_date || null,
        weight: form.weight ? Number(form.weight) : null, health_status: form.health_status,
        vaccination_status: form.vaccination_status || null, last_vaccination_date: form.last_vaccination_date || null,
        notes: form.notes || null,
      };
      if (editing) await update(editing.id, payload);
      else await add(payload);
      toast.success(editing ? 'Animal updated.' : 'Animal added.');
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const saveMilk = async () => {
    if (!activeFarm) return;
    if (!milkForm.livestock_id) { toast.error('Select an animal.'); return; }
    const { error } = await supabase.from('dairy_records').insert({
      farm_id: activeFarm.id, livestock_id: milkForm.livestock_id,
      record_date: milkForm.record_date, morning_milk_litres: Number(milkForm.morning) || 0,
      evening_milk_litres: Number(milkForm.evening) || 0, notes: milkForm.notes || null,
    });
    if (error) toast.error('Save failed: ' + error.message);
    else { toast.success('Milk record added.'); setMilkForm({ ...milkForm, morning: '', evening: '', notes: '' }); loadRecords(); }
  };

  const todayMilk = records.filter((r) => r.record_date === new Date().toISOString().slice(0, 10)).reduce((s, r) => s + Number(r.morning_milk_litres) + Number(r.evening_milk_litres), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Livestock & Dairy" description={`${animals.length} animals · ${todayMilk}L milk today`} icon={Milk} action={<Button size="sm" onClick={openNew} className="gap-1"><Plus size={14} /> Add animal</Button>} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit animal' : 'Add animal'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Animal ID</Label><Input value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })} placeholder="e.g. Cow-01" /></div>
              <div className="space-y-2"><Label>Species *</Label><Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LIVESTOCK_SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Breed</Label><Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Gir" /></div>
              <div className="space-y-2"><Label>Gender</Label><Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Birth date</Label><Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
              <div className="space-y-2"><Label>Health status</Label><Select value={form.health_status} onValueChange={(v) => setForm({ ...form, health_status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="healthy">Healthy</SelectItem><SelectItem value="sick">Sick</SelectItem><SelectItem value="under treatment">Under treatment</SelectItem><SelectItem value="pregnant">Pregnant</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Vaccination status</Label><Select value={form.vaccination_status} onValueChange={(v) => setForm({ ...form, vaccination_status: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="up to date">Up to date</SelectItem><SelectItem value="due">Due</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Last vaccination</Label><Input type="date" value={form.last_vaccination_date} onChange={(e) => setForm({ ...form, last_vaccination_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : animals.length === 0 ? (
        <EmptyState icon={Milk} title="No livestock" description="Add cattle, goats, sheep or other animals to manage health and dairy." action={<Button onClick={openNew} className="gap-1"><Plus size={14} /> Add animal</Button>} />
      ) : (
        <SectionCard title="Your animals">
          <div className="grid gap-3 sm:grid-cols-2">
            {animals.map((a) => (
              <div key={a.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div><p className="font-semibold text-foreground">{a.animal_id ?? a.species}</p><p className="text-xs text-muted-foreground">{a.species} · {a.breed ?? 'No breed'}</p></div>
                  <Badge variant="outline" className={a.health_status === 'healthy' ? 'border-success/30 text-success' : a.health_status === 'sick' ? 'border-destructive/30 text-destructive' : 'border-warning/30 text-warning'}>{a.health_status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>Gender: <span className="font-medium text-foreground capitalize">{a.gender ?? '—'}</span></p>
                  <p>Weight: <span className="font-medium text-foreground">{a.weight ? `${a.weight} kg` : '—'}</span></p>
                  <p>Vaccine: <span className="font-medium text-foreground">{a.vaccination_status ?? '—'}</span></p>
                  <p>Last vaccine: <span className="font-medium text-foreground">{formatDate(a.last_vaccination_date)}</span></p>
                </div>
                <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(a)} className="gap-1"><Pencil size={12} /> Edit</Button><Button size="sm" variant="ghost" onClick={() => setDeleteTarget(a)} className="gap-1 text-destructive"><Trash2 size={12} /> Delete</Button></div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {animals.length > 0 && (
        <div className="mt-6">
          <SectionCard title="Add milk production record" description="Track daily milk yield per animal">
            <div className="grid gap-3 sm:grid-cols-5">
              <Select value={milkForm.livestock_id} onValueChange={(v) => setMilkForm({ ...milkForm, livestock_id: v })}><SelectTrigger><SelectValue placeholder="Animal" /></SelectTrigger><SelectContent>{animals.map((a) => <SelectItem key={a.id} value={a.id}>{a.animal_id ?? a.species}</SelectItem>)}</SelectContent></Select>
              <Input type="date" value={milkForm.record_date} onChange={(e) => setMilkForm({ ...milkForm, record_date: e.target.value })} />
              <Input type="number" step="0.1" placeholder="Morning L" value={milkForm.morning} onChange={(e) => setMilkForm({ ...milkForm, morning: e.target.value })} />
              <Input type="number" step="0.1" placeholder="Evening L" value={milkForm.evening} onChange={(e) => setMilkForm({ ...milkForm, evening: e.target.value })} />
              <Button onClick={saveMilk} className="gap-1"><Save size={14} /> Add</Button>
            </div>
          </SectionCard>
          {records.length > 0 && (
            <div className="mt-4">
              <SectionCard title="Recent milk records">
                <div className="space-y-2">
                  {records.slice(0, 10).map((r) => {
                    const animal = animals.find((a) => a.id === r.livestock_id);
                    return (
                      <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5 text-sm">
                        <span className="text-muted-foreground">{animal?.animal_id ?? animal?.species ?? 'Unknown'} · {formatDate(r.record_date)}</span>
                        <span className="font-medium text-foreground">Morning {r.morning_milk_litres}L + Evening {r.evening_milk_litres}L = <span className="text-primary">{Number(r.morning_milk_litres) + Number(r.evening_milk_litres)}L</span></span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      )}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this animal?</AlertDialogTitle><AlertDialogDescription>This will permanently remove &quot;{deleteTarget?.species}&quot; and its milk records. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { if (!deleteTarget) return; setDeleting(true); await remove(deleteTarget.id); setDeleting(false); setDeleteTarget(null); }}>{deleting ? <Loader2 size={14} className="animate-spin" /> : null} Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Disclaimer>For any health concerns, consult a qualified veterinarian. Vaccination schedules vary by region — confirm with your local animal husbandry office.</Disclaimer>
    </div>
  );
}

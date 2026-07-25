'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Milk, Plus, Loader2, Save, Pencil, Trash2 } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer, StatCard } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useFarmTable } from '@/hooks/use-farm-table';
import { DairyRecord } from '@/types/database';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/constants';

const emptyForm = { livestock_id: '', record_date: new Date().toISOString().slice(0, 10), morning_milk_litres: '', evening_milk_litres: '', fat_content: '', notes: '' };

export default function DairyPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm } = useFarm();
  const { items: records, loading, add, remove } = useFarmTable<DairyRecord>('dairy_records');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const save = async () => {
    setSaving(true);
    try {
      await add({
        livestock_id: form.livestock_id || null,
        record_date: form.record_date,
        morning_milk_litres: Number(form.morning_milk_litres) || 0,
        evening_milk_litres: Number(form.evening_milk_litres) || 0,
        fat_content: form.fat_content ? Number(form.fat_content) : null,
        notes: form.notes || null,
      });
      toast.success('Milk record added.');
      setOpen(false);
      setForm(emptyForm);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const totalMilk = records.reduce((s, r) => s + Number(r.morning_milk_litres) + Number(r.evening_milk_litres), 0);
  const todayRecords = records.filter((r) => r.record_date === new Date().toISOString().slice(0, 10));
  const todayMilk = todayRecords.reduce((s, r) => s + Number(r.morning_milk_litres) + Number(r.evening_milk_litres), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Dairy" description="Track milk production daily" icon={Milk} action={<Button size="sm" onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add record</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Today's milk" value={`${todayMilk} L`} icon={Milk} tone="success" />
        <StatCard label="Total records" value={records.length} icon={Milk} />
        <StatCard label="Total milk (all records)" value={`${totalMilk.toFixed(1)} L`} icon={Milk} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add milk record</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Morning (L)</Label><Input type="number" step="0.1" value={form.morning_milk_litres} onChange={(e) => setForm({ ...form, morning_milk_litres: e.target.value })} /></div>
              <div className="space-y-2"><Label>Evening (L)</Label><Input type="number" step="0.1" value={form.evening_milk_litres} onChange={(e) => setForm({ ...form, evening_milk_litres: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Fat content (%)</Label><Input type="number" step="0.1" value={form.fat_content} onChange={(e) => setForm({ ...form, fat_content: e.target.value })} /></div>
            <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : records.length === 0 ? (
        <EmptyState icon={Milk} title="No milk records" description="Add daily milk production to track yield and trends." action={<Button onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add record</Button>} />
      ) : (
        <SectionCard title="Recent records">
          <div className="space-y-2">
            {records.slice(0, 20).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div><p className="text-sm font-semibold text-foreground">{formatDate(r.record_date)}</p><p className="text-xs text-muted-foreground">Morning {r.morning_milk_litres}L · Evening {r.evening_milk_litres}L{r.fat_content ? ` · Fat ${r.fat_content}%` : ''}</p></div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{Number(r.morning_milk_litres) + Number(r.evening_milk_litres)} L</Badge>
                  <Button variant="ghost" size="sm" onClick={() => remove(r.id)} className="text-destructive"><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      <Disclaimer>Track milk daily for accurate yield monitoring. Sudden production drops may signal health or feed issues — consult a veterinarian.</Disclaimer>
    </div>
  );
}

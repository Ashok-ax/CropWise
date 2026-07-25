'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TrendingUp, Plus, Loader2, Trash2, Save } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useFinance } from '@/hooks/use-finance';
import { useFarm } from '@/components/providers/farm-provider';
import { REVENUE_CATEGORIES, formatCurrency, formatDate } from '@/lib/constants';

export default function RevenuePage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm, crops } = useFarm();
  const { revenues, loading, addRevenue, deleteRevenue } = useFinance();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: 'Crop sales', amount: '', revenue_date: new Date().toISOString().slice(0, 10), crop_id: '', activity_type: '', description: '' });

  const save = async () => {
    if (!activeFarm) return;
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount.'); return; }
    setSaving(true);
    try {
      await addRevenue({
        farm_id: activeFarm.id,
        category: form.category,
        amount: Number(form.amount),
        revenue_date: form.revenue_date,
        crop_id: form.crop_id || null,
        activity_type: form.activity_type || null,
        description: form.description || null,
      });
      toast.success('Revenue added.');
      setOpen(false);
      setForm({ category: 'Crop sales', amount: '', revenue_date: new Date().toISOString().slice(0, 10), crop_id: '', activity_type: '', description: '' });
    } catch (e: any) { toast.error(e.message ?? 'Save failed.'); }
    setSaving(false);
  };

  const total = revenues.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Revenue"
        description={`${revenues.length} entries · Total: ${formatCurrency(total)}`}
        icon={TrendingUp}
        action={<Button size="sm" onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add revenue</Button>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add revenue</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REVENUE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Amount (Rs) *</Label><Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.revenue_date} onChange={(e) => setForm({ ...form, revenue_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Activity (optional)</Label><Input value={form.activity_type} onChange={(e) => setForm({ ...form, activity_type: e.target.value })} placeholder="e.g. Dairy, Poultry" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Crop (optional)</Label><Select value={form.crop_id} onValueChange={(v) => setForm({ ...form, crop_id: v })}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{crops.map((c) => <SelectItem key={c.id} value={c.id}>{c.crop_name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> :
        revenues.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No revenue yet" description="Track crop sales, milk, eggs, meat and other income here." action={<Button onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add revenue</Button>} />
        ) : (
          <SectionCard>
            <div className="space-y-2">
              {revenues.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><TrendingUp size={18} /></div>
                    <div><p className="text-sm font-semibold text-foreground">{r.category}</p><p className="text-xs text-muted-foreground">{formatDate(r.revenue_date)}{r.description ? ` · ${r.description}` : ''}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-success">{formatCurrency(r.amount)}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteRevenue(r.id)} className="text-destructive"><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      <Disclaimer>All amounts in INR. Track all income for accurate profit calculation.</Disclaimer>
    </div>
  );
}

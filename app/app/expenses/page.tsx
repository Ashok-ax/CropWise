'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Wallet, Plus, Loader2, Trash2, Save } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useFinance } from '@/hooks/use-finance';
import { useFarm } from '@/components/providers/farm-provider';
import { EXPENSE_CATEGORIES, formatCurrency, formatDate } from '@/lib/constants';

export default function ExpensesPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm, crops } = useFarm();
  const { expenses, loading, addExpense, deleteExpense } = useFinance();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: 'Seeds', amount: '', expense_date: new Date().toISOString().slice(0, 10), crop_id: '', activity_type: '', description: '' });

  const save = async () => {
    if (!activeFarm) return;
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount.'); return; }
    setSaving(true);
    try {
      await addExpense({
        farm_id: activeFarm.id,
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.expense_date,
        crop_id: form.crop_id || null,
        activity_type: form.activity_type || null,
        description: form.description || null,
      });
      toast.success('Expense added.');
      setOpen(false);
      setForm({ category: 'Seeds', amount: '', expense_date: new Date().toISOString().slice(0, 10), crop_id: '', activity_type: '', description: '' });
    } catch (e: any) { toast.error(e.message ?? 'Save failed.'); }
    setSaving(false);
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Expenses"
        description={`${expenses.length} entries · Total: ${formatCurrency(total)}`}
        icon={Wallet}
        action={<Button size="sm" onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add expense</Button>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Amount (Rs) *</Label><Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Activity (optional)</Label><Input value={form.activity_type} onChange={(e) => setForm({ ...form, activity_type: e.target.value })} placeholder="e.g. Dairy, Poultry" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Crop (optional)</Label><Select value={form.crop_id} onValueChange={(v) => setForm({ ...form, crop_id: v })}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{crops.map((c) => <SelectItem key={c.id} value={c.id}>{c.crop_name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> :
        expenses.length === 0 ? (
          <EmptyState icon={Wallet} title="No expenses yet" description="Track seeds, fertilizer, labour and other costs here." action={<Button onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add expense</Button>} />
        ) : (
          <SectionCard>
            <div className="space-y-2">
              {expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><Wallet size={18} /></div>
                    <div><p className="text-sm font-semibold text-foreground">{e.category}</p><p className="text-xs text-muted-foreground">{formatDate(e.expense_date)}{e.description ? ` · ${e.description}` : ''}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">{formatCurrency(e.amount)}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteExpense(e.id)} className="text-destructive"><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      <Disclaimer>All amounts in INR. Track every cost for accurate profit calculation.</Disclaimer>
    </div>
  );
}

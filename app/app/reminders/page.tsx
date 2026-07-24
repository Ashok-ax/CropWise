'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Bell, Plus, Loader2, Trash2, Save, Check, CalendarClock } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { Reminder } from '@/types/database';
import { REMINDER_TYPES, formatDate } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function RemindersPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', reminder_type: 'Irrigation', due_date: new Date().toISOString().slice(0, 10), notes: '' });

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('reminders').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
    setReminders((data as Reminder[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    const { error } = await supabase.from('reminders').insert({
      user_id: user.id, title: form.title.trim(), reminder_type: form.reminder_type,
      due_date: form.due_date, notes: form.notes || null,
    });
    if (error) toast.error('Save failed: ' + error.message);
    else { toast.success('Reminder added.'); setOpen(false); setForm({ title: '', reminder_type: 'Irrigation', due_date: new Date().toISOString().slice(0, 10), notes: '' }); load(); }
    setSaving(false);
  };

  const toggleDone = async (r: Reminder) => {
    const { error } = await supabase.from('reminders').update({ status: r.status === 'done' ? 'pending' : 'done' }).eq('id', r.id);
    if (error) toast.error('Update failed.');
    else load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) toast.error('Delete failed.');
    else { toast.success('Deleted.'); load(); }
  };

  const pending = reminders.filter((r) => r.status === 'pending');
  const done = reminders.filter((r) => r.status === 'done');
  const overdue = pending.filter((r) => new Date(r.due_date) < new Date(new Date().toDateString()));

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Reminders"
        description={`${pending.length} pending · ${overdue.length} overdue`}
        icon={Bell}
        action={<Button size="sm" onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add reminder</Button>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add reminder</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Apply fertilizer to rice" /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={form.reminder_type} onValueChange={(v) => setForm({ ...form, reminder_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REMINDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {reminders.length === 0 ? (
        <EmptyState icon={Bell} title="No reminders" description="Add reminders for irrigation, vaccination, harvest and more." action={<Button onClick={() => setOpen(true)} className="gap-1"><Plus size={14} /> Add reminder</Button>} />
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <SectionCard title="Overdue" description="Past due, still pending">
              <div className="space-y-2">{overdue.map((r) => <ReminderRow key={r.id} r={r} overdue onToggle={() => toggleDone(r)} onDelete={() => remove(r.id)} />)}</div>
            </SectionCard>
          )}
          <SectionCard title="Upcoming" description="Pending reminders">
            {pending.filter((r) => !overdue.includes(r)).length === 0 ? <p className="text-sm text-muted-foreground">No upcoming reminders.</p> : (
              <div className="space-y-2">{pending.filter((r) => !overdue.includes(r)).map((r) => <ReminderRow key={r.id} r={r} onToggle={() => toggleDone(r)} onDelete={() => remove(r.id)} />)}</div>
            )}
          </SectionCard>
          {done.length > 0 && (
            <SectionCard title="Completed">
              <div className="space-y-2">{done.map((r) => <ReminderRow key={r.id} r={r} done onToggle={() => toggleDone(r)} onDelete={() => remove(r.id)} />)}</div>
            </SectionCard>
          )}
        </div>
      )}
      <Disclaimer>Reminders are stored locally in your account. Browser/email/SMS notifications are a future feature.</Disclaimer>
    </div>
  );
}

function ReminderRow({ r, overdue, done, onToggle, onDelete }: { r: Reminder; overdue?: boolean; done?: boolean; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-3', done && 'opacity-60', overdue && 'border-destructive/30')}>
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className={cn('flex h-6 w-6 items-center justify-center rounded-md border', done ? 'border-success bg-success text-success-foreground' : 'border-border')}>
          {done && <Check size={14} />}
        </button>
        <div>
          <p className={cn('text-sm font-medium text-foreground', done && 'line-through')}>{r.title}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock size={11} /> {formatDate(r.due_date)} · {r.reminder_type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {overdue && <Badge variant="outline" className="border-destructive/30 text-destructive">Overdue</Badge>}
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive"><Trash2 size={14} /></Button>
      </div>
    </div>
  );
}

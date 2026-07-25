'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User as UserIcon, Save, Loader2, LogOut } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { LANGUAGES, EXPERIENCE_LEVELS, FARMING_TYPES, formatCurrency } from '@/lib/constants';

export default function ProfilePage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { profile, user, refreshProfile, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '', age: '', phone: '', preferred_language: 'en', location: '',
    experience: 'beginner', budget: '', investment_capacity: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name, age: profile.age?.toString() ?? '', phone: profile.phone ?? '',
        preferred_language: profile.preferred_language, location: profile.location ?? '',
        experience: profile.experience ?? 'beginner', budget: profile.budget?.toString() ?? '',
        investment_capacity: profile.investment_capacity?.toString() ?? '',
      });
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name.trim(), age: form.age ? Number(form.age) : null,
      phone: form.phone || null, preferred_language: form.preferred_language,
      location: form.location || null, experience: form.experience,
      budget: form.budget ? Number(form.budget) : null,
      investment_capacity: form.investment_capacity ? Number(form.investment_capacity) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    if (error) toast.error('Save failed: ' + error.message);
    else { toast.success('Profile updated.'); refreshProfile(); }
    setSaving(false);
  };

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Profile" description="Manage your account and farm preferences" icon={UserIcon} />
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Manage your account and farm preferences" icon={UserIcon} />

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-foreground">{profile.full_name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground capitalize">Role: {profile.role} · Joined {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {!profile.onboarding_completed && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-warning/30 bg-warning/10 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Onboarding incomplete</p>
            <p className="text-xs text-muted-foreground">Complete onboarding to set up your farm and unlock all features.</p>
          </div>
          <Button asChild size="sm"><a href="/onboarding">Complete now</a></Button>
        </div>
      )}

      <SectionCard title="Personal information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Preferred language</Label><Select value={form.preferred_language} onValueChange={(v) => setForm({ ...form, preferred_language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2 sm:col-span-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        </div>
      </SectionCard>

      <div className="mt-6">
        <SectionCard title="Farming & financial info">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Experience</Label><Select value={form.experience} onValueChange={(v) => setForm({ ...form, experience: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EXPERIENCE_LEVELS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Budget (Rs)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
            <div className="space-y-2"><Label>Investment capacity (Rs)</Label><Input type="number" value={form.investment_capacity} onChange={(e) => setForm({ ...form, investment_capacity: e.target.value })} /></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Farming types: {profile.farming_types.length > 0 ? profile.farming_types.join(', ') : 'None set'}</p>
            <Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes</Button>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Account actions">
          <Button variant="outline" onClick={signOut} className="gap-2 text-destructive"><LogOut size={16} /> Sign out securely</Button>
        </SectionCard>
      </div>
      <Disclaimer>Your data is protected by Row Level Security — only you can access your farm and financial records.</Disclaimer>
    </div>
  );
}

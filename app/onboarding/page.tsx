'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Check, ArrowRight, ArrowLeft, Sprout } from 'lucide-react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import {
  FARMING_TYPES, SOIL_TYPES, AREA_UNITS, WATER_AVAILABILITY, IRRIGATION_TYPES, EXPERIENCE_LEVELS, LANGUAGES,
} from '@/lib/constants';

const STEPS = ['Basic Info', 'Farming Info', 'Farm Info', 'Financial Info', 'Activities'];

export default function OnboardingPage() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    age: '',
    phone: '',
    preferred_language: 'en',
    location: '',
    farming_types: [] as string[],
    experience: 'beginner',
    primary_activity: '',
    secondary_activities: [] as string[],
    farm_name: '',
    land_area: '',
    area_unit: 'acres',
    soil_type: '',
    water_availability: '',
    irrigation_type: '',
    budget: '',
    investment_capacity: '',
  });

  const toggleArray = (key: 'farming_types' | 'secondary_activities', value: string) => {
    setForm((f) => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const canProceed = (): boolean => {
    if (step === 0) return !!form.full_name.trim() && !!form.location.trim();
    if (step === 1) return form.farming_types.length > 0 && !!form.primary_activity;
    if (step === 2) return !!form.farm_name.trim() && !!form.land_area && !!form.soil_type && !!form.water_availability && !!form.irrigation_type;
    return true;
  };

  const next = () => {
    if (!canProceed()) {
      toast.error('Please complete the required fields.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!user) {
      toast.error('Session expired. Please sign in again.');
      router.push('/login');
      return;
    }
    setSubmitting(true);

    // Step 1: Save profile fields WITHOUT marking onboarding complete yet.
    // If farm creation below fails, the user needs to be able to come back
    // here and retry — marking onboarding_completed too early would trap
    // them on a farmless dashboard with no way back to this flow.
    const profileUpdate = {
      full_name: form.full_name.trim(),
      age: form.age ? Number(form.age) : null,
      phone: form.phone || null,
      preferred_language: form.preferred_language,
      location: form.location.trim(),
      farming_types: form.farming_types,
      experience: form.experience,
      primary_activity: form.primary_activity,
      secondary_activities: form.secondary_activities,
      budget: form.budget ? Number(form.budget) : null,
      investment_capacity: form.investment_capacity ? Number(form.investment_capacity) : null,
    };

    const { error: pErr } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
    if (pErr) {
      toast.error('Could not save profile: ' + pErr.message);
      setSubmitting(false);
      return;
    }

    // Step 2: Create the farm. Only proceed to mark onboarding complete if this succeeds.
    const { data: farm, error: fErr } = await supabase
      .from('farms')
      .insert({
        user_id: user.id,
        name: form.farm_name.trim(),
        location: form.location.trim(),
        land_area: form.land_area ? Number(form.land_area) : null,
        area_unit: form.area_unit,
        soil_type: form.soil_type,
        water_availability: form.water_availability,
        irrigation_type: form.irrigation_type,
      })
      .select()
      .maybeSingle();

    if (fErr || !farm) {
      toast.error('Farm creation failed: ' + (fErr?.message ?? 'unknown error') + '. Your info was saved — please try finishing again.');
      setSubmitting(false);
      return;
    }

    // Step 3: Only now, with a real farm confirmed to exist, mark onboarding complete.
    const { error: completeErr } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);

    if (completeErr) {
      toast.error('Farm created, but could not finalize onboarding: ' + completeErr.message + '. Please try again.');
      setSubmitting(false);
      return;
    }

    await refreshProfile();
    toast.success('Onboarding complete! Welcome to your dashboard.');
    setSubmitting(false);
    router.push('/app');
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile?.onboarding_completed) {
      router.push('/app');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        full_name: profile.full_name || f.full_name,
        preferred_language: profile.preferred_language || f.preferred_language,
        experience: profile.experience || f.experience,
        location: profile.location || f.location,
        farming_types: profile.farming_types?.length ? profile.farming_types : f.farming_types,
        primary_activity: profile.primary_activity || f.primary_activity,
        secondary_activities: profile.secondary_activities?.length ? profile.secondary_activities : f.secondary_activities,
      }));
    }
  }, [profile]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (profile?.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <p className="text-sm text-muted-foreground">Welcome, let&apos;s set up your farm</p>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-10">
        {/* Stepper */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    i < step && 'border-primary bg-primary text-primary-foreground',
                    i === step && 'border-primary bg-primary/10 text-primary',
                    i > step && 'border-border text-muted-foreground'
                  )}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className="mt-1.5 hidden text-xs font-medium text-muted-foreground sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-1 h-0.5 flex-1 rounded', i < step ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            {step === 0 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-semibold">Basic information</h2>
                <p className="text-sm text-muted-foreground">Tell us a little about yourself.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full name *</Label>
                    <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Age (optional)</Label>
                    <Input type="number" min={1} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g. 35" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 9876543210" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred language</Label>
                    <Select value={form.preferred_language} onValueChange={(v) => setForm({ ...form, preferred_language: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Location (village/town, district, state) *</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Pollachi, Coimbatore, Tamil Nadu" />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-semibold">Farming information</h2>
                <p className="text-sm text-muted-foreground">What kind of farming do you do? Select all that apply.</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FARMING_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggleArray('farming_types', t.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors',
                        form.farming_types.includes(t.value)
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <span className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        form.farming_types.includes(t.value) ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      )}>
                        {form.farming_types.includes(t.value) && <Check size={12} />}
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Experience level</Label>
                  <Select value={form.experience} onValueChange={(v) => setForm({ ...form, experience: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary farming activity *</Label>
                  <Select value={form.primary_activity} onValueChange={(v) => setForm({ ...form, primary_activity: v })}>
                    <SelectTrigger><SelectValue placeholder="Select primary activity" /></SelectTrigger>
                    <SelectContent>
                      {FARMING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Secondary activities (optional)</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {FARMING_TYPES.filter((t) => t.value !== form.primary_activity).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => toggleArray('secondary_activities', t.value)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors',
                          form.secondary_activities.includes(t.value)
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        )}
                      >
                        <span className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          form.secondary_activities.includes(t.value) ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        )}>
                          {form.secondary_activities.includes(t.value) && <Check size={12} />}
                        </span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-semibold">Farm information</h2>
                <p className="text-sm text-muted-foreground">Tell us about your farm.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Farm name *</Label>
                    <Input value={form.farm_name} onChange={(e) => setForm({ ...form, farm_name: e.target.value })} placeholder="e.g. Green Valley Farm" />
                  </div>
                  <div className="space-y-2">
                    <Label>Farm size *</Label>
                    <Input type="number" min={0} step="0.01" value={form.land_area} onChange={(e) => setForm({ ...form, land_area: e.target.value })} placeholder="e.g. 2.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={form.area_unit} onValueChange={(v) => setForm({ ...form, area_unit: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AREA_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Soil type *</Label>
                    <Select value={form.soil_type} onValueChange={(v) => setForm({ ...form, soil_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                      <SelectContent>
                        {SOIL_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Water availability *</Label>
                    <Select value={form.water_availability} onValueChange={(v) => setForm({ ...form, water_availability: v })}>
                      <SelectTrigger><SelectValue placeholder="Select water availability" /></SelectTrigger>
                      <SelectContent>
                        {WATER_AVAILABILITY.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Irrigation type *</Label>
                    <Select value={form.irrigation_type} onValueChange={(v) => setForm({ ...form, irrigation_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select irrigation type" /></SelectTrigger>
                      <SelectContent>
                        {IRRIGATION_TYPES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-semibold">Financial information</h2>
                <p className="text-sm text-muted-foreground">Optional — helps with recommendations. All amounts in INR.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Approximate budget</Label>
                    <Input type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 50000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Investment capacity</Label>
                    <Input type="number" min={0} value={form.investment_capacity} onChange={(e) => setForm({ ...form, investment_capacity: e.target.value })} placeholder="e.g. 30000" />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  You can add current expenses and revenue later from the Finance section.
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-xl font-semibold">Current farming activities</h2>
                <p className="text-sm text-muted-foreground">
                  You can add crops, animals, poultry and fish ponds after onboarding from the respective modules.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Crops', desc: 'Add planted crops with growth stages', icon: Sprout },
                    { label: 'Dairy / Livestock', desc: 'Add animals, milk production, health', icon: Sprout },
                    { label: 'Poultry', desc: 'Add bird batches, egg production', icon: Sprout },
                    { label: 'Fisheries', desc: 'Add ponds, fish species, water quality', icon: Sprout },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-3 rounded-lg border border-border p-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <c.icon size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
                  Ready to build your personalized dashboard? Click finish to continue.
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={back} disabled={step === 0} className="gap-1">
                <ArrowLeft size={16} /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next} className="gap-1">Next <ArrowRight size={16} /></Button>
              ) : (
                <Button onClick={finish} disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Finish onboarding
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
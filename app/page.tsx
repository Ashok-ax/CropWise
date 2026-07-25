'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CloudSun, Sprout, Wallet, TrendingUp, Bell, Brain, ShieldCheck,
  Droplets, Leaf, Scale, ArrowRight, Sun, Cloud, CloudRain, Wind, Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, StatCard, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { Expense, Revenue, Reminder, Notification } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/constants';
import { useWeather } from '@/hooks/use-weather';
import { weatherCodeToText, weatherFarmingAdvice } from '@/lib/weather';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { profile } = useAuth();
  const { activeFarm, crops, loading: farmLoading } = useFarm();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const weather = useWeather(activeFarm?.latitude ?? null, activeFarm?.longitude ?? null);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      const [exp, rev, rem, notif] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', profile.id).gte('expense_date', firstOfMonth).order('expense_date', { ascending: false }),
        supabase.from('revenues').select('*').eq('user_id', profile.id).gte('revenue_date', firstOfMonth).order('revenue_date', { ascending: false }),
        supabase.from('reminders').select('*').eq('user_id', profile.id).order('due_date', { ascending: true }).limit(5),
        supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
      ]);
      if (!active) return;
      if (exp.error) toast.error('Could not load expenses.');
      if (rev.error) toast.error('Could not load revenue.');
      setExpenses((exp.data as Expense[]) ?? []);
      setRevenues((rev.data as Revenue[]) ?? []);
      setReminders((rem.data as Reminder[]) ?? []);
      setNotifications((notif.data as Notification[]) ?? []);
      setDataLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);
  const totalRevenue = useMemo(() => revenues.reduce((s, r) => s + Number(r.amount), 0), [revenues]);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const activeCrops = crops.filter((c) => c.status !== 'harvested' && c.status !== 'failed');
  const upcomingReminders = reminders.filter((r) => r.status === 'pending').slice(0, 4);

  const farmHealth = useMemo(() => {
    const items: { label: string; status: string; tone: 'success' | 'warning' | 'destructive' }[] = [];
    const water = activeFarm?.water_availability;
    items.push({
      label: 'Water availability',
      status: water ?? 'Unknown',
      tone: water === 'Abundant' ? 'success' : water === 'Moderate' ? 'warning' : water ? 'destructive' : 'warning',
    });
    items.push({ label: 'Soil', status: activeFarm?.soil_type ?? 'Unknown', tone: 'success' });
    if (weather.data) {
      const storm = weather.data.daily.some((d) => d.weather_code >= 95);
      items.push({ label: 'Weather risk', status: storm ? 'High' : weather.data.daily[0]?.precipitation_probability > 60 ? 'Medium' : 'Low', tone: storm ? 'destructive' : 'warning' });
    } else {
      items.push({ label: 'Weather risk', status: 'Unknown', tone: 'warning' });
    }
    items.push({ label: 'Crop health', status: activeCrops.length > 0 ? 'Good' : 'No active crops', tone: 'success' });
    items.push({ label: 'Financial status', status: netProfit >= 0 ? 'Stable' : 'Loss this month', tone: netProfit >= 0 ? 'success' : 'destructive' });
    return items;
  }, [activeFarm, weather.data, activeCrops.length, netProfit]);

  const weatherAdvice = weather.data ? weatherFarmingAdvice(weather.data) : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (farmLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`${greeting}, ${profile?.full_name?.split(' ')[0] ?? 'Farmer'}`}
        description={activeFarm ? `${activeFarm.name} · ${activeFarm.location ?? 'Location not set'}` : 'Complete onboarding to set up your farm'}
        action={<Button asChild size="sm" className="gap-2"><Link href="/app/ai"><Brain size={16} /> Ask CropWise AI</Link></Button>}
      />

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Expenses (this month)" value={formatCurrency(totalExpenses)} icon={Wallet} tone="destructive" hint={`${expenses.length} entries`} />
        <StatCard label="Revenue (this month)" value={formatCurrency(totalRevenue)} icon={TrendingUp} tone="success" hint={`${revenues.length} entries`} />
        <StatCard label="Net profit / loss" value={formatCurrency(netProfit)} icon={Scale} tone={netProfit >= 0 ? 'success' : 'destructive'} hint={totalRevenue > 0 ? `${profitMargin}% margin` : 'No revenue yet'} />
        <StatCard label="Active crops" value={activeCrops.length} icon={Sprout} hint={`${crops.length} total records`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Weather */}
        <SectionCard title="Current weather" description={activeFarm?.location ?? 'Set farm location & coordinates'} className="lg:col-span-2">
          {weather.loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="animate-spin" /></div>
          ) : weather.error ? (
            <EmptyState icon={CloudSun} title="Weather unavailable" description={weather.error} />
          ) : weather.data ? (
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <WeatherIcon code={weather.data.current.weather_code} size={40} className="text-primary" />
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{Math.round(weather.data.current.temperature)}°C</p>
                  <p className="text-sm text-muted-foreground">{weatherCodeToText(weather.data.current.weather_code)}</p>
                </div>
                <div className="ml-auto grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-xs text-muted-foreground">Humidity</p><p className="font-semibold text-foreground">{weather.data.current.humidity}%</p></div>
                  <div><p className="text-xs text-muted-foreground">Wind</p><p className="font-semibold text-foreground">{Math.round(weather.data.current.wind_speed)} km/h</p></div>
                  <div><p className="text-xs text-muted-foreground">Rain</p><p className="font-semibold text-foreground">{weather.data.current.precipitation} mm</p></div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {weather.data.daily.map((d, i) => (
                  <div key={d.date} className="rounded-lg bg-muted/40 p-2 text-center">
                    <p className="text-xs text-muted-foreground">{i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                    <div className="my-1 flex justify-center"><WeatherIcon code={d.weather_code} size={20} className="text-primary" /></div>
                    <p className="text-xs font-semibold text-foreground">{Math.round(d.temp_max)}°</p>
                    <p className="text-xs text-muted-foreground">{Math.round(d.temp_min)}°</p>
                    {d.precipitation_probability > 0 && <p className="text-xs text-chart-3">{d.precipitation_probability}%</p>}
                  </div>
                ))}
              </div>
              {weatherAdvice.length > 0 && (
                <div className="mt-4 space-y-1.5 rounded-lg bg-primary/5 p-3">
                  <p className="text-xs font-semibold text-primary">Farming weather advice</p>
                  {weatherAdvice.map((t, i) => <p key={i} className="text-sm text-foreground">• {t}</p>)}
                </div>
              )}
            </div>
          ) : null}
        </SectionCard>

        {/* Farm health */}
        <SectionCard title="Farm health overview" description="Indicators based on your data">
          <div className="space-y-3">
            {farmHealth.map((h) => (
              <div key={h.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{h.label}</span>
                <Badge variant="outline" className={cn(
                  h.tone === 'success' && 'border-success/30 text-success',
                  h.tone === 'warning' && 'border-warning/30 text-warning',
                  h.tone === 'destructive' && 'border-destructive/30 text-destructive',
                )}>{h.status}</Badge>
              </div>
            ))}
            <Disclaimer>Indicators are derived from your data, not scientific measurements.</Disclaimer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today's farm */}
        <SectionCard
          title="Today on your farm"
          description="Actionable items for today"
          className="lg:col-span-2"
          action={<Button asChild variant="ghost" size="sm"><Link href="/app/today">View all <ArrowRight size={14} /></Link></Button>}
        >
          <div className="space-y-3">
            {weatherAdvice.slice(0, 1).map((t, i) => (
              <ActionCard key={`w${i}`} icon={CloudSun} title="Weather insight" desc={t} tone="primary" />
            ))}
            {upcomingReminders.length === 0 && weatherAdvice.length === 0 && (
              <EmptyState icon={Bell} title="No actions today" description="Add reminders to see daily actions here." action={<Button asChild size="sm" variant="outline"><Link href="/app/reminders">Add reminder</Link></Button>} />
            )}
            {upcomingReminders.map((r) => (
              <ActionCard key={r.id} icon={Bell} title={r.title} desc={`Due ${formatDate(r.due_date)} · ${r.reminder_type}`} tone="primary" />
            ))}
            <ActionCard icon={ShieldCheck} title="Government schemes" desc="Check eligibility for PM-KISAN, PMFBY and more." tone="warning" link="/app/schemes" />
          </div>
        </SectionCard>

        {/* Active crops + notifications */}
        <div className="space-y-6">
          <SectionCard title="Active crops" action={<Button asChild variant="ghost" size="sm"><Link href="/app/crops">Manage</Link></Button>}>
            {activeCrops.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active crops. Add one in the Crops module.</p>
            ) : (
              <div className="space-y-2">
                {activeCrops.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.crop_name}</p>
                      <p className="text-xs text-muted-foreground">{c.growth_stage ?? 'No stage set'}</p>
                    </div>
                    <Badge variant="secondary">{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Notifications" action={<Button asChild variant="ghost" size="sm"><Link href="/app/reminders">Reminders</Link></Button>}>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="rounded-lg bg-muted/40 p-2.5">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Leaf, label: 'Land & Soil', href: '/app/soil', desc: 'Soil health & nutrients' },
          { icon: Droplets, label: 'Irrigation', href: '/app/irrigation', desc: 'Water management' },
          { icon: Brain, label: 'CropWise AI', href: '/app/ai', desc: 'Ask anything' },
          { icon: Scale, label: 'Profit & Loss', href: '/app/profit-loss', desc: 'Financial overview' },
        ].map((q) => (
          <Link key={q.href} href={q.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><q.icon size={20} /></span>
                <div><p className="text-sm font-semibold text-foreground">{q.label}</p><p className="text-xs text-muted-foreground">{q.desc}</p></div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function WeatherIcon({ code, size, className }: { code: number; size?: number; className?: string }) {
  if (code === 0) return <Sun size={size} className={className} />;
  if (code <= 3) return <Cloud size={size} className={className} />;
  if (code >= 51 && code <= 67) return <CloudRain size={size} className={className} />;
  if (code >= 71 && code <= 77) return <CloudRain size={size} className={className} />;
  if (code >= 80) return <CloudRain size={size} className={className} />;
  if (code >= 95) return <CloudRain size={size} className={className} />;
  return <Cloud size={size} className={className} />;
}

function ActionCard({ icon: Icon, title, desc, tone, link }: {
  icon: LucideIcon;
  title: string; desc: string; tone: 'primary' | 'warning'; link?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning')}>
        <Icon size={18} />
      </span>
      <div><p className="text-sm font-semibold text-foreground">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}

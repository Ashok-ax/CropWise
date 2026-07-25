'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CloudSun, Sprout, Bell, ShieldCheck, Droplets, FlaskConical, Milk, Egg, Fish, ArrowRight, Loader2 } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { Reminder, CropRecord, Livestock, Poultry, Fishery } from '@/types/database';
import { useWeather } from '@/hooks/use-weather';
import { weatherFarmingAdvice } from '@/lib/weather';
import { formatDate } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ActionItem = { icon: any; title: string; desc: string; tone: 'primary' | 'warning' | 'destructive'; link?: string };

export default function TodayPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { user } = useAuth();
  const { activeFarm, crops } = useFarm();
  const weather = useWeather(activeFarm?.latitude ?? null, activeFarm?.longitude ?? null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [poultry, setPoultry] = useState<Poultry[]>([]);
  const [fisheries, setFisheries] = useState<Fishery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !activeFarm) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const inWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const [rem, l, p, f] = await Promise.all([
        supabase.from('reminders').select('*').eq('user_id', user.id).eq('status', 'pending').gte('due_date', today).lte('due_date', inWeek).order('due_date', { ascending: true }),
        supabase.from('livestock').select('*').eq('farm_id', activeFarm.id),
        supabase.from('poultry').select('*').eq('farm_id', activeFarm.id),
        supabase.from('fisheries').select('*').eq('farm_id', activeFarm.id),
      ]);
      setReminders((rem.data as Reminder[]) ?? []);
      setLivestock((l.data as Livestock[]) ?? []);
      setPoultry((p.data as Poultry[]) ?? []);
      setFisheries((f.data as Fishery[]) ?? []);
      setLoading(false);
    })();
  }, [user, activeFarm]);

  const actions: ActionItem[] = useMemo(() => {
    const items: ActionItem[] = [];
    if (weather.data) {
      weatherFarmingAdvice(weather.data).slice(0, 2).forEach((t) => items.push({ icon: CloudSun, title: 'Weather insight', desc: t, tone: 'primary', link: '/app/weather' }));
    }
    const activeCrops = crops.filter((c) => c.status !== 'harvested' && c.status !== 'failed');
    activeCrops.forEach((c) => {
      if (c.growth_stage) {
        items.push({ icon: Sprout, title: `${c.crop_name} at ${c.growth_stage} stage`, desc: 'Check crop-specific management guidance for this stage.', tone: 'primary', link: '/app/crops' });
      }
    });
    reminders.forEach((r) => items.push({ icon: Bell, title: r.title, desc: `Due ${formatDate(r.due_date)} · ${r.reminder_type}`, tone: 'warning', link: '/app/reminders' }));
    livestock.forEach((l) => {
      if (l.health_status !== 'healthy') items.push({ icon: Milk, title: `${l.species} health check`, desc: `Health status: ${l.health_status}. Consult a veterinarian.`, tone: 'destructive', link: '/app/livestock' });
    });
    poultry.forEach((p) => {
      if (p.mortality_count > 0) items.push({ icon: Egg, title: `Poultry mortality in ${p.breed}`, desc: `${p.mortality_count} birds lost. Monitor the flock.`, tone: 'destructive', link: '/app/poultry' });
    });
    fisheries.forEach((f) => {
      if (f.water_quality_ph != null && (f.water_quality_ph < 6.5 || f.water_quality_ph > 9)) items.push({ icon: Fish, title: `Pond water pH alert (${f.water_quality_ph})`, desc: `Ideal pH is 6.5-9.0 for ${f.fish_species}.`, tone: 'destructive', link: '/app/fisheries' });
    });
    items.push({ icon: ShieldCheck, title: 'Check government schemes', desc: 'Review eligibility and deadlines for available schemes.', tone: 'warning', link: '/app/schemes' });
    return items;
  }, [weather.data, crops, reminders, livestock, poultry, fisheries]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Today on My Farm"
        description={activeFarm ? `${activeFarm.name} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Your daily action center'}
        icon={CalendarDays}
      />

      {actions.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nothing urgent today" description="Add crops, reminders and activities to see your daily actions." />
      ) : (
        <div className="space-y-3">
          {actions.map((a, i) => <ActionCard key={i} item={a} />)}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CloudSun, label: 'Weather', href: '/app/weather' },
          { icon: Droplets, label: 'Irrigation', href: '/app/irrigation' },
          { icon: FlaskConical, label: 'Fertilizer', href: '/app/fertilizer' },
          { icon: Bell, label: 'All reminders', href: '/app/reminders' },
        ].map((q) => (
          <Link key={q.href} href={q.href}>
            <Card className="transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><q.icon size={20} /></span><p className="text-sm font-semibold text-foreground">{q.label}</p></CardContent></Card>
          </Link>
        ))}
      </div>
      <Disclaimer>Today&apos;s Farm combines weather, crop stage, reminders and activity alerts. Always use your judgement for on-ground decisions.</Disclaimer>
    </div>
  );
}

function ActionCard({ item }: { item: ActionItem }) {
  const content = (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', item.tone === 'primary' ? 'bg-primary/10 text-primary' : item.tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive')}>
        <item.icon size={20} />
      </span>
      <div className="flex-1"><p className="text-sm font-semibold text-foreground">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
      {item.link && <ArrowRight size={16} className="mt-1 text-muted-foreground" />}
    </div>
  );
  return item.link ? <Link href={item.link}>{content}</Link> : content;
}

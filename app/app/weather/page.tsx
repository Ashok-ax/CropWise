'use client';

import { CloudSun, Loader2, Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Lightbulb } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { useFarm } from '@/components/providers/farm-provider';
import { useWeather } from '@/hooks/use-weather';
import { weatherCodeToText, weatherFarmingAdvice } from '@/lib/weather';

export default function WeatherPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { activeFarm } = useFarm();
  const weather = useWeather(activeFarm?.latitude ?? null, activeFarm?.longitude ?? null);
  const advice = weather.data ? weatherFarmingAdvice(weather.data) : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Weather Intelligence" description={activeFarm?.location ?? 'Set farm location in My Farm'} icon={CloudSun} />

      {weather.loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : weather.error ? (
        <EmptyState icon={CloudSun} title="Weather unavailable" description={weather.error} />
      ) : weather.data ? (
        <div className="space-y-6">
          <SectionCard title="Current conditions">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <WeatherIcon code={weather.data.current.weather_code} size={48} className="text-primary" />
                <div>
                  <p className="font-display text-4xl font-bold text-foreground">{Math.round(weather.data.current.temperature)}°C</p>
                  <p className="text-sm text-muted-foreground">{weatherCodeToText(weather.data.current.weather_code)}</p>
                  <p className="text-xs text-muted-foreground">Feels like {Math.round(weather.data.current.apparent_temperature)}°C</p>
                </div>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                <Metric icon={Droplets} label="Humidity" value={`${weather.data.current.humidity}%`} />
                <Metric icon={Wind} label="Wind" value={`${Math.round(weather.data.current.wind_speed)} km/h`} />
                <Metric icon={CloudRain} label="Rain" value={`${weather.data.current.precipitation} mm`} />
                <Metric icon={Thermometer} label="Feels like" value={`${Math.round(weather.data.current.apparent_temperature)}°C`} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="7-day forecast">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {weather.data.daily.map((d, i) => (
                <div key={d.date} className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-xs font-medium text-muted-foreground">{i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                  <div className="my-2 flex justify-center"><WeatherIcon code={d.weather_code} size={24} className="text-primary" /></div>
                  <p className="text-xs text-muted-foreground">{weatherCodeToText(d.weather_code)}</p>
                  <div className="mt-2 flex justify-center gap-2 text-sm">
                    <span className="font-semibold text-foreground">{Math.round(d.temp_max)}°</span>
                    <span className="text-muted-foreground">{Math.round(d.temp_min)}°</span>
                  </div>
                  {d.precipitation_probability > 0 && (
                    <p className="mt-1 flex items-center justify-center gap-1 text-xs text-chart-3"><Droplets size={11} /> {d.precipitation_probability}%</p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Farming advice" description="Weather-based guidance for your farm">
            <div className="space-y-3">
              {advice.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-primary/5 p-3">
                  <Lightbulb size={18} className="mt-0.5 shrink-0 text-primary" />
                  <p className="text-sm text-foreground">{t}</p>
                </div>
              ))}
            </div>
            <Disclaimer>Weather data from Open-Meteo (free, no API key). Advice is general guidance, not guaranteed agricultural recommendation.</Disclaimer>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <Icon size={16} className="text-muted-foreground" />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function WeatherIcon({ code, size, className }: { code: number; size?: number; className?: string }) {
  if (code === 0) return <Sun size={size} className={className} />;
  if (code <= 3) return <Cloud size={size} className={className} />;
  return <CloudRain size={size} className={className} />;
}

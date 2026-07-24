'use client';

import { Settings, Moon, Sun, Bell, Globe, Shield, Info } from 'lucide-react';
import { useTheme } from 'next-themes';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, Disclaimer } from '@/components/app/ui';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/providers/auth-provider';

export default function SettingsPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="Preferences and app configuration" icon={Settings} />

      <SectionCard title="Appearance">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={18} className="text-muted-foreground" /> : <Sun size={18} className="text-muted-foreground" />}
            <div><Label>Dark mode</Label><p className="text-xs text-muted-foreground">Toggle between light and dark themes</p></div>
          </div>
          <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
        </div>
      </SectionCard>

      <div className="mt-6">
        <SectionCard title="Language">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-muted-foreground" />
              <div><Label>Preferred language</Label><p className="text-xs text-muted-foreground">UI language (English active now)</p></div>
            </div>
            <Select defaultValue={profile?.preferred_language ?? 'en'} disabled>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Disclaimer>Tamil and Hindi translations are planned for a future release. The UI is currently in English.</Disclaimer>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Notifications">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Bell size={18} className="text-muted-foreground" /><div><Label>Reminders</Label><p className="text-xs text-muted-foreground">Show reminders on dashboard and Today&apos;s Farm</p></div></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Bell size={18} className="text-muted-foreground" /><div><Label>Weather alerts</Label><p className="text-xs text-muted-foreground">Show weather-based farming advice</p></div></div>
              <Switch defaultChecked />
            </div>
          </div>
          <Disclaimer>Browser, email, SMS and WhatsApp notifications are planned for a future release. Currently reminders show in-app only.</Disclaimer>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Security & privacy">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Shield size={16} className="text-primary" /> Your data is protected by Row Level Security (RLS).</p>
            <p className="flex items-center gap-2"><Shield size={16} className="text-primary" /> Only you can access your farm and financial records.</p>
            <p className="flex items-center gap-2"><Shield size={16} className="text-primary" /> Passwords are managed securely by Supabase Auth.</p>
            <p className="flex items-center gap-2"><Info size={16} className="text-primary" /> No data is shared with third parties.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

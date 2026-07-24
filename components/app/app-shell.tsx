'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/nav';
import { useAuth } from '@/components/providers/auth-provider';
import { useFarm } from '@/components/providers/farm-provider';
import { formatCurrency } from '@/lib/constants';

const groups = ['Overview', 'Farm', 'Plan', 'Finance', 'Resources', 'Assistant', 'Activities', 'More'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { farms, activeFarm, setActiveFarmId } = useFarm();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => (href === '/app' ? pathname === '/app' : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/app"><Logo size="sm" /></Link>
        </div>
        {farms.length > 0 && (
          <div className="border-b border-border p-3">
            <Select value={activeFarm?.id ?? ''} onValueChange={setActiveFarmId}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select farm" /></SelectTrigger>
              <SelectContent>
                {farms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFarm && (
              <p className="mt-1.5 px-1 text-xs text-muted-foreground">
                {activeFarm.land_area ?? '—'} {activeFarm.area_unit} · {activeFarm.soil_type ?? 'No soil type'}
              </p>
            )}
          </div>
        )}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => {
            const items = navItems.filter((i) => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mb-4">
                <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon size={17} />
                    {item.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-lg p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'F'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{profile?.full_name ?? 'Farmer'}</p>
              <p className="truncate text-xs text-muted-foreground">Budget: {formatCurrency(profile?.budget)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <Link href="/app"><Logo size="sm" /></Link>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-background shadow-xl animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo size="sm" />
              <button className="flex h-9 w-9 items-center justify-center rounded-lg" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {farms.length > 0 && (
              <div className="border-b border-border p-3">
                <Select value={activeFarm?.id ?? ''} onValueChange={setActiveFarmId}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <nav className="px-3 py-4">
              {groups.map((group) => {
                const items = navItems.filter((i) => i.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="mb-3">
                    <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive(item.href) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon size={17} /> {item.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </nav>
            <div className="border-t border-border p-3">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
                <LogOut size={16} /> Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 pb-20 pt-20 lg:px-8 lg:pb-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

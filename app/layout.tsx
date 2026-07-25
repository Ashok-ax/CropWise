'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/components/providers/auth-provider';
import { FarmProvider } from '@/components/providers/farm-provider';

const ONBOARDING_EXEMPT = ['/app/profile', '/app/settings'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isExempt = ONBOARDING_EXEMPT.some((p) => pathname === p || pathname.startsWith(p + '/'));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile && !profile.onboarding_completed && !isExempt) {
      router.push('/onboarding');
    }
  }, [user, profile, loading, router, isExempt]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (profile && !profile.onboarding_completed && !isExempt) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return <FarmProvider>{children}</FarmProvider>;
}

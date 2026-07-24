'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for now; wire up to an error monitoring service (e.g. Sentry) here later.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4 text-center">
      <Link href="/" className="mb-8"><Logo /></Link>
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle size={32} />
      </span>
      <h1 className="font-display text-4xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the dashboard.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" className="gap-2" onClick={() => reset()}>
          <RotateCcw size={16} /> Try again
        </Button>
        <Button asChild className="gap-2">
          <Link href="/app/today"><Home size={16} /> Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

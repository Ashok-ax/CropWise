import Link from 'next/link';
import { Sprout, Home, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4 text-center">
      <Link href="/" className="mb-8"><Logo /></Link>
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sprout size={32} />
      </span>
      <h1 className="font-display text-4xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        This field hasn&apos;t been planted yet. The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/"><ArrowLeft size={16} /> Go back</Link>
        </Button>
        <Button asChild className="gap-2">
          <Link href="/app/today"><Home size={16} /> Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

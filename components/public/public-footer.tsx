import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Logo } from '@/components/logo';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Smart Decisions. Better Farming. Better Future.
            </p>
            <div className="mt-4 flex gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Twitter size={16} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Github size={16} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Linkedin size={16} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Mail size={16} />
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground">How it Works</Link></li>
              <li><Link href="/#simulator" className="hover:text-foreground">Farm Simulator</Link></li>
              <li><Link href="/#ai-assistant" className="hover:text-foreground">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#schemes" className="hover:text-foreground">Govt. Schemes</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/login" className="hover:text-foreground">Login</Link></li>
              <li><Link href="/register" className="hover:text-foreground">Register</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Trust & Transparency</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>All estimates are clearly labeled</li>
              <li>Government data is verified</li>
              <li>AI guidance, not guaranteed advice</li>
              <li>Your data stays private (RLS protected)</li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} CropWise. Built for farmers.</p>
          <p>Demo platform — agricultural data shown as estimates.</p>
        </div>
      </div>
    </footer>
  );
}

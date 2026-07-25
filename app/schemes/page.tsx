'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Loader2, ExternalLink, Search, FileText } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { GovernmentScheme } from '@/types/database';
import { formatDate } from '@/lib/constants';

export default function SchemesPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('government_schemes').select('*').order('scheme_name');
      setSchemes((data as GovernmentScheme[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(schemes.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [schemes]);

  const filtered = schemes.filter((s) => {
    const matchSearch = !search || s.scheme_name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || s.category === category;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Government Schemes" description="Real schemes with eligibility, documents and official sources" icon={ShieldCheck} />

      <SectionCard className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search schemes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c === 'all' ? 'All categories' : c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No schemes found" description="Try a different search or category." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((s) => <SchemeCard key={s.id} scheme={s} />)}
        </div>
      )}
      <Disclaimer>Information should be verified with the official government source before applying. Last verified dates shown on each scheme.</Disclaimer>
    </div>
  );
}

function SchemeCard({ scheme }: { scheme: GovernmentScheme }) {
  return (
    <Dialog>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">{scheme.scheme_name}</p>
            <Badge variant="secondary" className="mt-1 capitalize">{scheme.category}</Badge>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{scheme.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Verified {formatDate(scheme.last_verified)}</span>
          <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><FileText size={14} /> Details</Button></DialogTrigger>
        </div>
      </div>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-left">{scheme.scheme_name}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div><p className="font-semibold text-foreground">Description</p><p className="mt-1 text-muted-foreground">{scheme.description}</p></div>
          {scheme.benefits && <div><p className="font-semibold text-foreground">Benefits</p><p className="mt-1 text-muted-foreground">{scheme.benefits}</p></div>}
          {scheme.eligibility && <div><p className="font-semibold text-foreground">Eligibility</p><p className="mt-1 text-muted-foreground">{scheme.eligibility}</p></div>}
          {scheme.required_documents && <div><p className="font-semibold text-foreground">Required documents</p><p className="mt-1 text-muted-foreground">{scheme.required_documents}</p></div>}
          {scheme.application_process && <div><p className="font-semibold text-foreground">Application process</p><p className="mt-1 text-muted-foreground">{scheme.application_process}</p></div>}
          {scheme.official_source && (
            <div>
              <p className="font-semibold text-foreground">Official source</p>
              <a href={scheme.official_source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-primary hover:underline break-all">
                {scheme.official_source} <ExternalLink size={14} />
              </a>
            </div>
          )}
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            Last verified: {formatDate(scheme.last_verified)}. Always verify with the official source before applying.
          </div>
        </div>
        <div className="flex justify-end"><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></div>
      </DialogContent>
    </Dialog>
  );
}

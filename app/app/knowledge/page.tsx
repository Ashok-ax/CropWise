'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Search, Calendar } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { KnowledgeArticle } from '@/types/database';
import { formatDate } from '@/lib/constants';

export default function KnowledgePage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('knowledge_articles').select('*').order('title');
      setArticles((data as KnowledgeArticle[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category));
    return ['all', ...Array.from(set)];
  }, [articles]);

  const filtered = articles.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || a.category === category;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Knowledge Center" description="Searchable farming guides across all categories" icon={BookOpen} />

      <SectionCard className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c === 'all' ? 'All categories' : c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No articles found" description="Try a different search or category." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
      <Disclaimer>Knowledge articles are compiled from ICAR and government sources. Always consult local experts for plot-specific advice.</Disclaimer>
    </div>
  );
}

function ArticleCard({ article }: { article: KnowledgeArticle }) {
  return (
    <Dialog>
      <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        <Badge variant="secondary" className="w-fit capitalize">{article.category}</Badge>
        <p className="mt-2 font-display font-semibold text-foreground">{article.title}</p>
        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar size={12} /> {formatDate(article.last_updated)}</span>
          <DialogTrigger asChild><Button size="sm" variant="outline">Read</Button></DialogTrigger>
        </div>
      </div>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-left">{article.title}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <Badge variant="secondary" className="capitalize">{article.category}</Badge>
          <p className="text-muted-foreground">{article.content}</p>
          {article.sources && (
            <div><p className="font-semibold text-foreground">Sources</p><p className="mt-1 text-xs text-muted-foreground">{article.sources}</p></div>
          )}
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Last updated: {formatDate(article.last_updated)}</div>
        </div>
        <div className="flex justify-end"><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></div>
      </DialogContent>
    </Dialog>
  );
}

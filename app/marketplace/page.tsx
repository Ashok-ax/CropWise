'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Store, Plus, Loader2, Save, Pencil, Trash2, Search, Package, CheckCircle2, Tag } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, EmptyState, Disclaimer, StatCard } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/constants';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Crop', 'Vegetable', 'Fruit', 'Dairy', 'Poultry', 'Fish', 'Livestock', 'Other'] as const;
const UNITS = ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece', 'bunch', 'bag'] as const;

const emptyForm = { title: '', category: 'Crop', quantity: '', unit: 'kg', price: '', description: '' };

export default function MarketplacePage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceListing | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<MarketplaceListing | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Could not load listings: ' + error.message); }
    setListings((data as MarketplaceListing[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (l: MarketplaceListing) => {
    setEditing(l);
    setForm({ title: l.title, category: l.category, quantity: l.quantity.toString(), unit: l.unit, price: l.price.toString(), description: l.description ?? '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.quantity || !form.price) { toast.error('Title, quantity and price are required.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      description: form.description || null,
    };
    if (editing) {
      const { error } = await supabase.from('marketplace_listings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id);
      if (error) toast.error('Update failed: ' + error.message);
      else { toast.success('Listing updated.'); setOpen(false); load(); }
    } else {
      const { error } = await supabase.from('marketplace_listings').insert(payload);
      if (error) toast.error('Create failed: ' + error.message);
      else { toast.success('Listing posted.'); setOpen(false); setForm(emptyForm); load(); }
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', deleteTarget.id);
    if (error) toast.error('Delete failed: ' + error.message);
    else { toast.success('Listing removed.'); setDeleteTarget(null); load(); }
    setDeleting(false);
  };

  const markSold = async (l: MarketplaceListing) => {
    const { error } = await supabase.from('marketplace_listings').update({ status: 'sold', updated_at: new Date().toISOString() }).eq('id', l.id);
    if (error) toast.error('Update failed: ' + error.message);
    else { toast.success('Marked as sold.'); load(); }
  };

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (filterCat !== 'all' && l.category !== filterCat) return false;
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !(l.description ?? '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [listings, search, filterCat]);

  const myListings = filtered.filter((l) => l.user_id === user?.id);
  const otherListings = filtered.filter((l) => l.user_id !== user?.id);
  const activeCount = listings.filter((l) => l.status === 'active').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Marketplace"
        description={`${activeCount} active listings · ${soldCount} sold`}
        icon={Store}
        action={<Button size="sm" onClick={openNew} className="gap-1"><Plus size={14} /> New listing</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total listings" value={listings.length} icon={Store} />
        <StatCard label="Active" value={activeCount} icon={Tag} tone="success" />
        <StatCard label="Sold" value={soldCount} icon={CheckCircle2} />
        <StatCard label="My listings" value={myListings.length} icon={Package} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit listing' : 'New listing'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fresh Tomatoes — 50 kg" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Unit</Label><Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Quantity *</Label><Input type="number" step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 50" /></div>
              <div className="space-y-2"><Label>Price per unit (Rs) *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 30" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Quality, harvest date, organic, etc." /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={save} disabled={saving} className="gap-1">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete listing?</AlertDialogTitle><AlertDialogDescription>This will permanently remove &quot;{deleteTarget?.title}&quot; from the marketplace.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? <Loader2 size={14} className="animate-spin" /> : null} Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings..." className="pl-9" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : listings.length === 0 ? (
        <EmptyState icon={Store} title="No listings yet" description="Post your produce — crops, milk, eggs, fish or livestock — for others to discover." action={<Button onClick={openNew} className="gap-1"><Plus size={14} /> New listing</Button>} />
      ) : (
        <div className="space-y-8">
          {myListings.length > 0 && (
            <SectionCard title="My listings">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((l) => <ListingCard key={l.id} listing={l} isOwn onEdit={() => openEdit(l)} onDelete={() => setDeleteTarget(l)} onMarkSold={() => markSold(l)} />)}
              </div>
            </SectionCard>
          )}
          {otherListings.length > 0 && (
            <SectionCard title="Other farmers' listings">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherListings.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            </SectionCard>
          )}
          {myListings.length === 0 && otherListings.length === 0 && (
            <EmptyState icon={Search} title="No matching listings" description="Try a different search or category filter." />
          )}
        </div>
      )}
      <Disclaimer>This is a listing board — no payments are processed here. Arrange payment and delivery directly with the buyer or seller.</Disclaimer>
    </div>
  );
}

function ListingCard({ listing, isOwn, onEdit, onDelete, onMarkSold }: {
  listing: MarketplaceListing;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkSold?: () => void;
}) {
  const isSold = listing.status === 'sold';
  return (
    <div className={cn('flex flex-col rounded-xl border border-border bg-card p-4', isSold && 'opacity-60')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{listing.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{listing.category} · {formatDate(listing.created_at)}</p>
        </div>
        <Badge variant={isSold ? 'secondary' : 'default'}>{isSold ? 'Sold' : 'Active'}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <p>Quantity: <span className="font-medium text-foreground">{listing.quantity} {listing.unit}</span></p>
        <p>Price: <span className="font-medium text-primary">{formatCurrency(listing.price)}/{listing.unit}</span></p>
        <p className="col-span-2">Total value: <span className="font-medium text-foreground">{formatCurrency(listing.price * listing.quantity)}</span></p>
      </div>
      {listing.description && <p className="mt-3 line-clamp-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">{listing.description}</p>}
      {isOwn ? (
        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1"><Pencil size={12} /> Edit</Button>
          {!isSold && <Button size="sm" variant="outline" onClick={onMarkSold} className="gap-1"><CheckCircle2 size={12} /> Mark sold</Button>}
          <Button size="sm" variant="ghost" onClick={onDelete} className="ml-auto gap-1 text-destructive"><Trash2 size={12} /></Button>
        </div>
      ) : (
        <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">Contact the seller directly to arrange purchase.</div>
      )}
    </div>
  );
}

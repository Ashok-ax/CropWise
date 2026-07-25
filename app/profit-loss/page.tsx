'use client';

import { useMemo, useState } from 'react';
import { Scale, Wallet, TrendingUp, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, StatCard, EmptyState, Disclaimer } from '@/components/app/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/lib/constants';

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))', 'hsl(var(--accent))'];

export default function ProfitLossPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { expenses, revenues, loading } = useFinance();
  const [period, setPeriod] = useState('all');

  const filtered = useMemo(() => {
    if (period === 'all') return { expenses, revenues };
    const now = new Date();
    let start = new Date(0);
    if (period === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === 'quarter') start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    if (period === 'year') start = new Date(now.getFullYear(), 0, 1);
    const startStr = start.toISOString().slice(0, 10);
    return {
      expenses: expenses.filter((e) => e.expense_date >= startStr),
      revenues: revenues.filter((r) => r.revenue_date >= startStr),
    };
  }, [expenses, revenues, period]);

  const totalExp = filtered.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalRev = filtered.revenues.reduce((s, r) => s + Number(r.amount), 0);
  const net = totalRev - totalExp;
  const margin = totalRev > 0 ? Math.round((net / totalRev) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.expenses.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + Number(e.amount); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered.expenses]);

  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.revenues.forEach((r) => { map[r.category] = (map[r.category] ?? 0) + Number(r.amount); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered.revenues]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { exp: number; rev: number }> = {};
    [...filtered.expenses, ...filtered.revenues].forEach((item) => {
      const date = 'expense_date' in item ? item.expense_date : item.revenue_date;
      const key = date.slice(0, 7);
      if (!months[key]) months[key] = { exp: 0, rev: 0 };
      if ('expense_date' in item) months[key].exp += Number(item.amount);
      else months[key].rev += Number(item.amount);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({ name: month, Expenses: v.exp, Revenue: v.rev }));
  }, [filtered.expenses, filtered.revenues]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Profit & Loss" description="Track your farm's financial performance" icon={Scale} action={
        <div className="w-40">
          <Label className="text-xs text-muted-foreground">Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      } />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total expenses" value={formatCurrency(totalExp)} icon={Wallet} tone="destructive" />
        <StatCard label="Total revenue" value={formatCurrency(totalRev)} icon={TrendingUp} tone="success" />
        <StatCard label="Net profit / loss" value={formatCurrency(net)} icon={Scale} tone={net >= 0 ? 'success' : 'destructive'} hint={totalRev > 0 ? `${margin}% margin` : 'No revenue'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Expenses by category">
          {expenseByCategory.length === 0 ? (
            <EmptyState icon={Wallet} title="No expenses" description="Add expenses to see breakdown." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e: any) => e.name}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Revenue by category">
          {revenueByCategory.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No revenue" description="Add revenue to see breakdown." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e: any) => e.name}>
                  {revenueByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Monthly trend (last 6 months with data)">
          {monthlyData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Expenses" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>
      <Disclaimer>Calculations use only the data you enter. Filter by period for specific insights.</Disclaimer>
    </div>
  );
}

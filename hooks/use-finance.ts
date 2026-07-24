'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Expense, Revenue } from '@/types/database';
import { useAuth } from '@/components/providers/auth-provider';

export function useFinance() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const [e, r] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user.id).order('expense_date', { ascending: false }),
      supabase.from('revenues').select('*').eq('user_id', user.id).order('revenue_date', { ascending: false }),
    ]);
    setExpenses((e.data as Expense[]) ?? []);
    setRevenues((r.data as Revenue[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addExpense = async (data: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase.from('expenses').insert({ ...data, user_id: user.id });
    if (error) throw error;
    await load();
  };

  const addRevenue = async (data: Omit<Revenue, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase.from('revenues').insert({ ...data, user_id: user.id });
    if (error) throw error;
    await load();
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    await load();
  };

  const deleteRevenue = async (id: string) => {
    const { error } = await supabase.from('revenues').delete().eq('id', id);
    if (error) throw error;
    await load();
  };

  return { expenses, revenues, loading, addExpense, addRevenue, deleteExpense, deleteRevenue, reload: load };
}

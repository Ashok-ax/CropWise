'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useFarm } from '@/components/providers/farm-provider';

export function useFarmTable<T extends { id: string }>(table: string) {
  const { activeFarm } = useFarm();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!activeFarm) { setItems([]); setLoading(false); return; }
    const { data, error } = await supabase.from(table).select('*').eq('farm_id', activeFarm.id).order('created_at', { ascending: false });
    if (error) toast.error(`Could not load ${table}: ${error.message}`);
    setItems((data as T[]) ?? []);
    setLoading(false);
  }, [activeFarm, table]);

  useEffect(() => { load(); }, [load]);

  const add = async (payload: Record<string, unknown>) => {
    if (!activeFarm) return;
    const { error } = await supabase.from(table).insert({ ...payload, farm_id: activeFarm.id });
    if (error) throw error;
    await load();
  };

  const update = async (id: string, payload: Record<string, unknown>) => {
    const { error } = await supabase.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    await load();
  };

  return { items, loading, add, update, remove, reload: load };
}

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/superbase';
import { Farm, CropRecord } from '@/types/database';
import { useAuth } from '@/components/providers/auth-provider';

type FarmContextValue = {
  farms: Farm[];
  activeFarm: Farm | null;
  crops: CropRecord[];
  loading: boolean;
  setActiveFarmId: (id: string) => void;
  refresh: () => Promise<void>;
  refreshCrops: () => Promise<void>;
};

const FarmContext = createContext<FarmContextValue>({
  farms: [],
  activeFarm: null,
  crops: [],
  loading: true,
  setActiveFarmId: () => {},
  refresh: async () => {},
  refreshCrops: async () => {},
});

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmIdState] = useState<string | null>(null);
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFarms = useCallback(async () => {
    if (!user) {
      setFarms([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Farm load error:', error.message);
      setFarms([]);
      setLoading(false);
      return;
    }
    const list = (data as Farm[]) ?? [];
    setFarms(list);
    if (list.length > 0) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('cropwise_active_farm') : null;
      const id = stored && list.some((f) => f.id === stored) ? stored : list[0].id;
      setActiveFarmIdState(id);
    } else {
      setActiveFarmIdState(null);
    }
    setLoading(false);
  }, [user]);

  const loadCrops = useCallback(async () => {
    if (!activeFarmId) {
      setCrops([]);
      return;
    }
    const { data, error } = await supabase
      .from('crop_records')
      .select('*')
      .eq('farm_id', activeFarmId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Crop load error:', error.message);
      return;
    }
    setCrops((data as CropRecord[]) ?? []);
  }, [activeFarmId]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  const setActiveFarmId = useCallback((id: string) => {
    setActiveFarmIdState(id);
    if (typeof window !== 'undefined') localStorage.setItem('cropwise_active_farm', id);
  }, []);

  const refresh = useCallback(async () => {
    await loadFarms();
  }, [loadFarms]);

  const refreshCrops = useCallback(async () => {
    await loadCrops();
  }, [loadCrops]);

  const activeFarm = useMemo(
    () => farms.find((f) => f.id === activeFarmId) ?? null,
    [farms, activeFarmId]
  );

  const value = useMemo(
    () => ({ farms, activeFarm, crops, loading, setActiveFarmId, refresh, refreshCrops }),
    [farms, activeFarm, crops, loading, setActiveFarmId, refresh, refreshCrops]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  return useContext(FarmContext);
}

export function useRequireFarm() {
  const { farms, activeFarm, loading } = useFarm();
  const router = useRouter();
  useEffect(() => {
    if (!loading && farms.length === 0) {
      router.push('/onboarding');
    }
  }, [loading, farms.length, router]);
  return { farms, activeFarm, loading };
}

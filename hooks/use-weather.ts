'use client';

import { useEffect, useState } from 'react';
import { WeatherData, fetchWeather } from '@/lib/weather';

type State = { data: WeatherData | null; loading: boolean; error: string | null };

export function useWeather(lat: number | null, lon: number | null) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    if (lat == null || lon == null) {
      setState({ data: null, loading: false, error: 'No farm location set. Add coordinates in My Farm to see weather.' });
      return;
    }
    let active = true;
    setState({ data: null, loading: true, error: null });
    fetchWeather(lat, lon)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (active) setState({ data: null, loading: false, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [lat, lon]);

  return state;
}

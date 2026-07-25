'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';

// Leaflet's default marker icon paths break when bundled by Next.js/webpack —
// this points them at a CDN instead of trying to resolve local image assets.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER: [number, number] = [22.3511, 78.6677]; // Geographic center of India, used only if nothing is set yet

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);

  // Initialize the map once on mount.
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const startCenter: [number, number] =
      latitude != null && longitude != null ? [latitude, longitude] : DEFAULT_CENTER;
    const startZoom = latitude != null && longitude != null ? 15 : 5;

    const map = L.map(mapRef.current).setView(startCenter, startZoom);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (latitude != null && longitude != null) {
      const marker = L.marker([latitude, longitude], { icon: markerIcon, draggable: true }).addTo(map);
      markerInstance.current = marker;
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
      onChange(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker in sync if latitude/longitude change from outside (e.g. after "Use my location").
  useEffect(() => {
    if (!mapInstance.current || latitude == null || longitude == null) return;
    placeMarker(latitude, longitude);
    mapInstance.current.setView([latitude, longitude], 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const placeMarker = (lat: number, lng: number) => {
    const map = mapInstance.current;
    if (!map) return;
    if (markerInstance.current) {
      markerInstance.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });
      markerInstance.current = marker;
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS is not available in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        toast.success('Location found.');
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission denied. You can still click the map to set your farm location manually.');
        } else {
          toast.error('Could not get your location. Please click the map instead.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} /> Click the map, or use GPS to drop a pin
        </p>
        <Button type="button" size="sm" variant="outline" onClick={useMyLocation} disabled={locating} className="gap-1.5">
          {locating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
          Use my location
        </Button>
      </div>
      <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-lg border border-border" />
      {latitude != null && longitude != null && (
        <p className="text-xs text-muted-foreground">
          Pinned at {latitude.toFixed(6)}, {longitude.toFixed(6)} — drag the marker to fine-tune.
        </p>
      )}
    </div>
  );
}
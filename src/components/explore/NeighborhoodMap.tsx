"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function NeighborhoodMap({ lat, lng, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing map instance if coordinates or name changes
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapOptions: L.MapOptions & { tap?: boolean } = {
      center: [lat, lng],
      zoom: 14.5,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
      boxZoom: false,
      keyboard: false,
      tap: false,
    };
    const map = L.map(containerRef.current, mapOptions);

    // Add CartoDB Voyager tiles (soft street aesthetic)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(map);

    const customIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-10px, -20px);">
          <div style="width: 18px; height: 18px; background: #1C3A2F; border: 3px solid #C9A84C; border-radius: 50%; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 5px; height: 5px; background: #FFFFFF; border-radius: 50%;"></div>
          </div>
          <span style="font-family: var(--font-inter), sans-serif; font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.95); border: 1.5px solid #EDE8DF; color: #1C3A2F; padding: 3px 6px; border-radius: 6px; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">${name}</span>
        </div>
      `,
      iconSize: [24, 36],
      iconAnchor: [12, 24],
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, name]);

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: "180px", border: "1px solid #EDE8DF" }} />;
}

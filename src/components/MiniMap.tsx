"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MiniMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Bangkok center coordinate
    const mapOptions: L.MapOptions & { tap?: boolean } = {
      center: [13.738, 100.562],
      zoom: 11.5,
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

    const locations = [
      { name: "Ari", coords: [13.7797, 100.5448] as [number, number] },
      { name: "Thonglor", coords: [13.7259, 100.5781] as [number, number] },
      { name: "Sathorn", coords: [13.7242, 100.5284] as [number, number] },
      { name: "Asoke", coords: [13.7369, 100.5604] as [number, number] },
      { name: "Ekkamai", coords: [13.721, 100.585] as [number, number] },
      { name: "On Nut", coords: [13.7056, 100.6015] as [number, number] },
    ];

    locations.forEach((loc) => {
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-10px, -20px);">
            <div style="width: 13px; height: 13px; background: #1C3A2F; border: 2.5px solid #C9A84C; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 3px; height: 3px; background: #FFFFFF; border-radius: 50%;"></div>
            </div>
            <span style="font-family: var(--font-inter), sans-serif; font-size: 7.5px; font-weight: 700; background: rgba(255,255,255,0.92); border: 1px solid #E5E0D8; color: #1C3A2F; padding: 2px 4px; border-radius: 4px; margin-top: 2.5px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${loc.name}</span>
          </div>
        `,
        iconSize: [20, 30],
        iconAnchor: [10, 20],
      });

      L.marker(loc.coords, { icon: customIcon }).addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: "155px" }} />;
}

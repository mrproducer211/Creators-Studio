"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CommuteHub {
  name: string;
  latitude: number;
  longitude: number;
  transitMode: "transit" | "driving" | "walking";
}

interface CommuteMapProps {
  propertyLat: number;
  propertyLng: number;
  propertyName: string;
  commuteHubs: CommuteHub[];
}

export default function CommuteMap({
  propertyLat,
  propertyLng,
  propertyName,
  commuteHubs,
}: CommuteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapOptions: L.MapOptions & { tap?: boolean } = {
      center: [propertyLat, propertyLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
      tap: false,
    };

    const map = L.map(containerRef.current, mapOptions);

    // Add CartoDB Voyager tiles (premium, warm street layout)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(map);

    // 1. Add Property Marker (Dark Forest Green)
    const propertyIcon = L.divIcon({
      className: "custom-property-pin",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-10px, -20px);">
          <div style="width: 20px; height: 20px; background: #1C3A2F; border: 3.5px solid #C9A84C; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;"></div>
          </div>
          <span style="font-family: var(--font-inter), sans-serif; font-size: 9px; font-weight: 700; background: rgba(28,58,47,0.95); color: #FFFFFF; padding: 2px 6px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">${propertyName}</span>
        </div>
      `,
      iconSize: [24, 36],
      iconAnchor: [12, 24],
    });

    L.marker([propertyLat, propertyLng], { icon: propertyIcon }).addTo(map);

    // Bounds tracking to auto-fit all markers
    const bounds = L.latLngBounds([[propertyLat, propertyLng]]);

    // 2. Add Commute Hubs & Connect with Dotted Polyline Routes
    commuteHubs.forEach((hub) => {
      const hubLat = Number(hub.latitude);
      const hubLng = Number(hub.longitude);
      if (isNaN(hubLat) || isNaN(hubLng)) return;

      bounds.extend([hubLat, hubLng]);

      // Hub Emoji indicator
      const emoji = hub.transitMode === "walking" ? "🚶" : hub.transitMode === "driving" ? "🚗" : "🚆";

      // Hub Marker (Gold/Cream Theme)
      const hubIcon = L.divIcon({
        className: "custom-hub-pin",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-10px, -20px);">
            <div style="width: 18px; height: 18px; background: #C9A84C; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 9px;">
              ${emoji}
            </div>
            <span style="font-family: var(--font-inter), sans-serif; font-size: 8.5px; font-weight: 600; background: rgba(255,255,255,0.95); color: #1C3A2F; border: 1px solid #EDE8DF; padding: 1.5px 5px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${hub.name}</span>
          </div>
        `,
        iconSize: [24, 36],
        iconAnchor: [12, 24],
      });

      L.marker([hubLat, hubLng], { icon: hubIcon }).addTo(map);

      // Dotted Polyline Route
      L.polyline([[propertyLat, propertyLng], [hubLat, hubLng]], {
        color: "#1C3A2F",
        weight: 2,
        dashArray: "6, 8",
        opacity: 0.75,
      }).addTo(map);
    });

    // 3. Fit bounds if there are hubs
    if (commuteHubs.length > 0) {
      map.fitBounds(bounds, {
        padding: [35, 35],
        maxZoom: 16,
      });
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [propertyLat, propertyLng, propertyName, commuteHubs]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "220px", border: "1px solid #EDE8DF" }}
    />
  );
}

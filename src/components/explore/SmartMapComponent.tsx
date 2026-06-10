"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PropertyCard } from "@/types/property";
import { NEIGHBORHOODS, Neighborhood } from "@/data/neighborhoods";

interface Props {
  properties: PropertyCard[];
  scores: Record<number, number>; // Property ID -> Match score percentage
  selectedPropertyId: number | null;
  onSelectProperty: (id: number | null) => void;
  detectedArea: string | null;
}

const BTS_STATIONS: Record<string, { name: string; lat: number; lng: number }> = {
  "Ari": { name: "Ari BTS", lat: 13.7797, lng: 100.5448 },
  "Sathorn": { name: "Chong Nonsi BTS", lat: 13.7242, lng: 100.5284 },
  "Thong Lo": { name: "Thong Lo BTS", lat: 13.7259, lng: 100.5781 },
  "Asok": { name: "Asok BTS / Sukhumvit MRT", lat: 13.7369, lng: 100.5604 },
  "Silom": { name: "Sala Daeng BTS / Si Lom MRT", lat: 13.7285, lng: 100.5342 },
  "On Nut": { name: "On Nut BTS", lat: 13.7057, lng: 100.5999 },
  "Ekkamai": { name: "Ekkamai BTS", lat: 13.7196, lng: 100.5852 },
  "Sukhumvit": { name: "Phrom Phong BTS", lat: 13.7303, lng: 100.5698 },
  "Rama 9": { name: "Rama 9 MRT", lat: 13.7558, lng: 100.5658 },
  "Bang Na": { name: "Bang Na BTS", lat: 13.6682, lng: 100.6070 },
  "Huai Khwang": { name: "Huai Khwang MRT", lat: 13.7788, lng: 100.5742 },
  "Phaya Thai": { name: "Phaya Thai BTS", lat: 13.7569, lng: 100.5348 }
};

const isValidLatLng = (lat: any, lng: any): boolean => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export default function SmartMapComponent({
  properties,
  scores,
  selectedPropertyId,
  onSelectProperty,
  detectedArea,
}: Props) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const circleRef = useRef<L.Circle | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Helper to resolve property coordinates (using spiral offsets if DB values are missing)
  const getPropertyCoords = useCallback((p: PropertyCard): [number, number] | null => {
    if (p.latitude && p.longitude && isValidLatLng(p.latitude, p.longitude)) {
      return [Number(p.latitude), Number(p.longitude)];
    }

    // Fallback based on neighborhood centroids
    const n = NEIGHBORHOODS.find((item) => item.name.toLowerCase() === p.area.toLowerCase());
    if (n && isValidLatLng(n.lat, n.lng)) {
      // Deterministic offset to separate properties in the same neighborhood
      const angle = (p.id * 137.5 * Math.PI) / 180; // Golden angle distribution
      const radius = 0.0025 + (p.id % 5) * 0.0006;  // Spiral outwards
      return [n.lat + Math.sin(angle) * radius, n.lng + Math.cos(angle) * radius];
    }

    return null;
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    // Bangkok center
    const mapOptions: L.MapOptions & { tap?: boolean } = {
      center: [13.738, 100.562],
      zoom: 12.5,
      zoomControl: false,
      attributionControl: false,
      tap: false,
    };
    const map = L.map(containerRef.current, mapOptions);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    setMapInstance(map);

    return () => {
      map.remove();
      setMapInstance(null);
      initializedRef.current = false;
    };
  }, []);

  // Fit bounds when map or properties list changes
  useEffect(() => {
    if (!mapInstance || properties.length === 0) return;
    if (containerRef.current && containerRef.current.offsetWidth === 0) return;

    const coordsList: L.LatLngTuple[] = [];

    // Collect all valid property coordinates
    properties.forEach((p) => {
      const coords = getPropertyCoords(p);
      if (coords) coordsList.push(coords);
    });

    // Add detected BTS station coordinate to map bounds focus
    if (detectedArea && BTS_STATIONS[detectedArea]) {
      const station = BTS_STATIONS[detectedArea];
      if (isValidLatLng(station.lat, station.lng)) {
        coordsList.push([station.lat, station.lng]);
      }
    }

    if (coordsList.length > 0) {
      try {
        const bounds = L.latLngBounds(coordsList);
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14.5 });
      } catch (err) {
        console.warn("Leaflet fitBounds failed on SmartMapComponent:", err);
      }
    }
  }, [mapInstance, properties, detectedArea, getPropertyCoords]);

  // Update Markers and Boundaries
  useEffect(() => {
    if (!mapInstance) return;
    if (containerRef.current && containerRef.current.offsetWidth === 0) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Clear old area circle
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // 1. Draw Neighborhood Shaded Circle Boundary
    if (detectedArea) {
      const n = NEIGHBORHOODS.find((item) => item.name.toLowerCase() === detectedArea.toLowerCase());
      if (n && isValidLatLng(n.lat, n.lng)) {
        const circle = L.circle([n.lat, n.lng], {
          radius: 1200, // 1.2km radius boundary
          color: "#C9A84C",
          fillColor: "#1C3A2F",
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: "6, 6",
        }).addTo(mapInstance);

        circle.bindTooltip(
          `<div style="font-family: inherit; font-size:10px; font-weight:700; color:#1C3A2F;">
            📍 ${n.name} boundary
          </div>`,
          { sticky: true, opacity: 0.9, className: "custom-map-tooltip" }
        );

        circleRef.current = circle;
      }
    }

    // 2. Add BTS Train Station pins
    if (detectedArea && BTS_STATIONS[detectedArea]) {
      const station = BTS_STATIONS[detectedArea];
      if (isValidLatLng(station.lat, station.lng)) {
        const btsIcon = L.divIcon({
          className: "custom-bts-pin",
          html: `
            <div style="
              width: 26px;
              height: 26px;
              background: #3B82F6;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="font-size: 11px;">🚇</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const btsMarker = L.marker([station.lat, station.lng], { icon: btsIcon })
          .addTo(mapInstance);

        btsMarker.bindTooltip(
          `<div style="font-family: inherit; font-size:10px; font-weight:800; color:#1E3A8A; padding: 1px 3px;">
            ${station.name}
          </div>`,
          { direction: "top", permanent: true, opacity: 0.9, offset: [0, -10], className: "custom-map-tooltip" }
        );

        markersRef.current["__bts_station"] = btsMarker;
      }
    }

    // 3. Drop Property Pins
    properties.forEach((p) => {
      const coords = getPropertyCoords(p);
      if (!coords) return;

      const score = scores[p.id] || 90;
      const isSelected = selectedPropertyId === p.id;
      const markerSize = isSelected ? 34 : 26;

      // Premium marker HTML showing match score
      const pinColor = score >= 90 ? "#10B981" : score >= 80 ? "#F59E0B" : "#EF4444";
      const markerIcon = L.divIcon({
        className: "custom-property-pin",
        html: `
          <div style="
            position: relative;
            width: ${markerSize}px;
            height: ${markerSize}px;
            background: ${pinColor};
            border-radius: 50%;
            border: 2px.5px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s ease;
            transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
            z-index: ${isSelected ? 9999 : 100};
          ">
            <span style="color:#FFFFFF; font-size:${isSelected ? "10px" : "8.5px"}; font-weight:800;">
              ${score}%
            </span>

            ${isSelected ? '<div style="position:absolute; bottom:-3px; width:6px; height:6px; background:#FFFFFF; transform:rotate(45deg);"></div>' : ""}
          </div>
          ${
            isSelected
              ? `<div style="
                  position: absolute;
                  top: -2px;
                  left: -2px;
                  width: ${markerSize + 4}px;
                  height: ${markerSize + 4}px;
                  border: 2px solid ${pinColor};
                  border-radius: 50%;
                  animation: map-pulse 1.3s infinite ease-in-out;
                  pointer-events: none;
                "></div>`
              : ""
          }
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker(coords, { icon: markerIcon })
        .addTo(mapInstance)
        .on("click", () => {
          onSelectProperty(p.id);
        })
        .on("mouseover", () => {
          onSelectProperty(p.id);
        });

      const formattedPrice = p.priceLabel 
        ? `${Math.round(p.priceTHB / 1000)}k THB${p.priceLabel}`
        : `${(p.priceTHB / 1000000).toFixed(1)}M THB`;

      marker.bindTooltip(
        `<div style="font-family: inherit; font-size:10px; font-weight:700; color:#1C3A2F;">
          <strong>${p.name}</strong><br/>
          <span style="color:#9A7829; font-weight:bold;">${formattedPrice}</span>
         </div>`,
        { direction: "top", permanent: false, opacity: 0.95 }
      );

      markersRef.current[`property_${p.id}`] = marker;
    });

    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    };
  }, [mapInstance, properties, scores, selectedPropertyId, detectedArea, onSelectProperty, getPropertyCoords]);

  // Center or pan to selected property when selection changes
  useEffect(() => {
    if (!mapInstance || selectedPropertyId === null) return;
    if (containerRef.current && containerRef.current.offsetWidth === 0) return;

    const selectedProp = properties.find((p) => p.id === selectedPropertyId);
    if (!selectedProp) return;

    const coords = getPropertyCoords(selectedProp);
    if (coords && isValidLatLng(coords[0], coords[1])) {
      try {
        mapInstance.panTo(coords, { animate: true, duration: 0.8 });
      } catch (err) {
        console.warn("Leaflet panTo failed on selection change:", err);
      }
    }
  }, [mapInstance, selectedPropertyId, properties, getPropertyCoords]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: "350px", overflow: "hidden" }}>
      <div ref={containerRef} className="w-full h-full" style={{ background: "#E5E0D8" }} />
      <style>{`
        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-bar {
          border: 1px solid #E5E0D8 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          border-radius: 12px !important;
          overflow: hidden;
          background: #FFFFFF !important;
        }
        .leaflet-bar a {
          background-color: #FFFFFF !important;
          color: #1C3A2F !important;
          border-bottom: 1px solid #E5E0D8 !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-weight: bold;
        }
        .leaflet-bar a:hover {
          background-color: #F7F3EC !important;
        }
        .custom-map-tooltip {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid #EADFCF !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05) !important;
          font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}

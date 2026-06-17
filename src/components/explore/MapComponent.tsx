"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Neighborhood } from "@/data/neighborhoods";

interface Props {
  neighborhoods: Neighborhood[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  workplace: string;
  workplaceCoords: [number, number] | null;
  maxCommute: number;
  matchedSlugs: string[]; // Slugs of top AI matches
  selectedLayer: string; // match, lifestyle, commute, budget, expat, pet, luxury
  liveScores?: Record<string, number>; // Live compatibility scores mapped by slug
}

const isValidLatLng = (coords: unknown): coords is [number, number] => {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number" &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1])
  );
};

function getLandmarkSvg(type: string, size = 11): string {
  const stroke = "#FFFFFF";
  const strokeWidth = 2.5;
  if (type === "transit") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 15h8M12 2v13"/></svg>`;
  }
  if (type === "cafe") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>`;
  }
  if (type === "mall") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>`;
  }
  if (type === "coworking") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="11" x="2" y="4" rx="2" ry="2"/><path d="M6 14h12M2 18h20M12 4v10"/></svg>`;
  }
  if (type === "park") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5M17 12H7M12 2l-8 8h16Z"/></svg>`;
  }
  if (type === "viewpoint") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M6 6h2v2H6zm6 0h2v2h-2zm6 0h2v2h-2zM6 12h2v2H6zm6 0h2v2h-2zm6 0h2v2h-2zM6 18h2v2H6zm6 0h2v2h-2zm6 0h2v2h-2z"/></svg>`;
  }
  return "";
}

export default function MapComponent({
  neighborhoods,
  selectedSlug,
  onSelect,
  workplace,
  workplaceCoords,
  maxCommute,
  matchedSlugs,
  selectedLayer,
  liveScores,
}: Props) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const initializedRef = useRef<boolean>(false);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Helper to calculate distance in km using Haversine formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Helper to get commute minutes dynamically
  const getCommuteMinutes = useCallback((n: Neighborhood, workplaceName: string): number => {
    if (n.commuteMinutes && n.commuteMinutes[workplaceName] !== undefined) {
      return n.commuteMinutes[workplaceName];
    }
    if (workplaceCoords && isValidLatLng(workplaceCoords) && typeof n.lat === "number" && typeof n.lng === "number" && !isNaN(n.lat) && !isNaN(n.lng)) {
      const [wLat, wLng] = workplaceCoords;
      const dist = getDistance(n.lat, n.lng, wLat, wLng);
      return Math.round(dist * 3.5 + (dist > 0 ? 2 : 0));
    }
    return 15;
  }, [workplaceCoords]);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    // Bangkok center coordinate
    const mapOptions: L.MapOptions & { tap?: boolean } = {
      center: [13.738, 100.562],
      zoom: 12.5,
      zoomControl: false,
      attributionControl: false,
      tap: false, // Prevents iOS tap latency/double-click issues
    };
    const map = L.map(containerRef.current, mapOptions);

    // Add CartoDB Voyager tiles (Google Map style: clean, soft streets, green parks, light blue water)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    setMapInstance(map);

    return () => {
      map.remove();
      initializedRef.current = false;
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    };
  }, []);

  // Fit map bounds when map is initialized or workplace/neighborhoods changes
  useEffect(() => {
    if (!mapInstance) return;

    const boundsPoints: L.LatLngTuple[] = neighborhoods
      .filter((n) => typeof n.lat === "number" && typeof n.lng === "number" && !isNaN(n.lat) && !isNaN(n.lng))
      .map(n => [n.lat, n.lng] as L.LatLngTuple);
    if (workplaceCoords && isValidLatLng(workplaceCoords)) {
      boundsPoints.push(workplaceCoords);
    }
    if (boundsPoints.length > 0) {
      try {
        const bounds = L.latLngBounds(boundsPoints);
        mapInstance.fitBounds(bounds, { padding: [60, 60], maxZoom: 13.5 });
      } catch (err) {
        console.warn("Leaflet fitBounds failed:", err);
      }
    }
  }, [mapInstance, workplaceCoords, neighborhoods]);

  // Update markers on change of data/workplace/commute/selection/layer
  useEffect(() => {
    if (!mapInstance) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Clear old polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    neighborhoods.forEach((n) => {
      if (typeof n.lat !== "number" || typeof n.lng !== "number" || isNaN(n.lat) || isNaN(n.lng)) {
        return;
      }
      const isMatched = matchedSlugs.includes(n.slug);

      // Determine score value and display value based on selected layer
      let scoreVal = 8; // default fallback
      let displayVal = "";
      const isMatchLayer = selectedLayer === "match";

      if (isMatchLayer && liveScores) {
        const pct = liveScores[n.slug] || 50;
        scoreVal = Math.round(pct / 10);
        displayVal = `${pct}%`;
      } else if (selectedLayer === "lifestyle") {
        scoreVal = Math.round((n.scores.remoteWork + n.scores.cafeCulture + n.scores.walkability) / 3);
        displayVal = String(scoreVal);
      } else if (selectedLayer === "commute") {
        const mins = getCommuteMinutes(n, workplace);
        if (mins === 0) scoreVal = 10;
        else if (mins <= 10) scoreVal = 9;
        else if (mins <= 20) scoreVal = 8;
        else if (mins <= 30) scoreVal = 6;
        else scoreVal = 3;
        displayVal = String(scoreVal);
      } else if (selectedLayer === "budget") {
        // Less rent = more affordable (higher score)
        if (n.averageRentMax <= 30000) scoreVal = 9;
        else if (n.averageRentMax <= 60000) scoreVal = 7;
        else scoreVal = 4;
        displayVal = String(scoreVal);
      } else if (selectedLayer === "expat") {
        scoreVal = n.scores.expatCommunity;
        displayVal = String(scoreVal);
      } else if (selectedLayer === "pet") {
        scoreVal = n.scores.petFriendly;
        displayVal = String(scoreVal);
      } else if (selectedLayer === "luxury") {
        scoreVal = n.scores.luxury;
        displayVal = String(scoreVal);
      } else {
        displayVal = String(scoreVal);
      }

      // Color coding pins based on compatibility score
      let color = "#EF4444"; // Low Fit (Red)
      if (isMatchLayer && liveScores) {
        const pct = liveScores[n.slug] || 50;
        if (pct >= 85) {
          color = "#10B981"; // High Fit (Green)
        } else if (pct >= 65) {
          color = "#F59E0B"; // Moderate Fit (Yellow)
        }
      } else {
        if (scoreVal >= 8) {
          color = "#10B981"; // High Fit (Green)
        } else if (scoreVal >= 5) {
          color = "#F59E0B"; // Moderate Fit (Yellow)
        }
      }

      const isSelected = selectedSlug === n.slug;
      
      // Adapt marker size for the match percentages
      const markerSize = isSelected 
        ? (isMatchLayer ? 38 : 30) 
        : isMatched 
          ? (isMatchLayer ? 34 : 26) 
          : (isMatchLayer ? 30 : 22);

      // Custom premium HTML marker with score or percentage inside
      const markerIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            position: relative;
            width: ${markerSize}px;
            height: ${markerSize}px;
            background: ${color};
            border-radius: 50%;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <span style="color:#FFFFFF; font-size:${isSelected ? (isMatchLayer ? '10.5px' : '11px') : (isMatchLayer ? '9px' : '9.5px')}; font-weight:bold;">
              ${displayVal}
            </span>
            ${isSelected ? '<div style="position:absolute; bottom:-4px; width:8px; height:8px; background:#FFFFFF; transform:rotate(45deg);"></div>' : ""}
          </div>
          ${
            isMatched || isSelected
              ? `<div style="
                  position: absolute;
                  top: -2px;
                  left: -2px;
                  width: ${markerSize + 4}px;
                  height: ${markerSize + 4}px;
                  border: 2.5px solid ${color};
                  border-radius: 50%;
                  animation: map-pulse ${isSelected ? '1.4s' : '1.8s'} infinite ease-in-out;
                  pointer-events: none;
                "></div>`
              : ""
          }
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker([n.lat, n.lng], { icon: markerIcon })
        .addTo(mapInstance)
        .on("click", () => {
          onSelect(n.slug);
          try {
            mapInstance.flyTo([n.lat, n.lng], 13.5, { animate: true, duration: 1.2 });
          } catch (err) {
            console.warn("Leaflet marker flyTo failed:", err);
          }
        });

      // Bind permanent bubble tooltip showing neighborhood name and commute (if applicable)
      const commuteText = workplace ? ` (${getCommuteMinutes(n, workplace)}m)` : "";
      marker.bindTooltip(
        `<div style="font-family: inherit; font-size:11px; font-weight:700; color:#1C3A2F; padding:0px 2px;">
          ${n.name}${commuteText}
         </div>`,
        { direction: "top", permanent: true, opacity: 0.95, offset: [0, -10], className: "custom-map-tooltip" }
      );

      markersRef.current[n.slug] = marker;
    });

    // 3. Render local landmarks if a neighborhood section is selected/focused
    if (selectedSlug) {
      const activeN = neighborhoods.find((n) => n.slug === selectedSlug);
      if (activeN && typeof activeN.lat === "number" && typeof activeN.lng === "number" && !isNaN(activeN.lat) && !isNaN(activeN.lng)) {
        const landmarks: { name: string; type: "transit" | "cafe" | "mall" | "coworking" | "park" | "viewpoint"; icon: string; lat: number; lng: number }[] = [];
        
        // 1. Transit Station
        if (activeN.nearestTransit) {
          landmarks.push({
            name: activeN.nearestTransit,
            type: "transit",
            icon: "🚆",
            lat: activeN.lat + 0.0012,
            lng: activeN.lng - 0.001,
          });
        }

        // 2. Coffee Shops / Cafes (up to 2)
        activeN.cafes.slice(0, 2).forEach((cafe, idx) => {
          const angle = idx === 0 ? Math.PI / 4 : 5 * Math.PI / 4;
          landmarks.push({
            name: cafe,
            type: "cafe",
            icon: "☕",
            lat: activeN.lat + Math.sin(angle) * 0.0022,
            lng: activeN.lng + Math.cos(angle) * 0.0022,
          });
        });

        // 3. Retail Malls (up to 2)
        activeN.malls.slice(0, 2).forEach((mall, idx) => {
          const angle = idx === 0 ? 3 * Math.PI / 4 : 7 * Math.PI / 4;
          landmarks.push({
            name: mall,
            type: "mall",
            icon: "🛍️",
            lat: activeN.lat + Math.sin(angle) * 0.0028,
            lng: activeN.lng + Math.cos(angle) * 0.0028,
          });
        });

        // 4. Coworking / Workspots (up to 2)
        activeN.coworkingSpaces.slice(0, 2).forEach((space, idx) => {
          const angle = idx === 0 ? Math.PI / 2 : 3 * Math.PI / 2;
          landmarks.push({
            name: space,
            type: "coworking",
            icon: "💻",
            lat: activeN.lat + Math.sin(angle) * 0.0018,
            lng: activeN.lng + Math.cos(angle) * 0.0018,
          });
        });

        // 5. Parks & Green Spaces (up to 2)
        activeN.parks.slice(0, 2).forEach((park, idx) => {
          const angle = idx === 0 ? 0 : Math.PI;
          landmarks.push({
            name: park,
            type: "park",
            icon: "🌳",
            lat: activeN.lat + Math.sin(angle) * 0.0032,
            lng: activeN.lng + Math.cos(angle) * 0.0032,
          });
        });

        // 6. High-Angle Location (Rooftop Bars & Viewpoints)
        const viewpoints: Record<string, string> = {
          ari: "Roof24 Rooftop Bar",
          sathorn: "Vertigo Rooftop Bar (Banyan Tree)",
          "thong-lo": "Octave Rooftop Lounge (Marriott)",
          asok: "Sky on 20 Rooftop",
          silom: "Lebua Sirocco Sky Bar",
          "on-nut": "Cielo Sky Bar & Restaurant",
          ekkamai: "Tichuca Rooftop Bar",
          sukhumvit: "Vanilla Sky Rooftop Bar",
        };
        const vpName = viewpoints[activeN.slug];
        if (vpName) {
          landmarks.push({
            name: vpName,
            type: "viewpoint",
            icon: "🏙️",
            lat: activeN.lat - 0.0015,
            lng: activeN.lng + 0.0016,
          });
        }

        landmarks.forEach((lm, idx) => {
          if (typeof lm.lat !== "number" || typeof lm.lng !== "number" || isNaN(lm.lat) || isNaN(lm.lng)) {
            return;
          }
          const colorMap: Record<string, string> = {
            transit: "#3B82F6",
            cafe: "#8B5CF6",
            mall: "#EC4899",
            coworking: "#F59E0B",
            park: "#10B981",
            viewpoint: "#C9A84C",
          };
          const markerColor = colorMap[lm.type] || "#6B7280";

          const lmIcon = L.divIcon({
            className: `landmark-${lm.type}-pin animate-fadeIn`,
            html: `
              <div style="
                position: relative;
                width: 20px;
                height: 20px;
                background: ${markerColor};
                border-radius: 50%;
                border: 1.5px solid #FFFFFF;
                box-shadow: 0 2px 5px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <span style="font-size: 10px; line-height: 1; display: flex; align-items: center; justify-content: center;">${getLandmarkSvg(lm.type)}</span>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const lmMarker = L.marker([lm.lat, lm.lng], { icon: lmIcon })
            .addTo(mapInstance);

          lmMarker.bindTooltip(
            `<div style="font-family: inherit; font-size:9.5px; font-weight:700; color:#333; padding:0px 2px;">
              ${lm.name}
             </div>`,
            { direction: "top", permanent: true, opacity: 0.9, offset: [0, -6], className: "landmark-tooltip" }
          );

          markersRef.current[`__landmark_${idx}`] = lmMarker;
        });
      }
    }

    // Draw commute lines and add workplace marker if coordinates exist
    if (workplaceCoords && isValidLatLng(workplaceCoords)) {
      // 1. Draw dashed commute path between selected neighborhood and workplace
      if (selectedSlug) {
        const activeN = neighborhoods.find((n) => n.slug === selectedSlug);
        if (activeN && typeof activeN.lat === "number" && typeof activeN.lng === "number" && !isNaN(activeN.lat) && !isNaN(activeN.lng)) {
          const pathCoords: L.LatLngTuple[] = [
            [activeN.lat, activeN.lng],
            workplaceCoords,
          ];
          const mins = getCommuteMinutes(activeN, workplace);
          
          const polyline = L.polyline(pathCoords, {
            color: "#2563EB",
            weight: 3,
            opacity: 0.8,
            dashArray: "6, 8",
            lineCap: "round",
            lineJoin: "round",
          }).addTo(mapInstance);

          polyline.bindTooltip(
            `<div style="font-family: inherit; font-size:10px; font-weight:800; color:#2563EB; padding:1px 3px;">
              Commute: ${mins} mins to ${workplace}
             </div>`,
            { sticky: true, opacity: 0.95, className: "commute-line-tooltip" }
          );

          polylineRef.current = polyline;
        }
      }

      // 2. Drop workplace icon pin
      const markerIcon = L.divIcon({
        className: "workplace-map-pin",
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: #2563EB;
            border-radius: 50%;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse-workplace 2s infinite ease-in-out;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const wMarker = L.marker(workplaceCoords, { icon: markerIcon })
        .addTo(mapInstance);

      wMarker.bindTooltip(
        `<div style="font-family: inherit; font-size:11px; font-weight:800; color:#FFFFFF; padding:1px 3px;">
          Workplace: ${workplace}
         </div>`,
        { direction: "top", permanent: true, opacity: 0.95, offset: [0, -12], className: "workplace-tooltip" }
      );

      markersRef.current["__workplace"] = wMarker;

      // 3. Highlight local spots around custom workplace city input
      const isCustomWorkplace = !neighborhoods.some((n) => n.name.toLowerCase() === workplace.toLowerCase());
      if (isCustomWorkplace && workplace && workplaceCoords && isValidLatLng(workplaceCoords)) {
        const customLandmarks = [
          { name: `Transit Near ${workplace}`, icon: "🚆", type: "transit", latOffset: 0.001, lngOffset: -0.001 },
          { name: `Coffee Shop Near ${workplace}`, icon: "☕", type: "cafe", latOffset: -0.0012, lngOffset: 0.001 },
          { name: `Restaurant Near ${workplace}`, icon: "🍽️", type: "cafe", latOffset: 0.0008, lngOffset: 0.0015 },
          { name: `High-Angle Viewpoint`, icon: "🏙️", type: "viewpoint", latOffset: -0.0006, lngOffset: -0.0012 },
        ];
        
        customLandmarks.forEach((lm, index) => {
          const colorMap: Record<string, string> = {
            transit: "#3B82F6",
            cafe: "#8B5CF6",
            viewpoint: "#C9A84C",
          };
          const markerColor = colorMap[lm.type] || "#6B7280";

          const lmIcon = L.divIcon({
            className: `landmark-${lm.type}-pin animate-fadeIn`,
            html: `
              <div style="
                position: relative;
                width: 18px;
                height: 18px;
                background: ${markerColor};
                border-radius: 50%;
                border: 1.5px solid #FFFFFF;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <span style="font-size: 9px; line-height: 1; display: flex; align-items: center; justify-content: center;">${getLandmarkSvg(lm.type, 9)}</span>
              </div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });

          const lmMarker = L.marker([workplaceCoords[0] + lm.latOffset, workplaceCoords[1] + lm.lngOffset], { icon: lmIcon })
            .addTo(mapInstance);

          lmMarker.bindTooltip(
            `<div style="font-family: inherit; font-size:9px; font-weight:700; color:#333; padding:0px 2px;">
              ${lm.name}
             </div>`,
            { direction: "top", permanent: true, opacity: 0.85, offset: [0, -5], className: "landmark-tooltip" }
          );

          markersRef.current[`__custom_landmark_${index}`] = lmMarker;
        });
      }
    }
  }, [mapInstance, neighborhoods, selectedSlug, workplace, workplaceCoords, maxCommute, matchedSlugs, onSelect, selectedLayer, liveScores, getCommuteMinutes]);

  // Center map on selection
  useEffect(() => {
    if (!mapInstance || !selectedSlug) return;

    const n = neighborhoods.find((item) => item.slug === selectedSlug);
    if (n && typeof n.lat === "number" && typeof n.lng === "number" && !isNaN(n.lat) && !isNaN(n.lng)) {
      try {
        mapInstance.flyTo([n.lat, n.lng], 13.5, { animate: true, duration: 1.2 });
      } catch (err) {
        console.warn("Leaflet flyTo failed:", err);
      }
    }
  }, [mapInstance, selectedSlug, neighborhoods]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "350px", background: "#E5E0D8" }} />
      <style>{`
        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pulse-workplace {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-bar {
          border: 1.5px solid #E5E0D8 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          border-radius: 12px !important;
          overflow: hidden;
          background: #FFFFFF !important;
        }
        .leaflet-bar a {
          background-color: #FFFFFF !important;
          color: #1C3A2F !important;
          border-bottom: 1px solid #E5E0D8 !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          font-weight: bold;
        }
        .leaflet-bar a:hover {
          background-color: #F7F3EC !important;
        }
        .custom-map-tooltip {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border: 1.5px solid #E5E0D8 !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06) !important;
          font-family: inherit !important;
          font-weight: bold !important;
        }
        .custom-map-tooltip::before {
          border-top-color: #E5E0D8 !important;
        }
        .workplace-tooltip {
          background-color: #2563EB !important;
          border: 1.5px solid #FFFFFF !important;
          border-radius: 8px !important;
          color: #FFFFFF !important;
          box-shadow: 0 2px 8px rgba(37,99,235,0.4) !important;
          font-weight: bold !important;
        }
        .workplace-tooltip::before {
          border-top-color: #2563EB !important;
        }
        .landmark-tooltip {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border: 1.5px solid #E5E0D8 !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06) !important;
          font-family: inherit !important;
          font-weight: bold !important;
          color: #333333 !important;
        }
        .landmark-tooltip::before {
          border-top-color: #E5E0D8 !important;
        }
        .commute-line-tooltip {
          background-color: #FFFFFF !important;
          border: 1.5px solid #2563EB !important;
          border-radius: 8px !important;
          color: #2563EB !important;
          box-shadow: 0 4px 12px rgba(37,99,235,0.15) !important;
          font-weight: bold !important;
        }
      `}</style>
    </div>
  );
}

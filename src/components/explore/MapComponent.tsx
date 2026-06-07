"use client";

import { useEffect, useRef } from "react";
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
  selectedLayer: string; // Lifestyle, Commute, Budget, Expat, Pet, Luxury
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
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

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
  const getCommuteMinutes = (n: Neighborhood, workplaceName: string): number => {
    if (n.commuteMinutes && n.commuteMinutes[workplaceName] !== undefined) {
      return n.commuteMinutes[workplaceName];
    }
    if (workplaceCoords) {
      const [wLat, wLng] = workplaceCoords;
      const dist = getDistance(n.lat, n.lng, wLat, wLng);
      return Math.round(dist * 3.5 + (dist > 0 ? 2 : 0));
    }
    return 15;
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Bangkok center coordinate
    const map = L.map(containerRef.current, {
      center: [13.738, 100.562],
      zoom: 12.5,
      zoomControl: false,
      attributionControl: false,
    });

    // Add CartoDB Voyager tiles (Google Map style: clean, soft streets, green parks, light blue water)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fit map bounds when map is initialized or workplace/neighborhoods changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const boundsPoints: L.LatLngTuple[] = neighborhoods.map(n => [n.lat, n.lng]);
    if (workplaceCoords) {
      boundsPoints.push(workplaceCoords);
    }
    if (boundsPoints.length > 0) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13.5 });
    }
  }, [workplaceCoords, neighborhoods]);

  // Update markers on change of data/workplace/commute/selection/layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    neighborhoods.forEach((n) => {
      const isMatched = matchedSlugs.includes(n.slug);

      // Determine score value out of 10 based on selected layer
      let scoreVal = 8; // default fallback
      if (selectedLayer === "lifestyle") {
        scoreVal = Math.round((n.scores.remoteWork + n.scores.cafeCulture + n.scores.walkability) / 3);
      } else if (selectedLayer === "commute") {
        const mins = getCommuteMinutes(n, workplace);
        if (mins === 0) scoreVal = 10;
        else if (mins <= 10) scoreVal = 9;
        else if (mins <= 20) scoreVal = 8;
        else if (mins <= 30) scoreVal = 6;
        else scoreVal = 3;
      } else if (selectedLayer === "budget") {
        // Less rent = more affordable (higher score)
        if (n.averageRentMax <= 30000) scoreVal = 9;
        else if (n.averageRentMax <= 60000) scoreVal = 7;
        else scoreVal = 4;
      } else if (selectedLayer === "expat") {
        scoreVal = n.scores.expatCommunity;
      } else if (selectedLayer === "pet") {
        scoreVal = n.scores.petFriendly;
      } else if (selectedLayer === "luxury") {
        scoreVal = n.scores.luxury;
      }

      // Color coding pins based on compatibility score
      let color = "#EF4444"; // Low Fit (Red)
      if (scoreVal >= 8) {
        color = "#10B981"; // High Fit (Green)
      } else if (scoreVal >= 5) {
        color = "#F59E0B"; // Moderate Fit (Yellow)
      }

      const isSelected = selectedSlug === n.slug;
      const markerSize = isSelected ? 30 : isMatched ? 26 : 22;

      // Custom premium HTML marker with score inside
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
            <span style="color:#FFFFFF; font-size:${isSelected ? '11px' : '9.5px'}; font-weight:bold;">
              ${scoreVal}
            </span>
            ${isSelected ? '<div style="position:absolute; bottom:-4px; width:8px; height:8px; background:#FFFFFF; transform:rotate(45deg);"></div>' : ""}
          </div>
          ${
            isMatched
              ? `<div style="
                  position: absolute;
                  top: -2px;
                  left: -2px;
                  width: ${markerSize + 4}px;
                  height: ${markerSize + 4}px;
                  border: 2px solid ${color};
                  border-radius: 50%;
                  animation: map-pulse 1.8s infinite ease-in-out;
                  pointer-events: none;
                "></div>`
              : ""
          }
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker([n.lat, n.lng], { icon: markerIcon })
        .addTo(map)
        .on("click", () => {
          onSelect(n.slug);
          map.setView([n.lat, n.lng], 13.5, { animate: true });
        });

      // Bind permanent bubble tooltip showing neighborhood name and score
      const commuteText = workplace ? ` (${getCommuteMinutes(n, workplace)}m)` : "";
      marker.bindTooltip(
        `<div style="font-family: inherit; font-size:11px; font-weight:700; color:#1C3A2F; padding:0px 2px;">
          ${n.name}${commuteText}
         </div>`,
        { direction: "top", permanent: true, opacity: 0.95, offset: [0, -10], className: "custom-map-tooltip" }
      );

      markersRef.current[n.slug] = marker;
    });

    // Add workplace marker if coordinates exist
    if (workplaceCoords) {
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
            <span style="color:#FFFFFF; font-size:14px; font-weight:bold;">💼</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const wMarker = L.marker(workplaceCoords, { icon: markerIcon })
        .addTo(map);

      wMarker.bindTooltip(
        `<div style="font-family: inherit; font-size:11px; font-weight:800; color:#FFFFFF; padding:1px 3px;">
          🏢 Workplace: ${workplace}
         </div>`,
        { direction: "top", permanent: true, opacity: 0.95, offset: [0, -12], className: "workplace-tooltip" }
      );

      markersRef.current["__workplace"] = wMarker;
    }
  }, [neighborhoods, selectedSlug, workplace, workplaceCoords, maxCommute, matchedSlugs, onSelect, selectedLayer]);

  // Center map on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSlug) return;

    const n = neighborhoods.find((item) => item.slug === selectedSlug);
    if (n) {
      map.setView([n.lat, n.lng], 13.5, { animate: true });
    }
  }, [selectedSlug, neighborhoods]);

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
      `}</style>
    </div>
  );
}

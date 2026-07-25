"use client";

import { useEffect, useRef, useState } from "react";
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
  googleMapsApiKey?: string;
}

function getTransitSvg(mode: string): string {
  if (mode === "walking") {
    return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 5.88 9.85 6 7.07l.02-1.28a1.69 1.69 0 0 1 3.37.06v.21c0 .48-.24.93-.65 1.22l-1.02.72c-.8.56-1.12 1.57-1.12 2.53L6.5 13"/><path d="M12 18v-2.38c0-2.12 1.88-3.77 2-6.55l.02-1.28a1.69 1.69 0 0 1 3.37.06v.21c0 .48-.24.93-.65 1.22l-1.02.72c-.8.56-1.12 1.57-1.12 2.53L14.5 15"/></svg>`;
  }
  if (mode === "driving") {
    return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
  }
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 15h8M12 2v13"/></svg>`;
}

export default function CommuteMap({
  propertyLat,
  propertyLng,
  propertyName,
  commuteHubs,
  googleMapsApiKey,
}: CommuteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useGoogle, setUseGoogle] = useState(false);

  const safeLat = Number(propertyLat);
  const safeLng = Number(propertyLng);
  const isValidLat = !isNaN(safeLat) && isFinite(safeLat) && safeLat !== 0;
  const isValidLng = !isNaN(safeLng) && isFinite(safeLng) && safeLng !== 0;

  // Check if we have a valid Google Maps key
  const hasGoogleKey = googleMapsApiKey && !googleMapsApiKey.startsWith("your_");

  useEffect(() => {
    if (hasGoogleKey) {
      setUseGoogle(true);
    } else {
      setUseGoogle(false);
    }
  }, [hasGoogleKey]);

  useEffect(() => {
    if (!containerRef.current || !isValidLat || !isValidLng) return;

    if (!useGoogle) {
      // ── LEAFLET FALLBACK ──
      containerRef.current.innerHTML = "";
      
      const mapOptions: L.MapOptions & { tap?: boolean } = {
        center: [safeLat, safeLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        tap: false,
      };

      const map = L.map(containerRef.current, mapOptions);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);

      // Property Marker (Dark Forest Green)
      const propertyIcon = L.divIcon({
        className: "custom-property-pin",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-10px, -20px);">
            <div style="width: 20px; height: 20px; background: #1C3A2F; border: 3.5px solid #C9A84C; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;"></div>
            </div>
            <span style="font-family: sans-serif; font-size: 9px; font-weight: 700; background: rgba(28,58,47,0.95); color: #FFFFFF; padding: 2px 6px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">${propertyName}</span>
          </div>
        `,
        iconSize: [24, 36],
        iconAnchor: [12, 24],
      });

      L.marker([safeLat, safeLng], { icon: propertyIcon }).addTo(map);

      const bounds = L.latLngBounds([[safeLat, safeLng]]);

      commuteHubs.forEach((hub) => {
        const hubLat = Number(hub.latitude);
        const hubLng = Number(hub.longitude);
        if (isNaN(hubLat) || isNaN(hubLng) || !isFinite(hubLat) || !isFinite(hubLng)) return;

        bounds.extend([hubLat, hubLng]);

        const transitSvg = getTransitSvg(hub.transitMode);

        const hubIcon = L.divIcon({
          className: "custom-hub-pin",
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-10px, -20px);">
              <div style="width: 18px; height: 18px; background: #C9A84C; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 9px;">
                ${transitSvg}
              </div>
              <span style="font-family: sans-serif; font-size: 8.5px; font-weight: 600; background: rgba(255,255,255,0.95); color: #1C3A2F; border: 1px solid #EDE8DF; padding: 1.5px 5px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${hub.name}</span>
            </div>
          `,
          iconSize: [24, 36],
          iconAnchor: [12, 24],
        });

        L.marker([hubLat, hubLng], { icon: hubIcon }).addTo(map);

        L.polyline([[safeLat, safeLng], [hubLat, hubLng]], {
          color: "#1C3A2F",
          weight: 2,
          dashArray: "6, 8",
          opacity: 0.75,
        }).addTo(map);
      });

      if (commuteHubs.length > 0) {
        map.fitBounds(bounds, {
          padding: [35, 35],
          maxZoom: 16,
        });
      }

      return () => {
        map.remove();
      };
    } else {
      // ── GOOGLE MAPS API INTEGRATION ──
      const overlays: any[] = [];
      const polylines: any[] = [];

      const initializeGoogleMap = () => {
        const googleObj = (window as any).google;
        if (!containerRef.current || !googleObj?.maps) return;
        containerRef.current.innerHTML = "";

        const mapOptions = {
          center: { lat: propertyLat, lng: propertyLng },
          zoom: 14,
          zoomControl: true,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#d2e5f4" }] },
            { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f3f0" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#767676" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fbd7a3" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#ebf2e4" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8d4bc" }] },
          ],
        };

        const map = new googleObj.maps.Map(containerRef.current, mapOptions);

        // Custom Overlay Constructor for HTML Pins
        class CustomHTMLOverlay extends googleObj.maps.OverlayView {
          private latlng: any;
          private htmlStr: string;
          private divEl: HTMLDivElement | null = null;

          constructor(latlng: any, htmlStr: string) {
            super();
            this.latlng = latlng;
            this.htmlStr = htmlStr;
          }

          onAdd() {
            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.transform = "translate(-50%, -100%)";
            div.innerHTML = this.htmlStr;
            this.divEl = div;

            const panes = this.getPanes();
            panes?.overlayImage.appendChild(div);
          }

          draw() {
            if (!this.divEl) return;
            const projection = this.getProjection();
            const position = projection.fromLatLngToDivPixel(this.latlng);
            if (position) {
              this.divEl.style.left = position.x + "px";
              this.divEl.style.top = position.y + "px";
            }
          }

          onRemove() {
            if (this.divEl) {
              this.divEl.parentNode?.removeChild(this.divEl);
              this.divEl = null;
            }
          }
        }

        // 1. Add Property Marker Overlay
        const propertyLatLng = new googleObj.maps.LatLng(propertyLat, propertyLng);
        const propertyHtml = `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 20px; height: 20px; background: #1C3A2F; border: 3.5px solid #C9A84C; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;"></div>
            </div>
            <span style="font-family: sans-serif; font-size: 9px; font-weight: 700; background: rgba(28,58,47,0.95); color: #FFFFFF; padding: 2px 6px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">${propertyName}</span>
          </div>
        `;
        const propertyOverlay = new CustomHTMLOverlay(propertyLatLng, propertyHtml);
        propertyOverlay.setMap(map);
        overlays.push(propertyOverlay);

        const bounds = new googleObj.maps.LatLngBounds();
        bounds.extend(propertyLatLng);

        // 2. Add Hub Overlays & Connect with Dotted Polyline Routes
        const lineSymbol = {
          path: "M 0,-1 0,1",
          strokeOpacity: 0.75,
          scale: 2,
        };

        commuteHubs.forEach((hub) => {
          const hubLat = Number(hub.latitude);
          const hubLng = Number(hub.longitude);
          if (isNaN(hubLat) || isNaN(hubLng)) return;

          const hubLatLng = new googleObj.maps.LatLng(hubLat, hubLng);
          bounds.extend(hubLatLng);

          const transitSvg = getTransitSvg(hub.transitMode);
          const hubHtml = `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 18px; height: 18px; background: #C9A84C; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 9px;">
                ${transitSvg}
              </div>
              <span style="font-family: sans-serif; font-size: 8.5px; font-weight: 600; background: rgba(255,255,255,0.95); color: #1C3A2F; border: 1px solid #EDE8DF; padding: 1.5px 5px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${hub.name}</span>
            </div>
          `;

          const hubOverlay = new CustomHTMLOverlay(hubLatLng, hubHtml);
          hubOverlay.setMap(map);
          overlays.push(hubOverlay);

          // Dotted Route Polyline
          const polyline = new googleObj.maps.Polyline({
            path: [propertyLatLng, hubLatLng],
            strokeColor: "#1C3A2F",
            strokeOpacity: 0,
            icons: [
              {
                icon: lineSymbol,
                offset: "0",
                repeat: "12px",
              },
            ],
            map: map,
          });
          polylines.push(polyline);
        });

        // 3. Auto-fit bounds if we have commute hubs
        if (commuteHubs.length > 0) {
          map.fitBounds(bounds, 35);
        }
      };

      loadGoogleMapsScript(googleMapsApiKey!, initializeGoogleMap);

      return () => {
        overlays.forEach((o) => o.setMap(null));
        polylines.forEach((p) => p.setMap(null));
      };
    }
  }, [propertyLat, propertyLng, propertyName, commuteHubs, useGoogle, googleMapsApiKey]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "220px", border: "1px solid #EDE8DF" }}
    />
  );
}

// Utility script loader
const loadGoogleMapsScript = (apiKey: string, callback: () => void) => {
  if (typeof window === "undefined") return;

  if ((window as any).google?.maps) {
    callback();
    return;
  }

  const existingScript = document.getElementById("google-maps-script");
  if (existingScript) {
    existingScript.addEventListener("load", callback);
    return;
  }

  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.addEventListener("load", callback);
  document.head.appendChild(script);
};

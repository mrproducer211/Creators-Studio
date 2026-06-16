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

export default function CommuteMap({
  propertyLat,
  propertyLng,
  propertyName,
  commuteHubs,
  googleMapsApiKey,
}: CommuteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useGoogle, setUseGoogle] = useState(false);

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
    if (!containerRef.current) return;

    if (!useGoogle) {
      // ── LEAFLET FALLBACK ──
      containerRef.current.innerHTML = "";
      
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

      L.marker([propertyLat, propertyLng], { icon: propertyIcon }).addTo(map);

      const bounds = L.latLngBounds([[propertyLat, propertyLng]]);

      commuteHubs.forEach((hub) => {
        const hubLat = Number(hub.latitude);
        const hubLng = Number(hub.longitude);
        if (isNaN(hubLat) || isNaN(hubLng)) return;

        bounds.extend([hubLat, hubLng]);

        const emoji = hub.transitMode === "walking" ? "🚶" : hub.transitMode === "driving" ? "🚗" : "🚆";

        const hubIcon = L.divIcon({
          className: "custom-hub-pin",
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-10px, -20px);">
              <div style="width: 18px; height: 18px; background: #C9A84C; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 9px;">
                ${emoji}
              </div>
              <span style="font-family: sans-serif; font-size: 8.5px; font-weight: 600; background: rgba(255,255,255,0.95); color: #1C3A2F; border: 1px solid #EDE8DF; padding: 1.5px 5px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${hub.name}</span>
            </div>
          `,
          iconSize: [24, 36],
          iconAnchor: [12, 24],
        });

        L.marker([hubLat, hubLng], { icon: hubIcon }).addTo(map);

        L.polyline([[propertyLat, propertyLng], [hubLat, hubLng]], {
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
      let mapInstance: any = null;
      let overlays: any[] = [];
      let polylines: any[] = [];

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
        mapInstance = map;

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

          const emoji = hub.transitMode === "walking" ? "🚶" : hub.transitMode === "driving" ? "🚗" : "🚆";
          const hubHtml = `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 18px; height: 18px; background: #C9A84C; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 9px;">
                ${emoji}
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
        mapInstance = null;
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

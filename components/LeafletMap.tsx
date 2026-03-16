"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

// Only run client-side to prevent SSR window errors
if (typeof window !== "undefined") {
  // @ts-expect-error - _getIconUrl is not typed but exists on prototype
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

export interface MapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  resetSignal?: number; // Increment to force map back to center+zoom immediately
  onZoomChange?: (zoom: number) => void;
  onViewportChange?: (viewport: {
    bounds: { north: number; south: number; east: number; west: number };
    center: { lat: number; lng: number };
  }) => void;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    url?: string;
    sutqRating?: string;
    programType?: string;
    pfcc?: boolean;
    streetAddress?: string;
    city?: string;
    zipCode?: string;
    verified?: boolean;
    logoUrl?: string;
  }>;
  userLocation?: [number, number] | null; // New prop for user's searched location
  interactive?: boolean; // If false, disable interactions (static-like mode)
  height?: string;
  className?: string;
  scrollWheelZoom?: boolean;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  const centerLat = center[0];
  const centerLng = center[1];
  const previousCenterRef = useRef<[number, number]>([centerLat, centerLng]);
  const previousZoomRef = useRef<number>(zoom);

  useEffect(() => {
    const previousCenter = previousCenterRef.current;
    const centerChanged = previousCenter[0] !== centerLat || previousCenter[1] !== centerLng;
    const zoomChanged = previousZoomRef.current !== zoom;

    if (centerChanged) {
      map.setView([centerLat, centerLng], zoom);
      previousCenterRef.current = [centerLat, centerLng];
      previousZoomRef.current = zoom;
      return;
    }

    if (zoomChanged && map.getZoom() !== zoom) {
      map.setZoom(zoom);
      previousZoomRef.current = zoom;
    }
  }, [centerLat, centerLng, zoom, map]);

  return null;
}

function MapResetHandler({ resetSignal, center, zoom }: { resetSignal: number; center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevSignalRef = useRef(resetSignal);

  useEffect(() => {
    if (resetSignal === prevSignalRef.current) return;
    prevSignalRef.current = resetSignal;
    map.setView(center, zoom, { animate: false });
  }, [resetSignal, center, zoom, map]);

  return null;
}

function MapZoomListener({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function MapViewportListener({
  onViewportChange,
}: {
  onViewportChange: (viewport: {
    bounds: { north: number; south: number; east: number; west: number };
    center: { lat: number; lng: number };
  }) => void;
}) {
  const map = useMap();
  const onViewportChangeRef = useRef(onViewportChange);

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  const emitViewport = useCallback(() => {
    const bounds = map.getBounds();
    const currentCenter = map.getCenter();
    onViewportChangeRef.current({
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      center: {
        lat: currentCenter.lat,
        lng: currentCenter.lng,
      },
    });
  }, [map]);

  useMapEvents({
    moveend: () => {
      emitViewport();
    },
    zoomend: () => {
      emitViewport();
    },
  });

  useEffect(() => {
    emitViewport();
  }, [emitViewport]);

  return null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeSutqTier(rating?: string): "gold" | "silver" | "bronze" | "not-rated" {
  const raw = (rating || "").trim().toLowerCase();
  if (raw === "3" || raw === "gold") return "gold";
  if (raw === "2" || raw === "silver") return "silver";
  if (raw === "1" || raw === "bronze") return "bronze";
  return "not-rated";
}

function sutqLabelFromTier(tier: "gold" | "silver" | "bronze" | "not-rated") {
  if (tier === "gold") return "SUTQ: Gold";
  if (tier === "silver") return "SUTQ: Silver";
  if (tier === "bronze") return "SUTQ: Bronze";
  return "SUTQ: Not Rated";
}

function sutqBadgeColor(tier: "gold" | "silver" | "bronze" | "not-rated") {
  if (tier === "gold") return "#DCB346";
  if (tier === "silver") return "#9CA3AF";
  if (tier === "bronze") return "#B87333";
  return "#6B7280";
}

function createSutqPinIcon(fillColor: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 42" width="26" height="42">
      <path d="M13 1C6.5 1 1.2 6.1 1.2 12.5c0 8.9 11.8 27.5 11.8 27.5s11.8-18.6 11.8-27.5C24.8 6.1 19.5 1 13 1z" fill="${fillColor}" stroke="#ffffff" stroke-width="1.6" />
      <circle cx="13" cy="12.8" r="4.7" fill="#ffffff" fill-opacity="0.92" />
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

function ClusteredMarkersLayer({ markers }: { markers: NonNullable<MapProps["markers"]> }) {
  const map = useMap();
  const clusterGroupRef = useRef<L.LayerGroup | null>(null);
  const sutqIcons = useMemo(
    () => ({
      gold: createSutqPinIcon("#DCB346"),
      silver: createSutqPinIcon("#9CA3AF"),
      bronze: createSutqPinIcon("#B87333"),
      "not-rated": createSutqPinIcon("#6B7280"),
    }),
    []
  );

  useEffect(() => {
    const markerClusterFactory = (L as unknown as {
      markerClusterGroup: (options?: Record<string, unknown>) => L.LayerGroup;
    }).markerClusterGroup;

    const clusterGroup = markerClusterFactory({
      chunkedLoading: true,
      chunkInterval: 120,
      chunkDelay: 30,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      animate: false,
      animateAddingMarkers: false,
      showCoverageOnHover: false,
    });

    clusterGroupRef.current = clusterGroup;
    clusterGroup.addTo(map);

    return () => {
      clusterGroup.remove();
      clusterGroupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const clusterGroup = clusterGroupRef.current as
      | (L.LayerGroup & {
          clearLayers: () => void;
          addLayers: (layers: L.Marker[]) => void;
        })
      | null;

    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    if (markers.length === 0) return;

    const leafletMarkers = markers.map((markerData) => {
      const tier = normalizeSutqTier(markerData.sutqRating);
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: sutqIcons[tier],
      });
      const safeTitle = escapeHtml(markerData.title || "");
      const safeUrl = markerData.url ? escapeHtml(markerData.url) : "";
      const safeProgramType = escapeHtml(markerData.programType || "");
      const safeStreetAddress = escapeHtml(markerData.streetAddress || "");
      const safeCity = escapeHtml(markerData.city || "");
      const safeZip = escapeHtml(markerData.zipCode || "");
      const safeLogoUrl = markerData.logoUrl ? escapeHtml(markerData.logoUrl) : "";
      const ratingLabel = sutqLabelFromTier(tier);
      const ratingColor = sutqBadgeColor(tier);

      const addressLine2 = [safeCity, safeZip].filter(Boolean).join(", ");

      const metadataBadges = [
        markerData.verified
          ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#4A6B67;color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;letter-spacing:0.025em;line-height:1.4;"><svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 1L3 4.5V9.5C3 14.15 5.96 18.49 10 19.5C14.04 18.49 17 14.15 17 9.5V4.5L10 1Z" fill="#DCB346"/><path d="M7 10.5L9 12.5L13 8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Provider Verified</span>`
          : "",
        `<span style="display:inline-block;background:${ratingColor};color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;line-height:1.4;">${escapeHtml(ratingLabel)}</span>`,
        safeProgramType
          ? `<span style="display:inline-block;background:#EEF2F7;color:#334155;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;line-height:1.4;">${safeProgramType}</span>`
          : "",
        markerData.pfcc
          ? `<span style="display:inline-block;background:#DBEAFE;color:#1D4ED8;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.4;">PFCC</span>`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      const addressBlock = [
        safeStreetAddress ? `<div style=\"margin-top:6px;color:#334155;font-size:12px;\">${safeStreetAddress}</div>` : "",
        addressLine2 ? `<div style=\"color:#64748B;font-size:12px;\">${addressLine2}</div>` : "",
      ]
        .filter(Boolean)
        .join("");

      const logoBlock = safeLogoUrl
        ? `<div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;"><img src="${safeLogoUrl}" alt="" style="width:36px;height:36px;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb;" /><div style="font-size:14px;font-weight:700;color:#111827;line-height:1.35;">${safeTitle}</div></div>`
        : `<div style="font-size:14px;font-weight:700;color:#111827;line-height:1.35;">${safeTitle}</div>`;

      const popupHtml = safeUrl
        ? `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:260px;">${logoBlock}<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;">${metadataBadges}</div>${addressBlock}<div style="margin-top:8px;"><a href="${safeUrl}" style="color:#2563EB;text-decoration:none;font-size:12px;font-weight:600;">View Details</a></div></div>`
        : `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:260px;">${logoBlock}<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;">${metadataBadges}</div>${addressBlock}</div>`;

      marker.bindPopup(popupHtml);
      return marker;
    });

    clusterGroup.addLayers(leafletMarkers);
  }, [markers, sutqIcons]);

  return null;
}

export default function LeafletMap({
  center,
  zoom = 13,
  resetSignal = 0,
  onZoomChange,
  onViewportChange,
  markers = [],
  userLocation,
  interactive = true,
  height = "400px",
  className = "",
  scrollWheelZoom = false, // Default to false to prevent scroll trapping
}: MapProps) {
  // Define a custom red icon for the user location (using Leaflet global)
  // We need to do this carefully since L might not be fully initialized in SSR
  // But since this component is dynamic imported with ssr: false, window.L should be available if we imported it.
  // Actually, we imported L at the top level.
  
  const userIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    []
  );

  // Dynamic import with ssr: false handles client safety. 
  // Removed internal isMounted check to fix react-hooks lint warning.

  // Interactive vs Static configuration
  const mapOptions = interactive
    ? { 
        scrollWheelZoom: scrollWheelZoom, 
        dragging: true, 
        touchZoom: true, 
        doubleClickZoom: true, 
        zoomControl: true,
        gestureHandling: true,
      }
    : { 
        scrollWheelZoom: false, 
        dragging: false, 
        touchZoom: false, 
        doubleClickZoom: false, 
        zoomControl: false, 
        boxZoom: false, 
        keyboard: false 
      };

  // Re-declare icon here to ensure it's available in render scope if needed, 
  // though typically Marker uses default if not specified.
  // However, we patched L.Marker.prototype.options.icon above, so <Marker /> without icon prop will use it.
  
  return (
    <div className={`overflow-hidden rounded-xl border ${className}`} style={{ height, width: "100%", position: "relative", zIndex: 0 }}>
      {/* 
        MapContainer must have a dedicated height. 
        We pass ...mapOptions to disable controls if non-interactive.
      */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }}
        {...mapOptions}
      >
        <MapUpdater center={center} zoom={zoom} />
        {interactive && <MapResetHandler resetSignal={resetSignal} center={center} zoom={zoom} />}
        {interactive && onZoomChange && <MapZoomListener onZoomChange={onZoomChange} />}
        {interactive && onViewportChange && <MapViewportListener onViewportChange={onViewportChange} />}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Render User Location Marker (Red Pin) if provided */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} zIndexOffset={1000}>
            <Popup>
              <strong>Your Search Location</strong>
            </Popup>
          </Marker>
        )}

        {/* Render Primary Center Marker if no markers array provided, or if interactive=false (single pin mode usually) */}
        {(markers.length === 0 || !interactive) && !userLocation && (
          <Marker position={center} />
        )}

        {/* Render Multiple Markers if provided and interactive */}
        {interactive && <ClusteredMarkersLayer markers={markers} />}
      </MapContainer>
      
      {/* Overlay for pure static mode to prevent capturing clicks at all if needed? 
          Actually disabling Leaflet controls is usually enough. 
      */}
    </div>
  );
}

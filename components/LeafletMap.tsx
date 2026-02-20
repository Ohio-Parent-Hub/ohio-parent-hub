"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

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
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    url?: string;
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

  useEffect(() => {
    map.setView([centerLat, centerLng], zoom);
  }, [centerLat, centerLng, zoom, map]);

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

function ClusteredMarkersLayer({ markers }: { markers: NonNullable<MapProps["markers"]> }) {
  const map = useMap();
  const clusterGroupRef = useRef<L.LayerGroup | null>(null);

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
      const marker = L.marker([markerData.lat, markerData.lng]);
      const safeTitle = escapeHtml(markerData.title || "");
      const safeUrl = markerData.url ? escapeHtml(markerData.url) : "";
      const popupHtml = safeUrl
        ? `<div class="text-sm font-sans"><strong>${safeTitle}</strong><div class="mt-1"><a href="${safeUrl}" class="text-blue-600 hover:underline">View Details</a></div></div>`
        : `<div class="text-sm font-sans"><strong>${safeTitle}</strong></div>`;

      marker.bindPopup(popupHtml);
      return marker;
    });

    clusterGroup.addLayers(leafletMarkers);
  }, [markers]);

  return null;
}

export default function LeafletMap({
  center,
  zoom = 13,
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
        zoomControl: true 
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

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

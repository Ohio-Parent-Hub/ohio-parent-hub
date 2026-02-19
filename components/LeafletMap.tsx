"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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

function MapUpdater({ center, zoom, markers }: { center: [number, number], zoom: number, markers: MapProps['markers'] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  useEffect(() => {
    if (markers && markers.length > 0) {
      const validMarkers = markers.filter(m => m.lat && m.lng);
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [markers, map]);

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
  
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

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
        <MapUpdater center={center} zoom={zoom} markers={markers} />

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
        {interactive && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
          >
            {markers.map((m, idx) => (
              <Marker key={idx} position={[m.lat, m.lng]}>
                <Popup>
                  <div className="text-sm font-sans">
                    <strong>{m.title}</strong>
                    {m.url && (
                      <div className="mt-1">
                        <a href={m.url} className="text-blue-600 hover:underline">View Details</a>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
      
      {/* Overlay for pure static mode to prevent capturing clicks at all if needed? 
          Actually disabling Leaflet controls is usually enough. 
      */}
    </div>
  );
}

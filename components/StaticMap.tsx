// components/StaticMap.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
// Import Leaflet CSS is handled inside the component or globally

// Dynamically import Leaflet with no SSR to avoid 'window is not defined'
const LeafletMap = dynamic(
  () => import("./LeafletMap"),
  { 
    ssr: false, // This is crucial for Leaflet
    loading: () => <div className="h-64 bg-neutral-100 animate-pulse rounded-xl" />
  }
);

interface StaticMapProps {
  lat: number;
  lng: number;
  className?: string;
  height?: string;
}

export default function StaticMap({ lat, lng, className, height="300px" }: StaticMapProps) {
  // Simple wrapper that allows interaction but disables scroll zoom
  return (
    <LeafletMap 
      center={[lat, lng]} 
      zoom={15} 
      interactive={true}
      className={className}
      height={height}
    />
  );
}

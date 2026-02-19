"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
      Loading Map...
    </div>
  ),
});

interface InteractiveMapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    url?: string;
  }>;
  height?: string;
  className?: string;
}

export default function InteractiveMap(props: InteractiveMapProps) {
  return <LeafletMap {...props} interactive={true} />;
}

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  // Construct the OSM URL
  // We apply the same logic: limiting to US
  const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=us&limit=1`;

  try {
    const response = await fetch(osmUrl, {
      headers: {
        // Use a generic User-Agent to avoid 403 blocks during development
        "User-Agent": "Mozilla/5.0 (compatible; OhioParentHub/1.0; +https://github.com/tylerhuffman/ohio-parent-hub)", 
        "Referer": "https://github.com/tylerhuffman/ohio-parent-hub"
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding proxy error:", error);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}

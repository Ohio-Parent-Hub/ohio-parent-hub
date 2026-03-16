"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight } from "lucide-react";

const teal = "#7EA8A4";

export default function HomepageSearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const focused = query.length > 0;

  const handleSubmit = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(false);

    try {
      const searchQuery = q.toLowerCase().includes("oh") ? q : `${q}, Ohio`;
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("geocode failed");
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        router.push(`/daycares?lat=${lat}&lng=${lng}&q=${encodeURIComponent(q)}#daycare-mobile-controls`);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <label htmlFor="homepage-search" className="sr-only">Search for a daycare</label>
        <input
          id="homepage-search"
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          enterKeyHint="search"
          placeholder="Find a Daycare"
          className="h-12 w-full cursor-text rounded-full border-0 pl-11 pr-12 text-base font-bold text-white shadow-lg outline-none placeholder:text-white/90 focus:placeholder:text-transparent focus:ring-2 focus:ring-white/40 sm:h-14 sm:pl-12 sm:pr-14 sm:text-lg"
          style={{ background: focused ? "#5e8e8a" : teal, color: "#fff" }}
        />
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Search className="h-5 w-5 text-white" />
          )}
        </div>
        {focused && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            aria-label="Search"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-50 sm:right-3"
            style={{ background: "#4A6B67" }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="absolute top-full left-0 mt-2 whitespace-nowrap rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs text-red-500 shadow-sm">
          Address not found. Try a city name or ZIP code.
        </div>
      )}
    </div>
  );
}

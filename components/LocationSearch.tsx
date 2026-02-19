"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationSearchProps {
  onLocationFound: (lat: number, lng: number) => void;
  className?: string;
}

export default function LocationSearch({ onLocationFound, className }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(false);

    try {
      // Use our own API route to proxy the request to Nominatim
      // This solves the CORS and User-Agent header issues
      const searchQuery = query.toLowerCase().includes("oh") ? query : `${query}, Ohio`;
      
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
         throw new Error(`Geocoding error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onLocationFound(lat, lng);
        setQuery(""); // Optional: clear after search or keep it? Keeping it is usually better but depends on UX.
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (error) setError(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter address or zip to move map..."
                className={`pl-9 pr-24 h-11 bg-white ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center pr-1">
                <Button 
                    size="sm" 
                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md mr-1" 
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Go"
                    )}
                </Button>
            </div>
        </div>
        {error && (
            <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-white px-2 py-1 rounded border border-red-100 shadow-sm z-10">
                Address not found. Try adding city/state.
            </div>
        )}
    </div>
  );
}

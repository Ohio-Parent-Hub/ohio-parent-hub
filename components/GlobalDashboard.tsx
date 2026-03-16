"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SutqBadge } from "@/components/SutqBadge";
import InteractiveMap from "@/components/InteractiveMap";
import VerifiedProviderBadge from "@/components/premium/VerifiedProviderBadge";
import FilterChipBar from "@/components/FilterChipBar";
import LocationSearch from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import { resolveCanonicalCityName, resolveCanonicalCitySlugFromName } from "@/lib/metroAreas";

type Daycare = Record<string, string>;

// Ohio full-state bounding box — used to reset mapBounds when clearing all filters
const OHIO_DEFAULT_BOUNDS = { north: 42.0, south: 38.3, east: -80.0, west: -85.0 };

type FilterWorkerRow = {
  name: string;
  city: string;
  county: string;
  pfcc: boolean;
  rating: string;
  programType: string;
};

function isFiniteCoordinate(value: number) {
  return Number.isFinite(value);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMiles(from: [number, number], to: [number, number]) {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(to[0] - from[0]);
  const dLng = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

// Helper to format city names
function prettyCity(city: string) {
  return (city || "")
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

function canonicalDaycarePath(daycare: Daycare, basePath: string) {
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const name = daycare["PROGRAM NAME"] || "";
  const citySlug = resolveCanonicalCitySlugFromName(daycare["CITY"] || "");
  return `${basePath}/daycare/${programNumber}-${slugify(name)}-${citySlug}`;
}

function storeNavContext(context: string, returnTo: string) {
  try {
    sessionStorage.setItem("ohph_nav_context", JSON.stringify({ context, returnTo }));
  } catch {
    // sessionStorage unavailable — back button will use server-computed fallback
  }
}

interface GlobalDashboardProps {
  initialDaycares?: Daycare[];
  initialTotalCount?: number;
  verifiedProgramNumbers?: string[];
  premiumLogos?: Record<string, string>;
  premiumSummaries?: Record<string, import("@/lib/premiumTypes").PremiumFilterSummary>;
  basePath?: string;
  externalMapCenter?: [number, number] | null;
  onExternalMapCenterChange?: (coords: [number, number] | null) => void;
  externalMapZoom?: number | null;
  onExternalMapZoomChange?: (zoom: number | null) => void;
  externalLocationQuery?: string;
  onExternalLocationQueryChange?: (query: string) => void;
  onClearAllFilters?: () => void;
  hideDesktopLocationSearch?: boolean;
  skipSessionRestore?: boolean;
}

export default function GlobalDashboard({
  initialDaycares = [],
  initialTotalCount,
  verifiedProgramNumbers = [],
  premiumLogos = {},
  premiumSummaries = {},
  basePath = "",
  externalMapCenter,
  onExternalMapCenterChange,
  externalMapZoom,
  onExternalMapZoomChange,
  externalLocationQuery,
  onExternalLocationQueryChange,
  onClearAllFilters,
  hideDesktopLocationSearch = false,
  skipSessionRestore = false,
}: GlobalDashboardProps) {
  const pathname = usePathname();
  const storageKey = useMemo(() => `global-dashboard-state:${pathname}`, [pathname]);
  const returnTo = pathname;

  // State
  const [daycares, setDaycares] = useState<Daycare[]>(initialDaycares);
  const [isHydratingDaycares, setIsHydratingDaycares] = useState(
    typeof initialTotalCount === "number" && initialDaycares.length > 0 && initialDaycares.length < initialTotalCount
  );
  const [filteredIndices, setFilteredIndices] = useState<number[]>(
    Array.from({ length: initialDaycares.length }, (_, index) => index)
  );
  const [loading, setLoading] = useState(initialDaycares.length === 0);
  const [workerInitialized, setWorkerInitialized] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const latestAppliedRequestRef = useRef(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [internalMapCenter, setInternalMapCenter] = useState<[number, number] | null>(null);
  const [internalMapViewCenter, setInternalMapViewCenter] = useState<[number, number] | null>(null);
  const [internalMapZoom, setInternalMapZoom] = useState<number | null>(null);
  const [mapResetSignal, setMapResetSignal] = useState(0);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [internalLocationQuery, setInternalLocationQuery] = useState("");
  const [locationSearchClearSignal, setLocationSearchClearSignal] = useState(0);
  const mapCenter = externalMapCenter !== undefined ? externalMapCenter : internalMapCenter;
  const setMapCenter = onExternalMapCenterChange ?? setInternalMapCenter;
  const mapViewCenter = internalMapViewCenter;
  const setMapViewCenter = setInternalMapViewCenter;
  const mapZoom = externalMapZoom !== undefined ? externalMapZoom : internalMapZoom;

  // When the external map center is changed from outside (e.g. hero LocationSearch),
  // sync it into the internal view center so `center = mapViewCenter || mapCenter`
  // resolves to the correct new location rather than the stale panned-map center.
  // skipNextExternalCenterSyncRef is set to true before sessionStorage restores mapCenter
  // so that the round-trip through the parent does NOT overwrite the restored mapViewCenter.
  const prevExternalMapCenterRef = useRef(externalMapCenter);
  const skipNextExternalCenterSyncRef = useRef(false);
  useLayoutEffect(() => {
    if (externalMapCenter === prevExternalMapCenterRef.current) return;
    prevExternalMapCenterRef.current = externalMapCenter;
    if (skipNextExternalCenterSyncRef.current) {
      skipNextExternalCenterSyncRef.current = false;
      return;
    }
    if (externalMapCenter !== undefined) {
      setInternalMapViewCenter(externalMapCenter ?? null);
    }
  }, [externalMapCenter]);
  const setMapZoom = onExternalMapZoomChange ?? setInternalMapZoom;
  const locationQuery = externalLocationQuery !== undefined ? externalLocationQuery : internalLocationQuery;
  const setLocationQuery = onExternalLocationQueryChange ?? setInternalLocationQuery;

  const [pfccEnabled, setPfccEnabled] = useState(false);
  const [verifiedEnabled, setVerifiedEnabled] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [restoredStateReady, setRestoredStateReady] = useState(false);

  // Premium filter state
  const [ageBracket, setAgeBracket] = useState<string | null>(null);
  const [maxWeeklyPrice, setMaxWeeklyPrice] = useState<number | null>(null);
  const [pricePeriod, setPricePeriod] = useState<"weekly" | "daily" | "monthly">("weekly");
  const [scheduleFilters, setScheduleFilters] = useState<string[]>([]);
  const [amenityFilters, setAmenityFilters] = useState<string[]>([]);
  const [hasPhotosFilter, setHasPhotosFilter] = useState(false);

  useEffect(() => {
    try {
      const rawState = sessionStorage.getItem(storageKey);
      if (!rawState || skipSessionRestore) {
        setRestoredStateReady(true);
        return;
      }

      const parsed = JSON.parse(rawState) as {
        searchQuery?: string;
        pfccEnabled?: boolean;
        selectedRatings?: string[];
        selectedProgramTypes?: string[];
        selectedCity?: string;
        selectedCounty?: string;
        mapCenter?: [number, number] | null;
        mapViewCenter?: [number, number] | null;
        mapZoom?: number | null;
        locationQuery?: string;
      };

      if (typeof parsed.searchQuery === "string") setSearchQuery(parsed.searchQuery);
      if (typeof parsed.pfccEnabled === "boolean") setPfccEnabled(parsed.pfccEnabled);
      if (Array.isArray(parsed.selectedRatings)) setSelectedRatings(parsed.selectedRatings);
      if (Array.isArray(parsed.selectedProgramTypes)) setSelectedProgramTypes(parsed.selectedProgramTypes);
      if (typeof parsed.selectedCity === "string") setSelectedCity(parsed.selectedCity);
      if (typeof parsed.selectedCounty === "string") setSelectedCounty(parsed.selectedCounty);
      if (Array.isArray(parsed.mapCenter) && parsed.mapCenter.length === 2) {
        skipNextExternalCenterSyncRef.current = true;
        setMapCenter(parsed.mapCenter as [number, number]);
      } else if (parsed.mapCenter === null) {
        setMapCenter(null);
      }
      if (parsed.mapViewCenter === null || (Array.isArray(parsed.mapViewCenter) && parsed.mapViewCenter.length === 2)) {
        setMapViewCenter(parsed.mapViewCenter as [number, number] | null);
      }
      if (typeof parsed.mapZoom === "number") setMapZoom(parsed.mapZoom);
      if (parsed.mapZoom === null) setMapZoom(null);
      if (typeof parsed.locationQuery === "string") setLocationQuery(parsed.locationQuery);
    } catch {
    } finally {
      setRestoredStateReady(true);
    }
  }, [setLocationQuery, setMapCenter, setMapViewCenter, setMapZoom, storageKey]);

  useEffect(() => {
    if (!restoredStateReady) return;

    const state = {
      searchQuery,
      pfccEnabled,
      selectedRatings,
      selectedProgramTypes,
      selectedCity,
      selectedCounty,
      mapCenter,
      mapViewCenter,
      mapZoom,
      locationQuery,
    };

    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }, [
    restoredStateReady,
    searchQuery,
    pfccEnabled,
    selectedRatings,
    selectedProgramTypes,
    selectedCity,
    selectedCounty,
    mapCenter,
    mapViewCenter,
    mapZoom,
    locationQuery,
    storageKey,
  ]);

  const normalizedRows = useMemo<FilterWorkerRow[]>(() => {
    return daycares.map((d) => {
      const ratingRaw = d["SUTQ RATING"] || "0";
      return {
        name: (d["PROGRAM NAME"] || "").toLowerCase(),
        city: resolveCanonicalCityName(d.CITY || ""),
        county: (d.COUNTY || "").trim(),
        pfcc: d["PFCC"] === "Y" || d["PFCC AGREEMENT"] === "Y",
        rating: !ratingRaw || ratingRaw === "" ? "0" : ratingRaw,
        programType: d["wPROGRAM TYPE"] || d["PROGRAM TYPE"] || "",
      };
    });
  }, [daycares]);

  // Fetch data on mount
  useEffect(() => {
    fetch("/api/daycares")
      .then((res) => res.json())
      .then((data) => {
        setDaycares(data);
        setFilteredIndices(Array.from({ length: data.length }, (_, index) => index));
        setIsHydratingDaycares(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load daycares:", err);
        setIsHydratingDaycares(false);
        setLoading(false);
      });
  }, []);

  // Initialize worker once
  useEffect(() => {
    const worker = new Worker(new URL("./workers/daycareFilter.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<{ type: string; requestId?: number; indices?: number[] }>) => {
      const message = event.data;

      if (message.type === "initialized") {
        setWorkerInitialized(true);
        return;
      }

      if (message.type === "filtered" && typeof message.requestId === "number" && Array.isArray(message.indices)) {
        if (message.requestId < latestAppliedRequestRef.current) return;
        latestAppliedRequestRef.current = message.requestId;
        setFilteredIndices(message.indices || []);
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Send normalized rows to worker whenever dataset changes
  useEffect(() => {
    if (!workerRef.current || normalizedRows.length === 0) return;

    setWorkerInitialized(false);
    workerRef.current.postMessage({
      type: "init",
      rows: normalizedRows,
    });
  }, [normalizedRows]);

  // Run filtering in worker whenever filters change
  useEffect(() => {
    if (!workerRef.current || !workerInitialized) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    workerRef.current.postMessage({
      type: "filter",
      requestId,
      searchQuery: searchQuery.trim().toLowerCase(),
      pfccEnabled,
      selectedRatings,
      selectedProgramTypes,
      selectedCity,
      selectedCounty,
    });
  }, [
    workerInitialized,
    searchQuery,
    pfccEnabled,
    selectedRatings,
    selectedProgramTypes,
    selectedCity,
    selectedCounty,
  ]);

  // Derive unique lists for dropdowns
  const { cities, counties } = useMemo(() => {
    const c = new Set<string>();
    const co = new Set<string>();
    daycares.forEach(d => {
      if (d.CITY) c.add(resolveCanonicalCityName(d.CITY));
      if (d.COUNTY) co.add(d.COUNTY.trim());
    });
    return {
      cities: Array.from(c).sort(),
      counties: Array.from(co).sort()
    };
  }, [daycares]);

  const verifiedSet = useMemo(() => new Set(verifiedProgramNumbers), [verifiedProgramNumbers]);

  const filteredDaycares = useMemo(() => {
    let result = filteredIndices
      .map((index) => daycares[index])
      .filter((daycare): daycare is Daycare => Boolean(daycare));

    if (verifiedEnabled) {
      result = result.filter((d) => verifiedSet.has(d["PROGRAM NUMBER"] || ""));
    }

    // Premium filters — hide non-verified providers when any premium filter is active
    const anyPremiumFilter = !!ageBracket || maxWeeklyPrice !== null || scheduleFilters.length > 0 || amenityFilters.length > 0 || hasPhotosFilter;
    if (anyPremiumFilter) {
      result = result.filter((d) => {
        const pn = d["PROGRAM NUMBER"] || "";
        const summary = premiumSummaries[pn];
        if (!summary) return false; // no premium data → hide

        if (ageBracket) {
          const brackets: Record<string, [number, number]> = { infant: [0, 12], toddler: [12, 36], preschool: [36, 60], "school-age": [60, 144] };
          const [bMin, bMax] = brackets[ageBracket] || [0, 0];
          if (!summary.ageRange || summary.ageRange[0] > bMax || summary.ageRange[1] < bMin) return false;
        }
        if (maxWeeklyPrice !== null && summary.priceRange) {
          if (summary.priceRange[0] > maxWeeklyPrice) return false;
        }
        if (scheduleFilters.length > 0) {
          if (!scheduleFilters.every((code) => summary.amenities.includes(code))) return false;
        }
        if (amenityFilters.length > 0) {
          if (!amenityFilters.every((code) => summary.amenities.includes(code))) return false;
        }
        if (hasPhotosFilter && !summary.hasPhotos) return false;

        return true;
      });
    }

    return result;
  }, [daycares, filteredIndices, verifiedEnabled, verifiedSet, ageBracket, maxWeeklyPrice, scheduleFilters, amenityFilters, hasPhotosFilter, premiumSummaries]);
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCity) ||
    Boolean(selectedCounty) ||
    pfccEnabled ||
    verifiedEnabled ||
    selectedRatings.length > 0 ||
    selectedProgramTypes.length > 0 ||
    Boolean(mapCenter) ||
    !!ageBracket ||
    maxWeeklyPrice !== null ||
    scheduleFilters.length > 0 ||
    amenityFilters.length > 0 ||
    hasPhotosFilter;
  const displayResultsCount =
    isHydratingDaycares && !hasActiveFilters && typeof initialTotalCount === "number"
      ? initialTotalCount
      : filteredDaycares.length;
  const mapVisibleDaycares = useMemo(() => {
    if (!mapBounds) return [];

    const withCoordinates = filteredDaycares.filter((daycare) => {
      if (!daycare["LAT"] || !daycare["LNG"]) return false;
      const lat = Number(daycare["LAT"]);
      const lng = Number(daycare["LNG"]);
      return isFiniteCoordinate(lat) && isFiniteCoordinate(lng);
    });

    return withCoordinates.filter((daycare) => {
      const lat = Number(daycare["LAT"]);
      const lng = Number(daycare["LNG"]);
      return (
        lat <= mapBounds.north &&
        lat >= mapBounds.south &&
        lng <= mapBounds.east &&
        lng >= mapBounds.west
      );
    });
  }, [filteredDaycares, mapBounds]);
  const mapViewSortedDaycares = useMemo(() => {
    if (!mapCenter) return mapVisibleDaycares;

    return [...mapVisibleDaycares].sort((daycareA, daycareB) => {
      const distanceA = distanceMiles(mapCenter, [Number(daycareA["LAT"]), Number(daycareA["LNG"])]);
      const distanceB = distanceMiles(mapCenter, [Number(daycareB["LAT"]), Number(daycareB["LNG"])]);
      return distanceA - distanceB;
    });
  }, [mapVisibleDaycares, mapCenter]);
  const isResultsCountPending = !mapBounds || isHydratingDaycares;
  const displayMapViewCount = isResultsCountPending ? displayResultsCount : mapVisibleDaycares.length;
  const displayList = mapViewSortedDaycares.slice(0, 50);

  const mapMarkers = useMemo(() => {
    return filteredDaycares
      .filter((d) => d.LAT && d.LNG)
      .map((d) => {
        const name = d["PROGRAM NAME"] || "";
        const city = resolveCanonicalCityName(d["CITY"] || "");

        return {
          lat: typeof d.LAT === 'string' ? parseFloat(d.LAT) : d.LAT,
          lng: typeof d.LNG === 'string' ? parseFloat(d.LNG) : d.LNG,
          title: toTitleCaseIfAllCaps(name),
          url: canonicalDaycarePath(d, basePath),
          sutqRating: d["SUTQ RATING"] || "0",
          programType: toTitleCaseIfAllCaps(d["PROGRAM TYPE"] || ""),
          pfcc: d["PFCC"] === "Y" || d["PFCC AGREEMENT"] === "Y",
          streetAddress: toTitleCaseIfAllCaps(d["STREET ADDRESS"] || ""),
          city: toTitleCaseIfAllCaps(city),
          zipCode: d["ZIP CODE"] || "",
          verified: verifiedSet.has(d["PROGRAM NUMBER"] || ""),
          logoUrl: premiumLogos[d["PROGRAM NUMBER"] || ""] || undefined,
        };
      });
  }, [filteredDaycares, basePath, returnTo, verifiedSet, premiumLogos]);

  // Ohio Center
  const defaultCenterCoords: [number, number] = [40.4173, -82.9071];
  // If externalMapCenter changed in this render (detected by reading the ref before the
  // useLayoutEffect updates it), use it directly — bypasses the stale mapViewCenter so
  // MapUpdater calls setView(correct, zoom) in a single render instead of two.
  const externalCenterChangedNow =
    externalMapCenter !== undefined &&
    externalMapCenter !== prevExternalMapCenterRef.current &&
    !skipNextExternalCenterSyncRef.current;
  const center = (externalCenterChangedNow ? externalMapCenter : mapViewCenter) || mapCenter || defaultCenterCoords;

  const clearAll = useCallback(() => {
    setPfccEnabled(false);
    setVerifiedEnabled(false);
    setSelectedRatings([]);
    setSelectedProgramTypes([]);
    setSelectedCity("");
    setSelectedCounty("");
    setSearchQuery("");
    setMapCenter(null);
    setMapViewCenter(null);
    setMapZoom(null);
    setMapBounds(OHIO_DEFAULT_BOUNDS); // immediately restore full-state bounds so count resets
    setLocationQuery("");
    setLocationSearchClearSignal((value) => value + 1);
    setMapResetSignal((prev) => prev + 1); // force Leaflet map view back to Ohio center
    // Premium filters
    setAgeBracket(null);
    setMaxWeeklyPrice(null);
    setPricePeriod("weekly");
    setScheduleFilters([]);
    setAmenityFilters([]);
    setHasPhotosFilter(false);
    onClearAllFilters?.();
  }, [onClearAllFilters, setLocationQuery, setMapCenter, setMapViewCenter, setMapZoom]);

  const clearLocationOnly = useCallback(() => {
    setMapCenter(null);
    setMapViewCenter(null);
    setMapZoom(null);
    setLocationQuery("");
    setLocationSearchClearSignal((value) => value + 1);
  }, [setLocationQuery, setMapCenter, setMapViewCenter, setMapZoom]);

  const toggleRating = useCallback((r: string) => {
    setSelectedRatings(prev => 
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  }, []);

  const toggleProgramType = useCallback((t: string) => {
    setSelectedProgramTypes(prev => 
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  }, []);

  const toggleScheduleFilter = useCallback((code: string) => {
    setScheduleFilters(prev =>
      prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]
    );
  }, []);

  const toggleAmenityFilter = useCallback((code: string) => {
    setAmenityFilters(prev =>
      prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]
    );
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-neutral-500">
        Loading Ohio Daycares...
      </div>
    );
  }

  return (
    <div id="daycare-dashboard" className="space-y-4 scroll-mt-24">
      {/* Filter Chip Bar */}
      <FilterChipBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        pfccEnabled={pfccEnabled}
        setPfccEnabled={setPfccEnabled}
        verifiedEnabled={verifiedEnabled}
        setVerifiedEnabled={setVerifiedEnabled}
        selectedRatings={selectedRatings}
        toggleRating={toggleRating}
        selectedProgramTypes={selectedProgramTypes}
        toggleProgramType={toggleProgramType}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedCounty={selectedCounty}
        setSelectedCounty={setSelectedCounty}
        cities={cities}
        counties={counties}
        mapCenter={mapCenter}
        onClearAll={clearAll}
        premiumSummaries={premiumSummaries}
        ageBracket={ageBracket}
        setAgeBracket={setAgeBracket}
        maxWeeklyPrice={maxWeeklyPrice}
        setMaxWeeklyPrice={setMaxWeeklyPrice}
        pricePeriod={pricePeriod}
        setPricePeriod={setPricePeriod}
        scheduleFilters={scheduleFilters}
        toggleScheduleFilter={toggleScheduleFilter}
        clearScheduleFilters={() => setScheduleFilters([])}
        amenityFilters={amenityFilters}
        toggleAmenityFilter={toggleAmenityFilter}
        clearAmenityFilters={() => setAmenityFilters([])}
        hasPhotosFilter={hasPhotosFilter}
        setHasPhotosFilter={setHasPhotosFilter}
      />

      {/* Results Header */}
      <div className="flex flex-col gap-4">
        {!hideDesktopLocationSearch && (
          <div className="hidden lg:block max-w-md">
            <LocationSearch
              onLocationFound={(lat, lng) => {
                setMapCenter([lat, lng]);
                setMapViewCenter([lat, lng]);
                setMapZoom(12);
              }}
              onSearchSuccess={(query) => setLocationQuery(query)}
              clearSignal={locationSearchClearSignal}
              placeholder="Search by street, city, or ZIP in Ohio"
            />
          </div>
        )}
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {isResultsCountPending ? "Updating results..." : `${displayMapViewCount} Results in Map View`}
                {selectedCity && <span className="font-normal text-neutral-500 ml-2">in {prettyCity(selectedCity)}</span>}
                {selectedCounty && <span className="font-normal text-neutral-500 ml-2">in {prettyCity(selectedCounty)} County</span>}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Only locations with address coordinates appear on the map.</p>
              {locationQuery && (
                <p className="mt-1 text-sm text-neutral-500">
                  Showing results near <span className="font-medium text-neutral-700">{locationQuery}</span>.
                  <button
                    type="button"
                    onClick={clearLocationOnly}
                    className="ml-2 underline hover:text-neutral-700"
                  >
                    Clear location
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div id="daycare-map" className="-mx-2 sm:mx-0 sm:rounded-xl sm:border bg-neutral-50 sm:shadow-sm relative z-0" style={{ height: "500px" }}>
          {restoredStateReady ? (
            <InteractiveMap 
              center={center}
              zoom={mapZoom ?? (mapCenter ? 12 : 7)}
              resetSignal={mapResetSignal}
              onZoomChange={(zoomLevel) => setMapZoom(zoomLevel)}
              onViewportChange={(viewport) => {
                setMapBounds(viewport.bounds);
                setMapViewCenter([viewport.center.lat, viewport.center.lng]);
              }}
              markers={mapMarkers}
              userLocation={mapCenter}
              height="500px"
              className="sm:rounded-xl"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center sm:rounded-xl bg-neutral-100 text-sm text-neutral-400">
              Loading map…
            </div>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {!isResultsCountPending && mapViewSortedDaycares.length > displayList.length && (
            <p className="text-sm text-neutral-500">
              Showing 50 of {mapViewSortedDaycares.length} results. Use filters to narrow your search.
            </p>
          )}
          {displayList.map((d) => {
            const name = d["PROGRAM NAME"] || "";
            const city = d.CITY || "";
            const displayName = toTitleCaseIfAllCaps(name);
            const displayCity = toTitleCaseIfAllCaps(city);
            const displayStreet = toTitleCaseIfAllCaps(d["STREET ADDRESS"] || "");
            const displayProgramType = toTitleCaseIfAllCaps(d["PROGRAM TYPE"] || "");
            const detailHref = canonicalDaycarePath(d, basePath);
            const hasPinnedLocation = Boolean(mapCenter);
            const distanceFromPinned = hasPinnedLocation
              ? distanceMiles(mapCenter as [number, number], [Number(d["LAT"]), Number(d["LNG"])])
              : null;
            const isVerified = verifiedSet.has(d["PROGRAM NUMBER"] || "");
            const hasLogo = Boolean(premiumLogos[d["PROGRAM NUMBER"] || ""]);

            return (
              <div 
                key={d["PROGRAM NUMBER"]} 
                className={`group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg sm:rounded-xl border p-3 sm:p-4 transition-colors gap-3 sm:gap-4 ${
                  isVerified
                    ? "border-l-[3px] hover:border-neutral-300"
                    : "bg-white border-neutral-200 hover:border-neutral-400"
                }`}
                style={
                  isVerified
                    ? { background: "#F0F6F5", borderColor: "#B8C5B2", borderLeftColor: "#7EA8A4" }
                    : {}
                }
              >
                <div className="flex items-center justify-between sm:hidden">
                  <SutqBadge rating={d["SUTQ RATING"]} className="scale-90 origin-left" />
                  {isVerified && <VerifiedProviderBadge />}
                </div>
                <div className="flex gap-3">
                  {hasLogo && (
                    <img
                      src={premiumLogos[d["PROGRAM NUMBER"] || ""]}
                      alt=""
                      className={`rounded-lg object-cover flex-shrink-0 mt-0.5 ${
                        isVerified
                          ? "h-12 w-12 border-2 border-[#7EA8A4]/40"
                          : "h-10 w-10 border border-neutral-200"
                      }`}
                    />
                  )}
                  <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">
                    <Link href={detailHref} className="hover:underline" onClick={() => storeNavContext("state", returnTo)}>
                      {displayName}
                    </Link>
                    {isVerified && (
                      <span className="ml-2 hidden sm:inline-block align-middle"><VerifiedProviderBadge /></span>
                    )}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-1">
                    {displayCity && <span className="font-medium text-black">{displayCity}</span>}
                    {displayCity && displayStreet && <span className="mx-1">•</span>}
                    {displayStreet}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                      {distanceFromPinned !== null && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                        {distanceFromPinned.toFixed(1)} mi
                        </span>
                      )}
                      <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                          {displayProgramType}
                      </span>
                      {d["PFCC"] === "Y" && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                            PFCC
                          </span>
                      )}
                  </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex flex-col items-end gap-3 min-w-[120px]">
                  <SutqBadge rating={d["SUTQ RATING"]} />
                  <Link href={detailHref} onClick={() => storeNavContext("state", returnTo)}>
                      <Button variant="outline" size="sm" className="w-full">
                          View Details
                      </Button>
                  </Link>
                </div>
                
                <div className="sm:hidden">
                    <Link href={detailHref} onClick={() => storeNavContext("state", returnTo)}>
                        <Button variant="outline" size="sm" className="w-full">
                            View Details
                        </Button>
                    </Link>
                </div>
              </div>
            );
          })}
          


          {displayList.length === 0 && (
            <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-xl border border-dashed">
              <p className="font-medium">No daycares in current map view</p>
              <p className="text-sm mt-1">Try zooming out or adjusting your filters.</p>
              <Button variant="link" onClick={clearAll} className="mt-2">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
    </div>
  );
}

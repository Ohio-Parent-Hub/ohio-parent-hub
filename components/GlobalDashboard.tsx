"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import InteractiveMap from "@/components/InteractiveMap";
import FilterChipBar from "@/components/FilterChipBar";
import LocationSearch from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
import { DaycareCard } from "@/components/DaycareCard";
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
  hiringSummaries?: import("@/lib/jobTypes").JobSummaryByProgramNumber;
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
  hiringSummaries = {},
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

  // Ignore viewport changes from hidden Leaflet maps (CSS display:none reports degenerate bounds)
  const handleViewportChange = useCallback((viewport: { bounds: { north: number; south: number; east: number; west: number }; center: { lat: number; lng: number } }) => {
    const { bounds } = viewport;
    const latSpan = Math.abs(bounds.north - bounds.south);
    const lngSpan = Math.abs(bounds.east - bounds.west);
    if (latSpan < 0.0001 || lngSpan < 0.0001) return;
    setMapBounds(bounds);
    setMapViewCenter([viewport.center.lat, viewport.center.lng]);
  }, []);
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
  const [nowHiringEnabled, setNowHiringEnabled] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [restoredStateReady, setRestoredStateReady] = useState(false);

  // Premium filter state
  const [ageBrackets, setAgeBrackets] = useState<string[]>([]);
  const [minWeeklyPrice, setMinWeeklyPrice] = useState<number | null>(null);
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
        nowHiringEnabled?: boolean;
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
      if (typeof parsed.nowHiringEnabled === "boolean") setNowHiringEnabled(parsed.nowHiringEnabled);
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
      nowHiringEnabled,
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
    nowHiringEnabled,
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
  const hiringProgramNumbers = useMemo(() => new Set(Object.keys(hiringSummaries)), [hiringSummaries]);

  const filteredDaycares = useMemo(() => {
    let result = filteredIndices
      .map((index) => daycares[index])
      .filter((daycare): daycare is Daycare => Boolean(daycare));

    if (verifiedEnabled) {
      result = result.filter((d) => verifiedSet.has(d["PROGRAM NUMBER"] || ""));
    }

    if (nowHiringEnabled) {
      result = result.filter((d) => hiringProgramNumbers.has(d["PROGRAM NUMBER"] || ""));
    }

    // Premium filters — hide non-verified providers when any premium filter is active
    const anyPremiumFilter = ageBrackets.length > 0 || minWeeklyPrice !== null || maxWeeklyPrice !== null || scheduleFilters.length > 0 || amenityFilters.length > 0 || hasPhotosFilter;
    if (anyPremiumFilter) {
      result = result.filter((d) => {
        const pn = d["PROGRAM NUMBER"] || "";
        const summary = premiumSummaries[pn];
        if (!summary) return false; // no premium data → hide

        if (ageBrackets.length > 0) {
          const bracketRanges: Record<string, [number, number]> = { infant: [0, 12], toddler: [12, 36], preschool: [36, 60], "school-age": [60, 144] };
          // Provider must cover ALL selected age brackets
          for (const bracket of ageBrackets) {
            const [bMin, bMax] = bracketRanges[bracket] || [0, 0];
            if (!summary.ageRange || summary.ageRange[0] > bMax || summary.ageRange[1] < bMin) return false;
          }
        }
        if (minWeeklyPrice !== null || maxWeeklyPrice !== null) {
          // When age brackets are selected, scope price to tiers overlapping those brackets
          if (ageBrackets.length > 0 && summary.priceTiers && summary.priceTiers.length > 0) {
            const bracketRangesForPrice: Record<string, [number, number]> = { infant: [0, 12], toddler: [12, 36], preschool: [36, 60], "school-age": [60, 144] };
            // Find all tiers that overlap ANY selected bracket
            const matchingTiers = summary.priceTiers.filter((t) =>
              ageBrackets.some((b) => {
                const [bMin, bMax] = bracketRangesForPrice[b] || [0, 0];
                return t.ageStart < bMax && t.ageEnd > bMin;
              })
            );
            if (matchingTiers.length > 0) {
              const scopedMin = Math.min(...matchingTiers.map((t) => t.minWeekly));
              const scopedMax = Math.max(...matchingTiers.map((t) => t.maxWeekly));
              if (minWeeklyPrice !== null && scopedMax < minWeeklyPrice) return false;
              if (maxWeeklyPrice !== null && scopedMin > maxWeeklyPrice) return false;
            }
            // If no matching tiers, the age filter already handles exclusion
          } else if (summary.priceRange) {
            // No age bracket selected — use overall price range
            if (minWeeklyPrice !== null && summary.priceRange[1] < minWeeklyPrice) return false;
            if (maxWeeklyPrice !== null && summary.priceRange[0] > maxWeeklyPrice) return false;
          }
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
  }, [daycares, filteredIndices, verifiedEnabled, verifiedSet, nowHiringEnabled, hiringProgramNumbers, ageBrackets, minWeeklyPrice, maxWeeklyPrice, scheduleFilters, amenityFilters, hasPhotosFilter, premiumSummaries]);
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCity) ||
    Boolean(selectedCounty) ||
    pfccEnabled ||
    verifiedEnabled ||
    nowHiringEnabled ||
    selectedRatings.length > 0 ||
    selectedProgramTypes.length > 0 ||
    Boolean(mapCenter) ||
    ageBrackets.length > 0 ||
    minWeeklyPrice !== null ||
    maxWeeklyPrice !== null ||
    scheduleFilters.length > 0 ||
    amenityFilters.length > 0 ||
    hasPhotosFilter;
  const displayResultsCount =
    isHydratingDaycares && !hasActiveFilters && typeof initialTotalCount === "number"
      ? initialTotalCount
      : filteredDaycares.length;
  const mapVisibleDaycares = useMemo(() => {
    const withCoordinates = filteredDaycares.filter((daycare) => {
      if (!daycare["LAT"] || !daycare["LNG"]) return false;
      const lat = Number(daycare["LAT"]);
      const lng = Number(daycare["LNG"]);
      return isFiniteCoordinate(lat) && isFiniteCoordinate(lng);
    });

    if (!mapBounds) return withCoordinates;

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
  const isResultsCountPending = isHydratingDaycares;
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
    setNowHiringEnabled(false);
    setSelectedRatings([]);
    setSelectedProgramTypes([]);
    setSelectedCity("");
    setSelectedCounty("");
    setSearchQuery("");
    // Premium filters
    setAgeBrackets([]);
    setMinWeeklyPrice(null);
    setMaxWeeklyPrice(null);
    setPricePeriod("weekly");
    setScheduleFilters([]);
    setAmenityFilters([]);
    setHasPhotosFilter(false);
    onClearAllFilters?.();
  }, [onClearAllFilters]);

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
        nowHiringEnabled={nowHiringEnabled}
        setNowHiringEnabled={setNowHiringEnabled}
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
        ageBrackets={ageBrackets}
        toggleAgeBracket={(v) => setAgeBrackets(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
        clearAgeBrackets={() => setAgeBrackets([])}
        minWeeklyPrice={minWeeklyPrice}
        setMinWeeklyPrice={setMinWeeklyPrice}
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

      {/* ──── Desktop split-panel (lg+) ──── */}
      <div className="hidden lg:flex gap-0" style={{ height: "calc(100vh - 160px)" }}>
        {/* Left: Header + Map */}
        <div className="w-[55%] flex flex-col">
          <div className="flex flex-col gap-3 mb-3 shrink-0">
            {!hideDesktopLocationSearch && (
              <div className="max-w-md">
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
                  <button type="button" onClick={clearLocationOnly} className="ml-2 underline hover:text-neutral-700">Clear location</button>
                </p>
              )}
            </div>
          </div>
          <div className="relative z-0 rounded-xl border bg-neutral-50 shadow-sm overflow-hidden flex-1 min-h-0">
            {restoredStateReady ? (
              <InteractiveMap 
                center={center}
                zoom={mapZoom ?? (mapCenter ? 12 : 7)}
                resetSignal={mapResetSignal}
                onZoomChange={(zoomLevel) => setMapZoom(zoomLevel)}
                onViewportChange={handleViewportChange}
                markers={mapMarkers}
                userLocation={mapCenter}
                height="100%"
                className="rounded-xl"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400">
                Loading map…
              </div>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="w-[45%] overflow-y-auto border-l px-4 py-4 space-y-4">
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
            const distFromPinned = hasPinnedLocation
              ? distanceMiles(mapCenter as [number, number], [Number(d["LAT"]), Number(d["LNG"])])
              : null;
            const isVerified = verifiedSet.has(d["PROGRAM NUMBER"] || "");
            const hiringSummary = hiringSummaries[d["PROGRAM NUMBER"] || ""];
            const hasLogo = Boolean(premiumLogos[d["PROGRAM NUMBER"] || ""]);

            return (
              <DaycareCard
                key={d["PROGRAM NUMBER"]}
                name={displayName}
                city={displayCity}
                street={displayStreet}
                programType={displayProgramType}
                sutqRating={d["SUTQ RATING"] || "—"}
                isPfcc={d["PFCC"] === "Y"}
                isVerified={isVerified}
                hiringSummary={hiringSummary}
                logoUrl={hasLogo ? premiumLogos[d["PROGRAM NUMBER"] || ""] : undefined}
                distanceMiles={distFromPinned}
                detailHref={detailHref}
                onNavigate={() => storeNavContext("state", returnTo)}
              />
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

      {/* ──── Mobile layout (<lg) ──── */}
      <div className="lg:hidden">
        {/* Results Header */}
        <div className="flex flex-col gap-4 mb-4">
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
                <button type="button" onClick={clearLocationOnly} className="ml-2 underline hover:text-neutral-700">Clear location</button>
              </p>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="-mx-2 relative z-0 bg-neutral-50 aspect-square">
          {restoredStateReady ? (
            <InteractiveMap 
              center={center}
              zoom={mapZoom ?? (mapCenter ? 12 : 7)}
              resetSignal={mapResetSignal}
              onZoomChange={(zoomLevel) => setMapZoom(zoomLevel)}
              onViewportChange={handleViewportChange}
              markers={mapMarkers}
              userLocation={mapCenter}
              height="100%"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
              Loading map…
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4 mt-4">
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
            const distFromPinned = hasPinnedLocation
              ? distanceMiles(mapCenter as [number, number], [Number(d["LAT"]), Number(d["LNG"])])
              : null;
            const isVerified = verifiedSet.has(d["PROGRAM NUMBER"] || "");
            const hiringSummary = hiringSummaries[d["PROGRAM NUMBER"] || ""];
            const hasLogo = Boolean(premiumLogos[d["PROGRAM NUMBER"] || ""]);

            return (
              <DaycareCard
                key={d["PROGRAM NUMBER"]}
                name={displayName}
                city={displayCity}
                street={displayStreet}
                programType={displayProgramType}
                sutqRating={d["SUTQ RATING"] || "—"}
                isPfcc={d["PFCC"] === "Y"}
                isVerified={isVerified}
                hiringSummary={hiringSummary}
                logoUrl={hasLogo ? premiumLogos[d["PROGRAM NUMBER"] || ""] : undefined}
                distanceMiles={distFromPinned}
                detailHref={detailHref}
                onNavigate={() => storeNavContext("state", returnTo)}
              />
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
    </div>
  );
}

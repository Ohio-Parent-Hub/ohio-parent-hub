"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import InteractiveMap from "@/components/InteractiveMap";
import FilterChipBar from "@/components/FilterChipBar";
import LocationSearch from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
import { DaycareCard } from "@/components/DaycareCard";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import { isMetroCitySlug, resolveCanonicalCityName, resolveCanonicalCitySlugFromName } from "@/lib/metroAreas";

type Daycare = Record<string, string>;

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

interface CityDashboardProps {
  daycares: Daycare[];
  citySlug?: string;
  countySlug?: string;
  cityDisplay: string;
  initialTotalCount?: number;
  basePath?: string;
  verifiedProgramNumbers?: string[];
  premiumLogos?: Record<string, string>;
  premiumSummaries?: Record<string, import("@/lib/premiumTypes").PremiumFilterSummary>;
  externalMapCenter?: [number, number] | null;
  onExternalMapCenterChange?: (coords: [number, number] | null) => void;
  externalMapZoom?: number | null;
  onExternalMapZoomChange?: (zoom: number | null) => void;
  externalLocationQuery?: string;
  onExternalLocationQueryChange?: (query: string) => void;
  onClearAllFilters?: () => void;
  hideHeaderLocationSearch?: boolean;
}

function storeNavContext(context: string, returnTo: string) {
  try {
    sessionStorage.setItem("ohph_nav_context", JSON.stringify({ context, returnTo }));
  } catch {
    // sessionStorage unavailable — back button will use server-computed fallback
  }
}

function prettyCity(city: string) {
  return (city || "")
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

export default function CityDashboard({
  daycares,
  citySlug,
  countySlug,
  cityDisplay,
  initialTotalCount,
  basePath = "",
  verifiedProgramNumbers = [],
  premiumLogos = {},
  premiumSummaries = {},
  externalMapCenter,
  onExternalMapCenterChange,
  externalMapZoom,
  onExternalMapZoomChange,
  externalLocationQuery,
  onExternalLocationQueryChange,
  onClearAllFilters,
  hideHeaderLocationSearch = false,
}: CityDashboardProps) {
  const pathname = usePathname();
  const storageKey = useMemo(() => `city-dashboard-state:${pathname}`, [pathname]);
  const linkContext: "city" | "county" = countySlug ? "county" : "city";
  const returnTo = pathname;

  const [searchQuery, setSearchQuery] = useState("");
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [mapResetSignal, setMapResetSignal] = useState(0);
  const [internalMapCenter, setInternalMapCenter] = useState<[number, number] | null>(null);
  const [internalMapViewCenter, setInternalMapViewCenter] = useState<[number, number] | null>(null);
  const [internalMapZoom, setInternalMapZoom] = useState<number | null>(null);
  const [internalLocationQuery, setInternalLocationQuery] = useState("");
  const [locationSearchClearSignal, setLocationSearchClearSignal] = useState(0);
  const [pfccEnabled, setPfccEnabled] = useState(false);
  const [verifiedEnabled, setVerifiedEnabled] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [hydratedDaycares, setHydratedDaycares] = useState<Daycare[]>(daycares);
  const [isHydratingDaycares, setIsHydratingDaycares] = useState(Boolean(citySlug || countySlug));
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
    setHydratedDaycares(daycares);
    if (daycares.length > 0) {
      setIsHydratingDaycares(false);
    }
  }, [daycares]);

  useEffect(() => {
    if (!citySlug && !countySlug) {
      setIsHydratingDaycares(false);
      return;
    }
    const citySlugValue = citySlug;
    const countySlugValue = countySlug;

    let isCancelled = false;

    async function hydrateCityDaycares() {
      setIsHydratingDaycares(true);
      try {
        const queryString = citySlugValue
          ? `city=${encodeURIComponent(citySlugValue)}`
          : `county=${encodeURIComponent(countySlugValue || "")}`;
        const response = await fetch(`/api/daycares?${queryString}`);
        if (!response.ok) return;
        const data = await response.json();
        if (!isCancelled && Array.isArray(data)) {
          setHydratedDaycares(data);
        }
      } catch {
      } finally {
        if (!isCancelled) {
          setIsHydratingDaycares(false);
        }
      }
    }

    hydrateCityDaycares();

    return () => {
      isCancelled = true;
    };
  }, [citySlug, countySlug]);

  const mapCenter = externalMapCenter !== undefined ? externalMapCenter : internalMapCenter;
  const setMapCenter = onExternalMapCenterChange ?? setInternalMapCenter;
  const mapViewCenter = internalMapViewCenter;
  const setMapViewCenter = setInternalMapViewCenter;
  const mapZoom = externalMapZoom !== undefined ? externalMapZoom : internalMapZoom;

  // When the external map center changes from outside (e.g. hero LocationSearch),
  // sync it into the internal view center so the map zooms to the correct location.
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
  const enableCityFilter = Boolean(countySlug) || isMetroCitySlug(citySlug);

  useEffect(() => {
    try {
      const rawState = sessionStorage.getItem(storageKey);
      if (!rawState) {
        setRestoredStateReady(true);
        return;
      }

      const parsed = JSON.parse(rawState) as {
        searchQuery?: string;
        pfccEnabled?: boolean;
        selectedRatings?: string[];
        selectedProgramTypes?: string[];
        selectedCity?: string;
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
      mapCenter,
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
    mapCenter,
    mapViewCenter,
    mapZoom,
    locationQuery,
    storageKey,
  ]);

  // Toggle rating filter
  const toggleRating = (rating: string) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  // Toggle program type filter
  const toggleProgramType = (type: string) => {
    setSelectedProgramTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleScheduleFilter = (code: string) => {
    setScheduleFilters((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleAmenityFilter = (code: string) => {
    setAmenityFilters((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const clearAllFilters = () => {
    setPfccEnabled(false);
    setVerifiedEnabled(false);
    setSelectedRatings([]);
    setSelectedProgramTypes([]);
    setSelectedCity("");
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
  };

  const clearLocationOnly = () => {
    setMapCenter(null);
    setMapViewCenter(null);
    setMapZoom(null);
    setLocationQuery("");
    setLocationSearchClearSignal((value) => value + 1);
  };

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    hydratedDaycares.forEach((daycare) => {
      const city = resolveCanonicalCityName(daycare["CITY"] || "");
      if (city) citySet.add(city);
    });
    return Array.from(citySet).sort((a, b) => prettyCity(a).localeCompare(prettyCity(b)));
  }, [hydratedDaycares]);

  const baseFilteredDaycares = useMemo(() => {
    let result = hydratedDaycares;

    // 1. Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((d) => {
        const name = (d["PROGRAM NAME"] || "").toLowerCase();
        return name.includes(lowerQuery);
      });
    }

    if (selectedCity) {
      result = result.filter((d) => resolveCanonicalCityName(d["CITY"] || "") === selectedCity);
    }

    // 2. Filter by PFCC Agreement (Publicly Funded)
    if (pfccEnabled) {
      result = result.filter((d) => d["PFCC AGREEMENT"] === "Y");
    }

    // 3. Filter by SUTQ Rating
    if (selectedRatings.length > 0) {
      result = result.filter((d) => {
        const r = d["SUTQ RATING"] || "";
        return selectedRatings.includes(r);
      });
    }

    // 4. Filter by Program Type
    if (selectedProgramTypes.length > 0) {
      result = result.filter((d) => {
        const t = d["PROGRAM TYPE"] || "";
        return selectedProgramTypes.includes(t);
      });
    }

    return result;
  }, [hydratedDaycares, searchQuery, selectedCity, pfccEnabled, selectedRatings, selectedProgramTypes]);

  const verifiedSet = useMemo(() => new Set(verifiedProgramNumbers), [verifiedProgramNumbers]);

  const filteredDaycares = useMemo(() => {
    let result = baseFilteredDaycares;

    if (verifiedEnabled) {
      result = result.filter((d) => verifiedSet.has(d["PROGRAM NUMBER"] || ""));
    }

    // Premium filters — hide non-verified providers when any premium filter is active
    const anyPremiumFilter = ageBrackets.length > 0 || minWeeklyPrice !== null || maxWeeklyPrice !== null || scheduleFilters.length > 0 || amenityFilters.length > 0 || hasPhotosFilter;
    if (anyPremiumFilter) {
      result = result.filter((d) => {
        const pn = d["PROGRAM NUMBER"] || "";
        const summary = premiumSummaries[pn];
        if (!summary) return false;

        if (ageBrackets.length > 0) {
          const bracketRanges: Record<string, [number, number]> = { infant: [0, 12], toddler: [12, 36], preschool: [36, 60], "school-age": [60, 144] };
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
  }, [baseFilteredDaycares, verifiedEnabled, verifiedSet, ageBrackets, minWeeklyPrice, maxWeeklyPrice, scheduleFilters, amenityFilters, hasPhotosFilter, premiumSummaries]);
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCity) ||
    pfccEnabled ||
    verifiedEnabled ||
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
  // Limit rendered list for performance (pagination can come later)
  const displayList = mapViewSortedDaycares.slice(0, 50);

  // Map markers based on FILTERED results
  const markers = useMemo(() => {
    return filteredDaycares
      .filter((d) => d["LAT"] && d["LNG"])
      .map((d) => {
        const id = d["PROGRAM NUMBER"];
        const name = d["PROGRAM NAME"] || "Daycare";
        const city = resolveCanonicalCityName(d["CITY"] || cityDisplay);
        const displayName = toTitleCaseIfAllCaps(name);
        const displayCity = toTitleCaseIfAllCaps(city);
        const citySlug = resolveCanonicalCitySlugFromName(city);
        const url = `${basePath}/daycare/${id}-${slugify(name)}-${citySlug}`;
        return {
          lat: Number(d["LAT"]),
          lng: Number(d["LNG"]),
          title: displayName,
          url,
          sutqRating: d["SUTQ RATING"] || "0",
          programType: toTitleCaseIfAllCaps(d["PROGRAM TYPE"] || ""),
          pfcc: d["PFCC AGREEMENT"] === "Y",
          streetAddress: toTitleCaseIfAllCaps(d["STREET ADDRESS"] || ""),
          city: displayCity || "",
          zipCode: d["ZIP CODE"] || "",
          verified: verifiedSet.has(id || ""),
          logoUrl: premiumLogos[id || ""] || undefined,
        };
      });
  }, [filteredDaycares, cityDisplay, basePath, linkContext, returnTo, verifiedSet, premiumLogos]);

  // Center on the first result if available, otherwise default to a central Ohio coordinate (or the first original result)
  const markerCenter: [number, number] | null = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : null;

  // Fallback if no markers
  const defaultCenter: [number, number] = [39.9612, -82.9988]; 
  // If externalMapCenter changed in this render (detected by reading the ref before the
  // useLayoutEffect updates it), use it directly — bypasses the stale mapViewCenter so
  // MapUpdater calls setView(correct, zoom) in a single render instead of two.
  const externalCenterChangedNow =
    externalMapCenter !== undefined &&
    externalMapCenter !== prevExternalMapCenterRef.current &&
    !skipNextExternalCenterSyncRef.current;
  const center = (externalCenterChangedNow ? externalMapCenter : mapViewCenter) || mapCenter || markerCenter || defaultCenter;

  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  return (
    <div>
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
          cities={cities}
          enableCityFilter={enableCityFilter}
          mapCenter={mapCenter}
          onClearAll={clearAllFilters}
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

        {/* ──── Desktop header + split-panel (lg+) ──── */}
        {/* ──── Desktop split-panel (lg+) ──── */}
        <div className="hidden lg:flex gap-0" style={{ height: "calc(100vh - 160px)" }}>
          {/* Left: Header + Map */}
          <div className="w-[55%] flex flex-col">
            <div className="flex flex-col gap-3 mb-3 shrink-0">
              {!hideHeaderLocationSearch && (
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
                  onViewportChange={(viewport) => {
                    setMapBounds(viewport.bounds);
                    setMapViewCenter([viewport.center.lat, viewport.center.lng]);
                  }}
                  markers={markers}
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
              const id = d["PROGRAM NUMBER"] || "";
              const name = d["PROGRAM NAME"] || "";
              const displayName = toTitleCaseIfAllCaps(name);
              const street = d["STREET ADDRESS"] || "";
              const displayStreet = toTitleCaseIfAllCaps(street);
              const city = resolveCanonicalCityName(d["CITY"] || cityDisplay);
              const displayCity = toTitleCaseIfAllCaps(city);
              const displayProgramType = toTitleCaseIfAllCaps(d["PROGRAM TYPE"] || "—");
              const slug = `${id}-${slugify(name)}-${resolveCanonicalCitySlugFromName(city)}`;
              const detailHref = `${basePath}/daycare/${slug}`;
              const hasPinnedLocation = Boolean(mapCenter);
              const distFromPinned = hasPinnedLocation
                ? distanceMiles(mapCenter as [number, number], [Number(d["LAT"]), Number(d["LNG"])])
                : null;
              const isVerified = verifiedSet.has(id);
              const hasLogo = Boolean(premiumLogos[id]);

              return (
                <DaycareCard
                  key={id}
                  name={displayName}
                  city={displayCity}
                  street={displayStreet}
                  programType={displayProgramType}
                  sutqRating={d["SUTQ RATING"] || "—"}
                  isPfcc={d["PFCC AGREEMENT"] === "Y"}
                  isVerified={isVerified}
                  logoUrl={hasLogo ? premiumLogos[id] : undefined}
                  distanceMiles={distFromPinned}
                  detailHref={detailHref}
                  onNavigate={() => storeNavContext(linkContext, returnTo)}
                />
              );
            })}

            {displayList.length === 0 && (
              <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-xl border border-dashed">
                <p className="font-medium">No daycares in current map view</p>
                <p className="text-sm mt-1">Try zooming out or adjusting your search or filters.</p>
                <Button variant="link" onClick={clearAllFilters} className="mt-2">
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

          {mobileView === "map" ? (
            <div className="-mx-2 relative z-0 bg-neutral-50" style={{ height: "calc(100vh - 200px)" }}>
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
                  markers={markers}
                  userLocation={mapCenter}
                  height="100%"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
                  Loading map…
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!isResultsCountPending && mapViewSortedDaycares.length > displayList.length && (
                <p className="text-sm text-neutral-500">
                  Showing 50 of {mapViewSortedDaycares.length} results. Use filters to narrow your search.
                </p>
              )}
              {displayList.map((d) => {
                const id = d["PROGRAM NUMBER"] || "";
                const name = d["PROGRAM NAME"] || "";
                const displayName = toTitleCaseIfAllCaps(name);
                const street = d["STREET ADDRESS"] || "";
                const displayStreet = toTitleCaseIfAllCaps(street);
                const city = resolveCanonicalCityName(d["CITY"] || cityDisplay);
                const displayCity = toTitleCaseIfAllCaps(city);
                const displayProgramType = toTitleCaseIfAllCaps(d["PROGRAM TYPE"] || "—");
                const slug = `${id}-${slugify(name)}-${resolveCanonicalCitySlugFromName(city)}`;
                const detailHref = `${basePath}/daycare/${slug}`;
                const hasPinnedLocation = Boolean(mapCenter);
                const distFromPinned = hasPinnedLocation
                  ? distanceMiles(mapCenter as [number, number], [Number(d["LAT"]), Number(d["LNG"])])
                  : null;
                const isVerified = verifiedSet.has(id);
                const hasLogo = Boolean(premiumLogos[id]);

                return (
                  <DaycareCard
                    key={id}
                    name={displayName}
                    city={displayCity}
                    street={displayStreet}
                    programType={displayProgramType}
                    sutqRating={d["SUTQ RATING"] || "—"}
                    isPfcc={d["PFCC AGREEMENT"] === "Y"}
                    isVerified={isVerified}
                    logoUrl={hasLogo ? premiumLogos[id] : undefined}
                    distanceMiles={distFromPinned}
                    detailHref={detailHref}
                    onNavigate={() => storeNavContext(linkContext, returnTo)}
                  />
                );
              })}

              {displayList.length === 0 && (
                <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-xl border border-dashed">
                  <p className="font-medium">No daycares in current map view</p>
                  <p className="text-sm mt-1">Try zooming out or adjusting your search or filters.</p>
                  <Button variant="link" onClick={clearAllFilters} className="mt-2">
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Floating map/list toggle */}
          <button
            type="button"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#4A6B67] text-white shadow-lg px-5 py-3 text-sm font-medium hover:bg-[#3d5a56] transition-colors"
            onClick={() => setMobileView(v => v === "list" ? "map" : "list")}
          >
            {mobileView === "list" ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586V14.414l3.707 3.707A1 1 0 0019 17.414V7a1 1 0 00-.293-.707z" clipRule="evenodd" /></svg>
                Map
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

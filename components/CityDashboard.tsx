"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SutqBadge } from "@/components/SutqBadge";
import InteractiveMap from "@/components/InteractiveMap";
import VerifiedProviderBadge from "@/components/premium/VerifiedProviderBadge";
import FilterChipBar from "@/components/FilterChipBar";
import LocationSearch from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
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
  const [ageBracket, setAgeBracket] = useState<string | null>(null);
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
    setMapCenter(null);
    setMapViewCenter(null);
    setMapZoom(null);
    setMapBounds(null); // let Leaflet re-report bounds after map snaps back
    setLocationQuery("");
    setLocationSearchClearSignal((value) => value + 1);
    setMapResetSignal((prev) => prev + 1); // force map view back to city center
    // Premium filters
    setAgeBracket(null);
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
    const anyPremiumFilter = !!ageBracket || maxWeeklyPrice !== null || scheduleFilters.length > 0 || amenityFilters.length > 0 || hasPhotosFilter;
    if (anyPremiumFilter) {
      result = result.filter((d) => {
        const pn = d["PROGRAM NUMBER"] || "";
        const summary = premiumSummaries[pn];
        if (!summary) return false;

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
  }, [baseFilteredDaycares, verifiedEnabled, verifiedSet, ageBracket, maxWeeklyPrice, scheduleFilters, amenityFilters, hasPhotosFilter, premiumSummaries]);
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCity) ||
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
          {!hideHeaderLocationSearch && (
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
                markers={markers}
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

          {/* Results List */}
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
              const sutq = d["SUTQ RATING"] || "—";
              const street = d["STREET ADDRESS"] || "";
              const displayStreet = toTitleCaseIfAllCaps(street);
                const city = resolveCanonicalCityName(d["CITY"] || cityDisplay);
              const displayCity = toTitleCaseIfAllCaps(city);
              const programType = d["PROGRAM TYPE"] || "—";
              const displayProgramType = toTitleCaseIfAllCaps(programType);
              const pfcc = d["PFCC AGREEMENT"] === "Y";
                const slug = `${id}-${slugify(name)}-${resolveCanonicalCitySlugFromName(city)}`;
              const detailHref = `${basePath}/daycare/${slug}`;
              const hasPinnedLocation = Boolean(mapCenter);
              const distanceFromPinned = hasPinnedLocation
                ? distanceMiles(mapCenter as [number, number], [Number(d["LAT"]), Number(d["LNG"])])
                : null;
              const isVerified = verifiedSet.has(id);
              const hasLogo = Boolean(premiumLogos[id]);

              return (
                <div
                  key={id}
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
                    <SutqBadge rating={sutq} className="scale-90 origin-left" />
                    {isVerified && <VerifiedProviderBadge />}
                  </div>
                  <div className="flex gap-3">
                    {hasLogo && (
                      <img
                        src={premiumLogos[id]}
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
                      <Link href={detailHref} className="hover:underline" onClick={() => storeNavContext(linkContext, returnTo)}>
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
                      <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">{displayProgramType}</span>
                      {pfcc && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                          PFCC
                        </span>
                      )}
                    </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-3 min-w-[120px]">
                    <SutqBadge rating={sutq} />
                    <Link href={detailHref} onClick={() => storeNavContext(linkContext, returnTo)}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  <div className="sm:hidden">
                    <Link href={detailHref} onClick={() => storeNavContext(linkContext, returnTo)}>
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
                <p className="text-sm mt-1">Try zooming out or adjusting your search or filters.</p>
                <Button variant="link" onClick={clearAllFilters} className="mt-2">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SutqBadge } from "@/components/SutqBadge";
import InteractiveMap from "@/components/InteractiveMap";
import FilterInput from "@/components/FilterInput";
import LocationSearch from "@/components/LocationSearch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover as ComboPopover,
  PopoverContent as ComboContent,
  PopoverTrigger as ComboTrigger,
} from "@/components/ui/popover";
import { Filter, Map as MapIcon, Info, Check, ChevronsUpDown } from "lucide-react";
import { FILTER_DEFINITIONS } from "@/data/filterDefinitions";
import { cn, toTitleCaseIfAllCaps } from "@/lib/utils";
import { isMetroCitySlug } from "@/lib/metroAreas";

type Daycare = Record<string, string>;

interface CityDashboardProps {
  daycares: Daycare[];
  citySlug?: string;
  countySlug?: string;
  cityDisplay: string;
  basePath?: string;
  externalMapCenter?: [number, number] | null;
  onExternalMapCenterChange?: (coords: [number, number] | null) => void;
  externalMapZoom?: number | null;
  onExternalMapZoomChange?: (zoom: number | null) => void;
  externalLocationQuery?: string;
  onExternalLocationQueryChange?: (query: string) => void;
  onClearAllFilters?: () => void;
  hideHeaderLocationSearch?: boolean;
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function prettyCity(city: string) {
  return (city || "")
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

const RATINGS = ["3", "2", "1"];

// Helper component for filter content since it's used in both desktop sidebar and mobile sheet
function FilterContent({
  searchQuery,
  setSearchQuery,
  pfccEnabled,
  setPfccEnabled,
  selectedRatings,
  toggleRating,
  selectedProgramTypes,
  toggleProgramType,
  selectedCity,
  setSelectedCity,
  cities,
  enableCityFilter,
  mapCenter,
  onClearAll,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  pfccEnabled: boolean;
  setPfccEnabled: (v: boolean) => void;
  selectedRatings: string[];
  toggleRating: (v: string) => void;
  selectedProgramTypes: string[];
  toggleProgramType: (v: string) => void;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  cities: string[];
  enableCityFilter: boolean;
  mapCenter: [number, number] | null;
  onClearAll: () => void;
}) {
  const [cityOpen, setCityOpen] = useState(false);
  const hasActiveFilters =
    pfccEnabled ||
    selectedRatings.length > 0 ||
    selectedProgramTypes.length > 0 ||
    !!searchQuery ||
    !!mapCenter ||
    !!selectedCity;

  return (
    <div className="space-y-6 px-4">      {/* Clear Filters Button (always rendered to prevent layout shift) */}
      <button
        onClick={onClearAll}
        disabled={!hasActiveFilters}
        className={`text-xs w-full text-left mb-2 transition-opacity ${
          hasActiveFilters
            ? "text-neutral-500 underline hover:text-black opacity-100"
            : "text-neutral-400 opacity-0 pointer-events-none"
        }`}
      >
        Clear Filters
      </button>
      {/* Name Search moved to filters */}
      <div>
        <h2 className="text-sm font-semibold mb-4">Search Name</h2>
        <FilterInput
          value={searchQuery}
          onChange={setSearchQuery} 
          placeholder="e.g. Little Stars..."
        />
      </div>

      <Separator />

      {enableCityFilter && (
        <>
          <div>
            <h2 className="text-sm font-semibold mb-4">Location</h2>
            <div className="flex flex-col space-y-1.5">
              <Label className="text-sm font-medium">City</Label>
              <ComboPopover open={cityOpen} onOpenChange={setCityOpen}>
                <ComboTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityOpen}
                    className="w-full justify-between"
                  >
                    {selectedCity ? prettyCity(selectedCity) : "Select city..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </ComboTrigger>
                <ComboContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all_cities_reset"
                          onSelect={() => {
                            setSelectedCity("");
                            setCityOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCity === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Cities
                        </CommandItem>
                        {cities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            keywords={[city, prettyCity(city)]}
                            onSelect={() => {
                              setSelectedCity(city === selectedCity ? "" : city);
                              setCityOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCity === city ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {prettyCity(city)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </ComboContent>
              </ComboPopover>
            </div>
          </div>

          <Separator />
        </>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-4">Program filters</h2>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="pfcc"
            checked={pfccEnabled}
            onCheckedChange={(checked) => setPfccEnabled(checked === true)}
          />
          <div className="flex items-center gap-1.5">
            <Label htmlFor="pfcc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Publicly Funded (PFCC)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer p-1">
                  <Info className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="max-w-[280px] text-sm" align="start" side="bottom">
                <p className="font-medium mb-1">{FILTER_DEFINITIONS.pfcc.title}</p>
                <p className="text-neutral-600">{FILTER_DEFINITIONS.pfcc.description}</p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-1.5 mb-4">
          <h2 className="text-sm font-semibold">SUTQ Rating</h2>
          <Popover>
            <PopoverTrigger asChild>
              <div className="cursor-pointer p-1">
                <Info className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-[280px] text-sm" align="start" side="bottom">
              <p className="font-medium mb-1">{FILTER_DEFINITIONS.sutq.title}</p>
              <p className="text-neutral-600">{FILTER_DEFINITIONS.sutq.description}</p>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-3">
          {RATINGS.map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox 
                id={`rating-${rating}`}
                checked={selectedRatings.includes(rating)}
                onCheckedChange={() => toggleRating(rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-2 text-sm font-normal">
                <SutqBadge rating={rating} className="scale-100 origin-left" />
              </Label>
            </div>
          ))}
          
          {/* Unrated Option */}
          <div className="flex items-center space-x-2 pt-1 text-sm font-normal">
            <Checkbox 
              id="rating-unrated"
              checked={selectedRatings.includes("0")}
              onCheckedChange={() => toggleRating("0")}
            />
            <Label htmlFor="rating-unrated" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                <SutqBadge rating="0" className="scale-100 origin-left" />
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-1.5 mb-4">
          <h2 className="text-sm font-semibold">Program Type</h2>
          <Popover>
            <PopoverTrigger asChild>
              <div className="cursor-pointer p-1">
                <Info className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-[280px] text-sm" align="start" side="bottom">
              <p className="font-medium mb-1">{FILTER_DEFINITIONS.programType.title}</p>
              <p className="text-neutral-600">{FILTER_DEFINITIONS.programType.description}</p>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-3">
          {PROGRAM_TYPES.map((type) => (
            <div key={type} className="flex items-start space-x-2">
              <Checkbox 
                id={`type-${type}`}
                checked={selectedProgramTypes.includes(type)}
                onCheckedChange={() => toggleProgramType(type)}
                className="mt-0.5" // Align checkbox with first line of text
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer leading-tight">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PROGRAM_TYPES = [
  "Licensed Child Care Center",
  "Licensed School-Age Child Care",
  "Licensed School-Based Preschool",
  "Licensed Type A Family Child Care Home",
  "Licensed Type B Family Child Care Home",
  "Certified In Home Aide",
  "Registered Day Camp or Approved Day Camp",
];

export default function CityDashboard({
  daycares,
  citySlug,
  countySlug,
  cityDisplay,
  basePath = "",
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

  const [searchQuery, setSearchQuery] = useState("");
  const [internalMapCenter, setInternalMapCenter] = useState<[number, number] | null>(null);
  const [internalMapZoom, setInternalMapZoom] = useState<number | null>(null);
  const [internalLocationQuery, setInternalLocationQuery] = useState("");
  const [locationSearchClearSignal, setLocationSearchClearSignal] = useState(0);
  const [pfccEnabled, setPfccEnabled] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [hydratedDaycares, setHydratedDaycares] = useState<Daycare[]>(daycares);
  const [restoredStateReady, setRestoredStateReady] = useState(false);

  useEffect(() => {
    setHydratedDaycares(daycares);
  }, [daycares]);

  useEffect(() => {
    if (!citySlug && !countySlug) return;
    const citySlugValue = citySlug;
    const countySlugValue = countySlug;

    let isCancelled = false;

    async function hydrateCityDaycares() {
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
      }
    }

    hydrateCityDaycares();

    return () => {
      isCancelled = true;
    };
  }, [citySlug, countySlug]);

  const mapCenter = externalMapCenter !== undefined ? externalMapCenter : internalMapCenter;
  const setMapCenter = onExternalMapCenterChange ?? setInternalMapCenter;
  const mapZoom = externalMapZoom !== undefined ? externalMapZoom : internalMapZoom;
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
        mapZoom?: number | null;
        locationQuery?: string;
      };

      if (typeof parsed.searchQuery === "string") setSearchQuery(parsed.searchQuery);
      if (typeof parsed.pfccEnabled === "boolean") setPfccEnabled(parsed.pfccEnabled);
      if (Array.isArray(parsed.selectedRatings)) setSelectedRatings(parsed.selectedRatings);
      if (Array.isArray(parsed.selectedProgramTypes)) setSelectedProgramTypes(parsed.selectedProgramTypes);
      if (typeof parsed.selectedCity === "string") setSelectedCity(parsed.selectedCity);
      if (parsed.mapCenter === null || (Array.isArray(parsed.mapCenter) && parsed.mapCenter.length === 2)) {
        setMapCenter(parsed.mapCenter as [number, number] | null);
      }
      if (typeof parsed.mapZoom === "number") setMapZoom(parsed.mapZoom);
      if (parsed.mapZoom === null) setMapZoom(null);
      if (typeof parsed.locationQuery === "string") setLocationQuery(parsed.locationQuery);
    } catch {
    } finally {
      setRestoredStateReady(true);
    }
  }, [setLocationQuery, setMapCenter, setMapZoom, storageKey]);

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

  const clearAllFilters = () => {
    setPfccEnabled(false);
    setSelectedRatings([]);
    setSelectedProgramTypes([]);
    setSelectedCity("");
    setSearchQuery("");
    setMapCenter(null);
    setMapZoom(null);
    setLocationQuery("");
    setLocationSearchClearSignal((value) => value + 1);
    onClearAllFilters?.();
  };

  const clearLocationOnly = () => {
    setMapCenter(null);
    setMapZoom(null);
    setLocationQuery("");
    setLocationSearchClearSignal((value) => value + 1);
  };

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    hydratedDaycares.forEach((daycare) => {
      const city = daycare["CITY"];
      if (city) citySet.add(city);
    });
    return Array.from(citySet).sort((a, b) => prettyCity(a).localeCompare(prettyCity(b)));
  }, [hydratedDaycares]);

  const filteredDaycares = useMemo(() => {
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
      result = result.filter((d) => (d["CITY"] || "") === selectedCity);
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

  // Limit rendered list for performance (pagination can come later)
  const displayList = filteredDaycares.slice(0, 50);

  // Map markers based on FILTERED results
  const markers = useMemo(() => {
    return filteredDaycares
      .filter((d) => d["LAT"] && d["LNG"])
      .map((d) => {
        const id = d["PROGRAM NUMBER"];
        const name = d["PROGRAM NAME"] || "Daycare";
        const city = d["CITY"] || cityDisplay;
        const displayName = toTitleCaseIfAllCaps(name);
        const displayCity = toTitleCaseIfAllCaps(city);
        const url = `${basePath}/daycare/${id}-${slugify(name)}-${slugify(city)}`;
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
        };
      });
  }, [filteredDaycares, cityDisplay, basePath]);

  // Center on the first result if available, otherwise default to a central Ohio coordinate (or the first original result)
  const markerCenter: [number, number] | null = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : null;

  // Fallback if no markers
  const defaultCenter: [number, number] = [39.9612, -82.9988]; 
  const center = mapCenter || markerCenter || defaultCenter;

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0 space-y-8">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-primary">
            Daycares in {cityDisplay || "Ohio"}
          </h2>
          <FilterContent 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            pfccEnabled={pfccEnabled}
            setPfccEnabled={setPfccEnabled}
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
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Mobile Header / Controls */}
          <div className="lg:hidden flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" /> Filters
                    </span>
                    {(pfccEnabled || selectedRatings.length > 0 || selectedProgramTypes.length > 0 || searchQuery || mapCenter || selectedCity) && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">Active</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full sm:max-w-md overflow-y-auto"
                  onOpenAutoFocus={(event) => event.preventDefault()}
                >
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle>Filter Programs</SheetTitle>
                    <SheetDescription>
                      Refine your search results.
                    </SheetDescription>
                  </SheetHeader>
                  <FilterContent
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    pfccEnabled={pfccEnabled}
                    setPfccEnabled={setPfccEnabled}
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
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex flex-col gap-4">
            {!hideHeaderLocationSearch && (
              <div className="hidden lg:block max-w-md">
                <LocationSearch
                  onLocationFound={(lat, lng) => {
                    setMapCenter([lat, lng]);
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
                  {filteredDaycares.length} Results
                </h2>
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
          <div className="rounded-xl border bg-neutral-50 shadow-sm relative z-0">
            <InteractiveMap
              center={center}
              zoom={mapZoom ?? (mapCenter ? 12 : 7)}
              onZoomChange={(zoomLevel) => setMapZoom(zoomLevel)}
              markers={markers}
              userLocation={mapCenter}
              height="500px"
              className="rounded-xl"
            />
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {displayList.map((d) => {
              const id = d["PROGRAM NUMBER"] || "";
              const name = d["PROGRAM NAME"] || "";
              const displayName = toTitleCaseIfAllCaps(name);
              const sutq = d["SUTQ RATING"] || "—";
              const street = d["STREET ADDRESS"] || "";
              const displayStreet = toTitleCaseIfAllCaps(street);
              const city = d["CITY"] || cityDisplay;
              const displayCity = toTitleCaseIfAllCaps(city);
              const programType = d["PROGRAM TYPE"] || "—";
              const displayProgramType = toTitleCaseIfAllCaps(programType);
              const pfcc = d["PFCC AGREEMENT"] === "Y";
              const slug = `${id}-${slugify(name)}-${slugify(city)}`;

              return (
                <div
                  key={id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-4 bg-white hover:border-black transition-colors gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between sm:hidden mb-2">
                      <SutqBadge rating={sutq} className="scale-90 origin-left" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-1">
                      <Link href={`${basePath}/daycare/${slug}`} className="hover:underline">
                        {displayName}
                      </Link>
                    </h3>
                    <p className="text-sm text-neutral-500 mb-1">
                      {displayCity && <span className="font-medium text-black">{displayCity}</span>}
                      {displayCity && displayStreet && <span className="mx-1">•</span>}
                      {displayStreet}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">{displayProgramType}</span>
                      {pfcc && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                          PFCC
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-3 min-w-[120px]">
                    <SutqBadge rating={sutq} />
                    <Link href={`${basePath}/daycare/${slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  <div className="sm:hidden">
                    <Link href={`${basePath}/daycare/${slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}

            {filteredDaycares.length > displayList.length && (
              <div className="text-center py-8 text-neutral-500 border-t border-dashed">
                Showing top 50 results. Use filters to narrow down your search.
              </div>
            )}

            {filteredDaycares.length === 0 && (
              <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-xl border border-dashed">
                <p className="font-medium">No daycares found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                <Button variant="link" onClick={clearAllFilters} className="mt-2">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

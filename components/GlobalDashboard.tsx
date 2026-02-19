"use client";

import { useState, useMemo, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { FILTER_DEFINITIONS } from "@/data/filterDefinitions";

type Daycare = Record<string, string>;

// Helper to format city names
function prettyCity(city: string) {
  return (city || "")
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const RATINGS = ["3", "2", "1"];

const PROGRAM_TYPES = [
  "Licensed Child Care Center",
  "Licensed School-Age Child Care",
  "Licensed School-Based Preschool",
  "Licensed Type A Family Child Care Home",
  "Licensed Type B Family Child Care Home",
  "Certified In Home Aide",
  "Registered Day Camp or Approved Day Camp",
];

// Reusable Filter Content Component
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
  selectedCounty,
  setSelectedCounty,
  cities,
  counties,
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
  selectedCounty: string;
  setSelectedCounty: (v: string) => void;
  cities: string[];
  counties: string[];
  mapCenter: [number, number] | null;
  onClearAll: () => void;
}) {
  const [cityOpen, setCityOpen] = useState(false);
  const [countyOpen, setCountyOpen] = useState(false);

  return (
    <div className="space-y-6 px-4">
      {/* Clear Filters Button (only show if filters active) */}
      {(pfccEnabled || selectedRatings.length > 0 || selectedProgramTypes.length > 0 || searchQuery || mapCenter || selectedCity || selectedCounty) && (
        <button 
          onClick={onClearAll}
          className="text-xs text-neutral-500 underline hover:text-black w-full text-right mb-2"
        >
          Clear Filters
        </button>
      )}

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

      {/* Location Filters */}
      <div>
        <h2 className="text-sm font-semibold mb-4">Location</h2>
        <div className="space-y-4">
          {/* City Filter */}
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
                          onSelect={(currentValue: string) => {
                            // "currentValue" from cmdk is often lowercased. 
                            // We use the original "city" from the map loop to set state reliably.
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

          {/* County Filter */}
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm font-medium">County</Label>
            <ComboPopover open={countyOpen} onOpenChange={setCountyOpen}>
              <ComboTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countyOpen}
                  className="w-full justify-between"
                >
                  {selectedCounty ? prettyCity(selectedCounty) : "Select county..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </ComboTrigger>
              <ComboContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Search county..." />
                  <CommandList>
                    <CommandEmpty>No county found.</CommandEmpty>
                    <CommandGroup>
                        <CommandItem
                            value="all_counties_reset"
                            onSelect={() => {
                              setSelectedCounty("");
                              setCountyOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCounty === "" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Counties
                          </CommandItem>
                      {counties.map((county) => (
                        <CommandItem
                          key={county}
                          value={county}
                          keywords={[county, prettyCity(county)]}
                          onSelect={(currentValue: string) => {
                            // Use the closure "county" variable to ensure consistent casing
                            setSelectedCounty(county === selectedCounty ? "" : county);
                            setCountyOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCounty === county ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {prettyCity(county)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </ComboContent>
            </ComboPopover>
          </div>
        </div>
      </div>

      <Separator />
      
      {/* Program Filters (Same as CityDashboard) */}
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
                className="mt-0.5" 
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

export default function GlobalDashboard() {
  // State
  const [daycares, setDaycares] = useState<Daycare[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [pfccEnabled, setPfccEnabled] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetch("/api/daycares")
      .then((res) => res.json())
      .then((data) => {
        setDaycares(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load daycares:", err);
        setLoading(false);
      });
  }, []);

  // Derive unique lists for dropdowns
  const { cities, counties } = useMemo(() => {
    const c = new Set<string>();
    const co = new Set<string>();
    daycares.forEach(d => {
      if (d.CITY) c.add(d.CITY.trim());
      if (d.COUNTY) co.add(d.COUNTY.trim());
    });
    return {
      cities: Array.from(c).sort(),
      counties: Array.from(co).sort()
    };
  }, [daycares]);

  // Filtering Logic
  const filteredDaycares = useMemo(() => {
    return daycares.filter((d) => {
      // Text Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          d["PROGRAM NAME"]?.toLowerCase().includes(q) ||
          d["STREET ADDRESS"]?.toLowerCase().includes(q);
        if (!textMatch) return false;
      }

      // Location Filters
      if (selectedCity && d.CITY?.trim() !== selectedCity) return false;
      if (selectedCounty && d.COUNTY?.trim() !== selectedCounty) return false;

      // PFCC
      if (pfccEnabled && d["PFCC"] !== "Y") return false;

      // SUTQ
      if (selectedRatings.length > 0) {
        const r = d["SUTQ RATING"] || "0"; // "0" or "1","2","3"
        // If "Unrated" (0) is selected, we want to match d["SUTQ RATING"] empty or 0.
        // Data likely has "1", "2", "3" or empty.
        // If rating is empty/null, treat as "0".
        const dRating = !r || r === "" ? "0" : r;
        if (!selectedRatings.includes(dRating)) return false;
      }

      // Program Type
      if (selectedProgramTypes.length > 0) {
        if (!selectedProgramTypes.includes(d["wPROGRAM TYPE"] || d["PROGRAM TYPE"])) return false;
      }

      return true;
    });
  }, [daycares, searchQuery, pfccEnabled, selectedRatings, selectedProgramTypes, selectedCity, selectedCounty]);

  const mapMarkers = useMemo(() => {
    return filteredDaycares
      .filter((d) => d.LAT && d.LNG)
      .map((d) => ({
        lat: typeof d.LAT === 'string' ? parseFloat(d.LAT) : d.LAT,
        lng: typeof d.LNG === 'string' ? parseFloat(d.LNG) : d.LNG,
        title: d["PROGRAM NAME"],
        url: `/daycare/${slugify(d["PROGRAM NUMBER"] + "-" + d["PROGRAM NAME"])}`,
      }));
  }, [filteredDaycares]);

  // Ohio Center
  const defaultCenterCoords: [number, number] = [40.4173, -82.9071];
  const center = mapCenter || defaultCenterCoords;

  function clearAll() {
    setPfccEnabled(false);
    setSelectedRatings([]);
    setSelectedProgramTypes([]);
    setSelectedCity("");
    setSelectedCounty("");
    setSearchQuery("");
    setMapCenter(null);
  }

  const toggleRating = (r: string) => {
    setSelectedRatings(prev => 
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  const toggleProgramType = (t: string) => {
    setSelectedProgramTypes(prev => 
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-neutral-500">
        Loading Ohio Daycares...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0 space-y-8">
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
          selectedCounty={selectedCounty}
          setSelectedCounty={setSelectedCounty}
          cities={cities}
          counties={counties}
          mapCenter={mapCenter}
          onClearAll={clearAll}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Mobile Header / Controls */}
        <div className="lg:hidden flex flex-col gap-4">
          <LocationSearch 
            onLocationFound={(lat, lng) => setMapCenter([lat, lng])}
          />
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {(pfccEnabled || selectedRatings.length > 0 || selectedProgramTypes.length > 0 || selectedCity || selectedCounty || searchQuery || mapCenter) && (
                    <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
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
                  selectedCounty={selectedCounty}
                  setSelectedCounty={setSelectedCounty}
                  cities={cities}
                  counties={counties}
                  mapCenter={mapCenter}
                  onClearAll={clearAll}
                />
              </SheetContent>
            </Sheet>
            
            {/* Mobile View Toggle - Future consideration, currently just scrolling */}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col gap-4">
          <div className="hidden lg:block">
            <LocationSearch 
              onLocationFound={(lat, lng) => setMapCenter([lat, lng])}
              className="max-w-md mb-4"
            />
          </div>
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl font-bold">
              {filteredDaycares.length} Results
              {selectedCity && <span className="font-normal text-neutral-500 ml-2">in {prettyCity(selectedCity)}</span>}
              {selectedCounty && <span className="font-normal text-neutral-500 ml-2">in {prettyCity(selectedCounty)} County</span>}
            </h1>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl border bg-neutral-50 shadow-sm relative z-0">
          <InteractiveMap 
            center={center}
            zoom={mapCenter ? 12 : 7}
            markers={mapMarkers}
            userLocation={mapCenter}
            height="500px" // Taller map for global view
            className="rounded-xl"
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredDaycares.slice(0, 50).map((d) => (
             <div 
               key={d["PROGRAM NUMBER"]} 
               className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-4 bg-white hover:border-black transition-colors gap-4"
             >
               <div>
                  <div className="flex items-start justify-between sm:hidden mb-2">
                     <SutqBadge rating={d["SUTQ RATING"]} className="scale-90 origin-left" />
                  </div>
                 <h3 className="font-bold text-lg leading-tight mb-1">
                   <Link href={`/daycare/${slugify(d["PROGRAM NUMBER"] + "-" + d["PROGRAM NAME"])}`} className="hover:underline">
                     {d["PROGRAM NAME"]}
                   </Link>
                 </h3>
                 <p className="text-sm text-neutral-500 mb-1">
                   {d.CITY && <span className="font-medium text-black">{prettyCity(d.CITY)}</span>}
                   {d.CITY && d["STREET ADDRESS"] && <span className="mx-1">•</span>}
                   {d["STREET ADDRESS"]}
                 </p>
                 <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                        {d["PROGRAM TYPE"]}
                    </span>
                    {d["PFCC"] === "Y" && (
                         <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                           PFCC
                         </span>
                    )}
                 </div>
               </div>
               
               <div className="hidden sm:flex flex-col items-end gap-3 min-w-[120px]">
                 <SutqBadge rating={d["SUTQ RATING"]} />
                 <Link href={`/daycare/${slugify(d["PROGRAM NUMBER"] + "-" + d["PROGRAM NAME"])}`}>
                    <Button variant="outline" size="sm" className="w-full">
                        View Details
                    </Button>
                 </Link>
               </div>
               
               <div className="sm:hidden">
                    <Link href={`/daycare/${slugify(d["PROGRAM NUMBER"] + "-" + d["PROGRAM NAME"])}`}>
                        <Button variant="outline" size="sm" className="w-full">
                            View Details
                        </Button>
                    </Link>
               </div>
             </div>
          ))}
          
          {filteredDaycares.length > 50 && (
            <div className="text-center py-8 text-neutral-500 border-t border-dashed">
                Showing top 50 results. Use filters to narrow down your search.
            </div>
          )}

          {filteredDaycares.length === 0 && (
            <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-xl border border-dashed">
              <p className="font-medium">No daycares found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SutqBadge } from "@/components/SutqBadge";
import InteractiveMap from "@/components/InteractiveMap";
import FilterInput from "@/components/FilterInput";
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
import { Filter, Map as MapIcon, Info } from "lucide-react";
import { FILTER_DEFINITIONS } from "@/data/filterDefinitions";

type Daycare = Record<string, string>;

interface CityDashboardProps {
  daycares: Daycare[];
  cityDisplay: string;
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

// Helper component for filter content since it's used in both desktop sidebar and mobile sheet
function FilterContent({
  pfccEnabled,
  setPfccEnabled,
  selectedRatings,
  toggleRating,
  selectedProgramTypes,
  toggleProgramType,
}: {
  pfccEnabled: boolean;
  setPfccEnabled: (v: boolean) => void;
  selectedRatings: string[];
  toggleRating: (v: string) => void;
  selectedProgramTypes: string[];
  toggleProgramType: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
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
              <PopoverContent className="max-w-xs text-sm" side="right">
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
            <PopoverContent className="max-w-xs text-sm" side="right">
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
            <PopoverContent className="max-w-xs text-sm" side="right">
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
      
      {/* Clear Filters Button (only show if filters active) */}
      {(pfccEnabled || selectedRatings.length > 0 || selectedProgramTypes.length > 0) && (
        <button 
          onClick={() => {
            setPfccEnabled(false);
            setSelectedRatings([]);
            setSelectedProgramTypes([]);
          }}
          className="text-xs text-neutral-500 underline hover:text-black w-full text-left pt-2"
        >
          Clear all filters
        </button>
      )}
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

export default function CityDashboard({ daycares, cityDisplay }: CityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pfccEnabled, setPfccEnabled] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedProgramTypes, setSelectedProgramTypes] = useState<string[]>([]);

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

  const filteredDaycares = useMemo(() => {
    let result = daycares;

    // 1. Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((d) => {
        const name = (d["PROGRAM NAME"] || "").toLowerCase();
        const address = (d["STREET ADDRESS"] || "").toLowerCase();
        const zip = (d["ZIP CODE"] || "");
        return (
          name.includes(lowerQuery) ||
          address.includes(lowerQuery) ||
          zip.includes(lowerQuery)
        );
      });
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
  }, [daycares, searchQuery, pfccEnabled, selectedRatings, selectedProgramTypes]);

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
        const url = `/daycare/${id}-${slugify(name)}-${slugify(city)}`;
        return {
          lat: Number(d["LAT"]),
          lng: Number(d["LNG"]),
          title: name,
          url,
        };
      });
  }, [filteredDaycares, cityDisplay]);

  // Center on the first result if available, otherwise default to a central Ohio coordinate (or the first original result)
  const markerCenter: [number, number] | null = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : null;

  // Fallback if no markers
  const defaultCenter: [number, number] = [39.9612, -82.9988]; 
  const center = markerCenter || defaultCenter;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daycares in {cityDisplay || "Ohio"}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Showing {displayList.length}
          {filteredDaycares.length > displayList.length ? ` of ${filteredDaycares.length}` : ""} licensed programs
          {daycares.length !== filteredDaycares.length ? ` (filtered from ${daycares.length})` : ""}.
        </p>

        <div className="mt-5">
           <FilterInput
             value={searchQuery}
             onChange={setSearchQuery} 
             placeholder="Search name, address, or zip code..."
           />
        </div>
      </header>

      <section className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* Mobile Filter Sheet Trigger & Header (Mobile Only) */}
        <div className="lg:hidden order-2 mb-2">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </span>
                {(pfccEnabled || selectedRatings.length > 0 || selectedProgramTypes.length > 0) && (
                   <Badge variant="secondary" className="h-5 px-1.5 text-xs">Active</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Filter Programs</SheetTitle>
                <SheetDescription>
                  Refine your search results.
                </SheetDescription>
              </SheetHeader>
              <FilterContent 
                pfccEnabled={pfccEnabled}
                setPfccEnabled={setPfccEnabled}
                selectedRatings={selectedRatings}
                toggleRating={toggleRating}
                selectedProgramTypes={selectedProgramTypes}
                toggleProgramType={toggleProgramType}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar Filters (Hidden on Mobile) */}
        <aside className="hidden lg:block lg:col-span-3 lg:order-1">
          <div className="sticky top-6 space-y-6 rounded-2xl border p-5">
              <FilterContent 
                pfccEnabled={pfccEnabled}
                setPfccEnabled={setPfccEnabled}
                selectedRatings={selectedRatings}
                toggleRating={toggleRating}
                selectedProgramTypes={selectedProgramTypes}
                toggleProgramType={toggleProgramType}
              />
          </div>
        </aside>

        {/* Results List */}
        <div className="lg:col-span-5 order-3 lg:order-2">
          <div className="rounded-2xl border">
            <div className="border-b p-4 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-semibold">Results</h2>
                <p className="mt-1 text-xs text-neutral-600">
                  Data source: Ohio early care & education programs.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-normal">
                {filteredDaycares.length} found
              </Badge>
            </div>

            <div className="p-4">
              {displayList.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-sm font-medium text-neutral-900">No daycares found</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Try adjusting your search or filters to see more results.
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setPfccEnabled(false);
                      setSelectedRatings([]);
                      setSelectedProgramTypes([]);
                    }}
                    className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayList.map((d) => {
                    const id = d["PROGRAM NUMBER"] || "";
                    const name = d["PROGRAM NAME"] || "";
                    // const county = d["COUNTY"] || ""; // Not using county in this view anymore to save space
                    const sutq = d["SUTQ RATING"] || "—";
                    const street = d["STREET ADDRESS"] || "";
                    const zip = d["ZIP CODE"] || "";
                    const programType = d["PROGRAM TYPE"] || "—";
                    const city = d["CITY"] || cityDisplay;
                    const pfcc = d["PFCC AGREEMENT"] === "Y";

                    const slug = `${id}-${slugify(name)}-${slugify(city)}`;

                    return (
                      <div key={id} className="rounded-xl border p-4 hover:bg-neutral-50 transition-colors group">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold group-hover:text-blue-700 transition-colors">{name}</div>
                            <div className="mt-1 text-sm text-neutral-600">
                              {street}, {cityDisplay}, OH {zip}
                            </div>
                            <div className="mt-1 text-sm text-neutral-600 flex flex-wrap gap-2 items-center">
                              <span>{programType}</span>
                              {pfcc && (
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-green-50 text-green-700 border-green-200">
                                  PFCC
                                </Badge>
                              )}
                            </div>

                            <div className="mt-3 inline-flex gap-2">
                              <SutqBadge rating={sutq} />
                            </div>
                          </div>

                          <Link
                            href={`/daycare/${slug}`}
                            className="shrink-0 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-white hover:text-blue-700 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredDaycares.length > displayList.length && (
                <div className="mt-6 text-center border-t pt-4">
                  <p className="text-xs text-neutral-500 mb-2">
                    Showing {displayList.length} of {filteredDaycares.length} results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-4 order-1 lg:order-3">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border overflow-hidden">
              <InteractiveMap
                center={center}
                zoom={markers.length > 0 ? 12 : 10}
                markers={markers}
                height="400px"
                className="w-full h-full"
              />
              <div className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 border-t flex justify-between">
                <span>{markers.length} Locations Mapped</span>
                <span>OpenStreetMap</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, memo } from "react";
import { SutqBadge } from "@/components/SutqBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Check, ChevronsUpDown, X, Search, SlidersHorizontal, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILTER_DEFINITIONS } from "@/data/filterDefinitions";
import type { PremiumFilterSummary } from "@/lib/premiumTypes";

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

// Short labels for program types in chips
const PROGRAM_TYPE_SHORT: Record<string, string> = {
  "Licensed Child Care Center": "Child Care Center",
  "Licensed School-Age Child Care": "School-Age",
  "Licensed School-Based Preschool": "Preschool",
  "Licensed Type A Family Child Care Home": "Type A Home",
  "Licensed Type B Family Child Care Home": "Type B Home",
  "Certified In Home Aide": "In Home Aide",
  "Registered Day Camp or Approved Day Camp": "Day Camp",
};

function prettyCity(city: string) {
  return (city || "")
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

// ── Debounced Search Input ──────────────────────────────────────────────

function SearchChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { setLocalValue(value); }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localValue !== value) onChangeRef.current(localValue);
    }, 180);
    return () => clearTimeout(t);
  }, [localValue, value]);

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-2.5 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
      <input
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search name..."
        className="h-8 w-36 sm:w-44 rounded-full border border-neutral-200 bg-white pl-8 pr-7 text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-neutral-400 transition-colors text-base sm:text-sm"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => { setLocalValue(""); onChangeRef.current(""); }}
          className="absolute right-2 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Toggle Chip (Verified / PFCC) ───────────────────────────────────────

function ToggleChip({
  active,
  onToggle,
  label,
  activeClassName,
  inactiveClassName,
  children,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  activeClassName: string;
  inactiveClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? activeClassName
          : inactiveClassName || "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
      }`}
    >
      {children || label}
      {active && <X className="h-3 w-3 ml-0.5" />}
    </button>
  );
}

// ── Multi-select Dropdown Chip (SUTQ / Program Type) ────────────────────

function MultiSelectChip({
  label,
  selected,
  onToggle,
  onClear,
  options,
  renderOption,
  activeClassName,
}: {
  label: string;
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  options: { value: string; label: string }[];
  renderOption?: (opt: { value: string; label: string }) => React.ReactNode;
  activeClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const active = selected.length > 0;
  const displayLabel = active ? `${label} (${selected.length})` : label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            active
              ? activeClassName
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          {displayLabel}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[200px] p-3" align="start" side="bottom">
        <div className="space-y-2">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`chip-${label}-${opt.value}`}
                checked={selected.includes(opt.value)}
                onCheckedChange={() => onToggle(opt.value)}
              />
              <Label
                htmlFor={`chip-${label}-${opt.value}`}
                className="text-sm font-normal cursor-pointer leading-tight"
              >
                {renderOption ? renderOption(opt) : opt.label}
              </Label>
            </div>
          ))}
          {active && (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 w-full text-xs text-neutral-500 hover:text-neutral-800 underline text-left"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── "More Filters" Popover (City, County, Clear All) ────────────────────

function MoreFiltersChip({
  selectedCity,
  setSelectedCity,
  selectedCounty,
  setSelectedCounty,
  cities,
  counties,
  enableCityFilter,
  hasActiveFilters,
  onClearAll,
}: {
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  selectedCounty?: string;
  setSelectedCounty?: (v: string) => void;
  cities: string[];
  counties?: string[];
  enableCityFilter: boolean;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countyOpen, setCountyOpen] = useState(false);
  const hasLocationFilter = !!selectedCity || !!selectedCounty;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            hasLocationFilter
              ? "border-neutral-400 bg-neutral-100 text-neutral-800"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More
          {hasLocationFilter && (
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-neutral-600" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end" side="bottom">
        <div className="space-y-4">
          {/* City Combobox */}
          {enableCityFilter && (
            <div className="flex flex-col space-y-1.5">
              <Label className="text-sm font-medium">City</Label>
              <Popover open={cityOpen} onOpenChange={setCityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityOpen}
                    className="w-full justify-between text-sm"
                  >
                    {selectedCity ? prettyCity(selectedCity) : "All cities"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[230px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all_cities_reset"
                          onSelect={() => { setSelectedCity(""); setCityOpen(false); }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedCity === "" ? "opacity-100" : "opacity-0")} />
                          All Cities
                        </CommandItem>
                        {cities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            keywords={[city, prettyCity(city)]}
                            onSelect={() => { setSelectedCity(city === selectedCity ? "" : city); setCityOpen(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedCity === city ? "opacity-100" : "opacity-0")} />
                            {prettyCity(city)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* County Combobox (Global only) */}
          {counties && setSelectedCounty && selectedCounty !== undefined && (
            <div className="flex flex-col space-y-1.5">
              <Label className="text-sm font-medium">County</Label>
              <Popover open={countyOpen} onOpenChange={setCountyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countyOpen}
                    className="w-full justify-between text-sm"
                  >
                    {selectedCounty ? prettyCity(selectedCounty) : "All counties"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[230px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search county..." />
                    <CommandList>
                      <CommandEmpty>No county found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all_counties_reset"
                          onSelect={() => { setSelectedCounty(""); setCountyOpen(false); }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedCounty === "" ? "opacity-100" : "opacity-0")} />
                          All Counties
                        </CommandItem>
                        {counties.map((county) => (
                          <CommandItem
                            key={county}
                            value={county}
                            keywords={[county, prettyCity(county)]}
                            onSelect={() => { setSelectedCounty(county === selectedCounty ? "" : county); setCountyOpen(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedCounty === county ? "opacity-100" : "opacity-0")} />
                            {prettyCity(county)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Clear All */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { onClearAll(); setOpen(false); }}
              className="text-xs text-neutral-500 underline hover:text-black w-full text-left pt-1"
            >
              Clear all filters
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Premium Filter Constants ────────────────────────────────────────────

const AGE_BRACKETS = [
  { value: "infant", label: "Infant", desc: "0–12 mo" },
  { value: "toddler", label: "Toddler", desc: "1–3 yr" },
  { value: "preschool", label: "Preschool", desc: "3–5 yr" },
  { value: "school-age", label: "School Age", desc: "5–12 yr" },
] as const;

const PRICE_BRACKETS = [
  { value: 150, label: "Under $150/wk" },
  { value: 200, label: "Under $200/wk" },
  { value: 250, label: "Under $250/wk" },
  { value: 300, label: "Under $300/wk" },
  { value: 400, label: "Under $400/wk" },
] as const;

const SCHEDULE_CODES = [
  { value: "before_school_care", label: "Before-School Care" },
  { value: "after_school_care", label: "After-School Care" },
  { value: "weekend_hours", label: "Weekend Hours" },
  { value: "evening_care", label: "Evening Care" },
  { value: "drop_in_care", label: "Drop-In Care" },
  { value: "overnight_care", label: "Overnight Care" },
  { value: "summer_care", label: "Summer Care" },
  { value: "part_time_care", label: "Part-Time Care" },
  { value: "full_time_care", label: "Full-Time Care" },
  { value: "transportation_available", label: "Transportation" },
] as const;

const AMENITY_GROUPS: { group: string; codes: { value: string; label: string }[] }[] = [
  {
    group: "Daily Essentials",
    codes: [
      { value: "diapers_provided", label: "Diapers Provided" },
      { value: "wipes_provided", label: "Wipes Provided" },
      { value: "crib_sheets_provided", label: "Crib Sheets" },
      { value: "car_seat_storage", label: "Car Seat Storage" },
    ],
  },
  {
    group: "Meals & Feeding",
    codes: [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "morning_snack", label: "Morning Snack" },
      { value: "afternoon_snack", label: "Afternoon Snack" },
      { value: "baby_food_provided", label: "Baby Food" },
      { value: "formula_provided", label: "Formula" },
    ],
  },
  {
    group: "Facilities & Safety",
    codes: [
      { value: "outdoor_playground", label: "Outdoor Playground" },
      { value: "fenced_playground", label: "Fenced Playground" },
      { value: "indoor_play_area", label: "Indoor Play Area" },
      { value: "security_cameras", label: "Security Cameras" },
      { value: "keypad_entry", label: "Keypad Entry" },
    ],
  },
  {
    group: "Communication",
    codes: [
      { value: "parent_communication_app", label: "Parent App" },
      { value: "live_parent_camera", label: "Live Parent Camera" },
    ],
  },
  {
    group: "Programs & Learning",
    codes: [
      { value: "structured_curriculum", label: "Structured Curriculum" },
      { value: "stem_activities", label: "STEM Activities" },
      { value: "arts_and_crafts", label: "Arts & Crafts" },
      { value: "music_and_movement", label: "Music & Movement" },
      { value: "field_trips", label: "Field Trips" },
    ],
  },
];

// ── Age Group Chip ──────────────────────────────────────────────────────

function AgeGroupChip({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = !!selected;
  const activeLabel = AGE_BRACKETS.find((b) => b.value === selected);
  const displayLabel = active ? `Age: ${activeLabel?.label}` : "Age Group";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            active
              ? "border-violet-300 bg-violet-50 text-violet-800"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          {displayLabel}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[180px] p-3" align="start" side="bottom">
        <div className="space-y-1.5">
          {AGE_BRACKETS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => { onSelect(selected === b.value ? null : b.value); setOpen(false); }}
              className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                selected === b.value
                  ? "bg-violet-100 text-violet-800 font-medium"
                  : "hover:bg-neutral-100 text-neutral-700"
              }`}
            >
              <span>{b.label}</span>
              <span className="text-xs text-neutral-400 ml-3">{b.desc}</span>
            </button>
          ))}
          {active && (
            <button
              type="button"
              onClick={() => { onSelect(null); setOpen(false); }}
              className="mt-1 w-full text-xs text-neutral-500 hover:text-neutral-800 underline text-left"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Price Chip ───────────────────────────────────────────────────────────

function PriceChip({
  maxWeeklyPrice,
  onMaxWeeklyPriceChange,
  pricePeriod,
  onPricePeriodChange,
}: {
  maxWeeklyPrice: number | null;
  onMaxWeeklyPriceChange: (v: number | null) => void;
  pricePeriod: "weekly" | "daily" | "monthly";
  onPricePeriodChange: (v: "weekly" | "daily" | "monthly") => void;
}) {
  const [open, setOpen] = useState(false);
  const active = maxWeeklyPrice !== null;

  function displayPrice(weeklyAmount: number): string {
    if (pricePeriod === "daily") return `$${Math.round(weeklyAmount / 5)}/day`;
    if (pricePeriod === "monthly") return `$${Math.round(weeklyAmount * 4.33)}/mo`;
    return `$${weeklyAmount}/wk`;
  }

  const displayLabel = active ? `Under ${displayPrice(maxWeeklyPrice)}` : "Price";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            active
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          {displayLabel}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[200px] p-3" align="start" side="bottom">
        <div className="space-y-3">
          {/* Period toggle */}
          <div className="flex rounded-full border border-neutral-200 overflow-hidden text-xs">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPricePeriodChange(p)}
                className={`flex-1 px-2 py-1 capitalize transition-colors ${
                  pricePeriod === p
                    ? "bg-emerald-600 text-white font-medium"
                    : "hover:bg-neutral-100 text-neutral-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Bracket buttons */}
          <div className="space-y-1">
            {PRICE_BRACKETS.map((b) => {
              const periodLabel =
                pricePeriod === "daily"
                  ? `Under $${Math.round(b.value / 5)}/day`
                  : pricePeriod === "monthly"
                  ? `Under $${Math.round(b.value * 4.33)}/mo`
                  : b.label;
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => { onMaxWeeklyPriceChange(maxWeeklyPrice === b.value ? null : b.value); setOpen(false); }}
                  className={`w-full text-left rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    maxWeeklyPrice === b.value
                      ? "bg-emerald-100 text-emerald-800 font-medium"
                      : "hover:bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {periodLabel}
                </button>
              );
            })}
          </div>
          {active && (
            <button
              type="button"
              onClick={() => { onMaxWeeklyPriceChange(null); setOpen(false); }}
              className="mt-1 w-full text-xs text-neutral-500 hover:text-neutral-800 underline text-left"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Schedule Chip ────────────────────────────────────────────────────────

function ScheduleChip({
  selected,
  onToggle,
  onClear,
}: {
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = selected.length > 0;
  const displayLabel = active ? `Schedule (${selected.length})` : "Schedule";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            active
              ? "border-orange-300 bg-orange-50 text-orange-800"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          {displayLabel}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[200px] p-3" align="start" side="bottom">
        <div className="space-y-2">
          {SCHEDULE_CODES.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`chip-schedule-${opt.value}`}
                checked={selected.includes(opt.value)}
                onCheckedChange={() => onToggle(opt.value)}
              />
              <Label
                htmlFor={`chip-schedule-${opt.value}`}
                className="text-sm font-normal cursor-pointer leading-tight"
              >
                {opt.label}
              </Label>
            </div>
          ))}
          {active && (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 w-full text-xs text-neutral-500 hover:text-neutral-800 underline text-left"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Amenities Chip ───────────────────────────────────────────────────────

function AmenitiesChip({
  selected,
  onToggle,
  onClear,
}: {
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Essentials"]));
  const active = selected.length > 0;
  const displayLabel = active ? `Amenities (${selected.length})` : "Amenities";

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            active
              ? "border-pink-300 bg-pink-50 text-pink-800"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          {displayLabel}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[220px] max-h-[320px] overflow-y-auto p-3" align="start" side="bottom">
        <div className="space-y-2">
          {AMENITY_GROUPS.map((g) => {
            const isExpanded = expandedGroups.has(g.group);
            const groupSelectedCount = g.codes.filter((c) => selected.includes(c.value)).length;
            return (
              <div key={g.group}>
                <button
                  type="button"
                  onClick={() => toggleGroup(g.group)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-neutral-500 uppercase tracking-wider py-1"
                >
                  <span>
                    {g.group}
                    {groupSelectedCount > 0 && (
                      <span className="ml-1 text-pink-600">({groupSelectedCount})</span>
                    )}
                  </span>
                  <ChevronsUpDown className="h-3 w-3 opacity-40" />
                </button>
                {isExpanded && (
                  <div className="space-y-1.5 pl-0.5 pb-1">
                    {g.codes.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`chip-amenity-${opt.value}`}
                          checked={selected.includes(opt.value)}
                          onCheckedChange={() => onToggle(opt.value)}
                        />
                        <Label
                          htmlFor={`chip-amenity-${opt.value}`}
                          className="text-sm font-normal cursor-pointer leading-tight"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {active && (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 w-full text-xs text-neutral-500 hover:text-neutral-800 underline text-left"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Has Photos Chip ─────────────────────────────────────────────────────

function HasPhotosChip({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? "border-sky-300 bg-sky-50 text-sky-800"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
      }`}
    >
      <Camera className="h-3.5 w-3.5" />
      <span>Has Photos</span>
      {active && <X className="h-3 w-3 ml-0.5" />}
    </button>
  );
}

// ── Main FilterChipBar ──────────────────────────────────────────────────

export interface FilterChipBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  pfccEnabled: boolean;
  setPfccEnabled: (v: boolean) => void;
  verifiedEnabled: boolean;
  setVerifiedEnabled: (v: boolean) => void;
  selectedRatings: string[];
  toggleRating: (v: string) => void;
  selectedProgramTypes: string[];
  toggleProgramType: (v: string) => void;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  selectedCounty?: string;
  setSelectedCounty?: (v: string) => void;
  cities: string[];
  counties?: string[];
  enableCityFilter?: boolean;
  mapCenter: [number, number] | null;
  onClearAll: () => void;
  // Premium filter props
  premiumSummaries?: Record<string, PremiumFilterSummary>;
  ageBracket?: string | null;
  setAgeBracket?: (v: string | null) => void;
  maxWeeklyPrice?: number | null;
  setMaxWeeklyPrice?: (v: number | null) => void;
  pricePeriod?: "weekly" | "daily" | "monthly";
  setPricePeriod?: (v: "weekly" | "daily" | "monthly") => void;
  scheduleFilters?: string[];
  toggleScheduleFilter?: (v: string) => void;
  clearScheduleFilters?: () => void;
  amenityFilters?: string[];
  toggleAmenityFilter?: (v: string) => void;
  clearAmenityFilters?: () => void;
  hasPhotosFilter?: boolean;
  setHasPhotosFilter?: (v: boolean) => void;
}

function FilterChipBar({
  searchQuery,
  setSearchQuery,
  pfccEnabled,
  setPfccEnabled,
  verifiedEnabled,
  setVerifiedEnabled,
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
  enableCityFilter = true,
  mapCenter,
  onClearAll,
  premiumSummaries,
  ageBracket,
  setAgeBracket,
  maxWeeklyPrice,
  setMaxWeeklyPrice,
  pricePeriod = "weekly",
  setPricePeriod,
  scheduleFilters = [],
  toggleScheduleFilter,
  clearScheduleFilters,
  amenityFilters = [],
  toggleAmenityFilter,
  clearAmenityFilters,
  hasPhotosFilter = false,
  setHasPhotosFilter,
}: FilterChipBarProps) {
  const hasPremiumData = premiumSummaries && Object.keys(premiumSummaries).length > 0;
  const hasActiveFilters =
    pfccEnabled ||
    verifiedEnabled ||
    selectedRatings.length > 0 ||
    selectedProgramTypes.length > 0 ||
    !!searchQuery ||
    !!mapCenter ||
    !!selectedCity ||
    !!selectedCounty ||
    !!ageBracket ||
    maxWeeklyPrice !== null && maxWeeklyPrice !== undefined ||
    scheduleFilters.length > 0 ||
    amenityFilters.length > 0 ||
    hasPhotosFilter;

  const sutqOptions = [
    ...RATINGS.map((r) => ({
      value: r,
      label: r === "3" ? "Gold Rated" : r === "2" ? "Silver Rated" : "Bronze Rated",
    })),
    { value: "0", label: "Not Rated" },
  ];

  const programTypeOptions = PROGRAM_TYPES.map((t) => ({
    value: t,
    label: PROGRAM_TYPE_SHORT[t] || t,
  }));

  return (
    <div className="-mx-2 -mt-3 sm:-mx-6 sm:-mt-6 rounded-none sm:rounded-t-3xl px-3 py-2.5 sm:px-6 sm:py-3" style={{ background: "#D5E5E3" }}>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -my-1">
      {/* Search */}
      <SearchChip value={searchQuery} onChange={setSearchQuery} />

      {/* Owner Verified */}
      <ToggleChip
        active={verifiedEnabled}
        onToggle={() => setVerifiedEnabled(!verifiedEnabled)}
        label="Owner Verified"
        activeClassName="border-[#4A6B67] bg-[#4A6B67] text-white"
        inactiveClassName="border-[#4A6B67]/40 bg-white text-[#4A6B67] hover:border-[#4A6B67]/70"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
        <span>Owner Verified</span>
      </ToggleChip>

      {/* SUTQ Rating */}
      <MultiSelectChip
        label="Rating"
        selected={selectedRatings}
        onToggle={toggleRating}
        onClear={() => selectedRatings.forEach(toggleRating)}
        options={sutqOptions}
        renderOption={(opt) => (
          <SutqBadge rating={opt.value} className="scale-90 origin-left" />
        )}
        activeClassName="border-amber-300 bg-amber-50 text-amber-800"
      />

      {/* PFCC */}
      <ToggleChip
        active={pfccEnabled}
        onToggle={() => setPfccEnabled(!pfccEnabled)}
        label="PFCC"
        activeClassName="border-blue-300 bg-blue-50 text-blue-700"
      />

      {/* Program Type */}
      <MultiSelectChip
        label="Type"
        selected={selectedProgramTypes}
        onToggle={toggleProgramType}
        onClear={() => selectedProgramTypes.forEach(toggleProgramType)}
        options={programTypeOptions}
        activeClassName="border-slate-400 bg-slate-100 text-slate-800"
      />

      {/* ── Premium Filter Chips (only render when premium data exists) ── */}
      {hasPremiumData && setAgeBracket && (
        <AgeGroupChip selected={ageBracket ?? null} onSelect={setAgeBracket} />
      )}
      {hasPremiumData && setMaxWeeklyPrice && setPricePeriod && (
        <PriceChip
          maxWeeklyPrice={maxWeeklyPrice ?? null}
          onMaxWeeklyPriceChange={setMaxWeeklyPrice}
          pricePeriod={pricePeriod}
          onPricePeriodChange={setPricePeriod}
        />
      )}
      {hasPremiumData && toggleScheduleFilter && clearScheduleFilters && (
        <ScheduleChip
          selected={scheduleFilters}
          onToggle={toggleScheduleFilter}
          onClear={clearScheduleFilters}
        />
      )}
      {hasPremiumData && toggleAmenityFilter && clearAmenityFilters && (
        <AmenitiesChip
          selected={amenityFilters}
          onToggle={toggleAmenityFilter}
          onClear={clearAmenityFilters}
        />
      )}
      {hasPremiumData && setHasPhotosFilter && (
        <HasPhotosChip
          active={hasPhotosFilter}
          onToggle={() => setHasPhotosFilter(!hasPhotosFilter)}
        />
      )}

      {/* More Filters (City, County, Clear All) */}
      <MoreFiltersChip
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedCounty={selectedCounty}
        setSelectedCounty={setSelectedCounty}
        cities={cities}
        counties={counties}
        enableCityFilter={enableCityFilter ?? true}
        hasActiveFilters={hasActiveFilters}
        onClearAll={onClearAll}
      />

      {/* Inline Clear All (visible when filters active) */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 whitespace-nowrap hover:bg-red-100 transition-colors flex-shrink-0"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
      </div>
    </div>
  );
}

export default memo(FilterChipBar);
export { RATINGS, PROGRAM_TYPES };

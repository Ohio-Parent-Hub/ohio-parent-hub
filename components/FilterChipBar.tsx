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
import { BriefcaseBusiness, Check, ChevronsUpDown, X, Search, SlidersHorizontal, Camera } from "lucide-react";
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
  const [focused, setFocused] = useState(false);
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? "" : "Daycare name"}
        className="h-8 w-full rounded-full border border-neutral-200 bg-white pl-8 pr-7 text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-neutral-400 transition-colors text-base sm:text-sm"
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
  pfccEnabled,
  setPfccEnabled,
  selectedProgramTypes,
  toggleProgramType,
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
  pfccEnabled: boolean;
  setPfccEnabled: (v: boolean) => void;
  selectedProgramTypes: string[];
  toggleProgramType: (v: string) => void;
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
  const hasLocationFilter = !!selectedCity || !!selectedCounty || pfccEnabled || selectedProgramTypes.length > 0;

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
          <span className="hidden sm:inline">More</span>
          {hasLocationFilter && (
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-neutral-600" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end" side="bottom">
        <div className="space-y-4">
          {/* PFCC Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Publicly Funded (PFCC)</Label>
            <button
              type="button"
              onClick={() => setPfccEnabled(!pfccEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                pfccEnabled ? "bg-blue-500" : "bg-neutral-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  pfccEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </div>

          {/* Program Type */}
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm font-medium">Type{selectedProgramTypes.length > 0 ? ` (${selectedProgramTypes.length})` : ""}</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {PROGRAM_TYPES.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Checkbox
                    id={`more-type-${t}`}
                    checked={selectedProgramTypes.includes(t)}
                    onCheckedChange={() => toggleProgramType(t)}
                  />
                  <Label
                    htmlFor={`more-type-${t}`}
                    className="text-sm font-normal cursor-pointer leading-tight"
                  >
                    {PROGRAM_TYPE_SHORT[t] || t}
                  </Label>
                </div>
              ))}
              {selectedProgramTypes.length > 0 && (
                <button
                  type="button"
                  onClick={() => selectedProgramTypes.forEach(toggleProgramType)}
                  className="mt-1 w-full text-xs text-neutral-500 hover:text-neutral-800 underline text-left"
                >
                  Clear type
                </button>
              )}
            </div>
          </div>

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

const PRICE_SLIDER_MIN = 50;
const PRICE_SLIDER_MAX = 500;
const PRICE_SLIDER_STEP = 25;

function weeklyToDisplay(weeklyAmount: number | null, period: "weekly" | "daily" | "monthly"): string {
  if (weeklyAmount === null) return "Any price";
  if (period === "daily") return `$${Math.round(weeklyAmount / 5)}/day`;
  if (period === "monthly") return `$${Math.round(weeklyAmount * 4.33)}/mo`;
  return `$${weeklyAmount}/wk`;
}

function weeklyToInputDisplay(weekly: number | null, period: "weekly" | "daily" | "monthly"): string {
  if (weekly === null) return "";
  if (period === "daily") return String(Math.round(weekly / 5));
  if (period === "monthly") return String(Math.round(weekly * 4.33));
  return String(weekly);
}

function inputDisplayToWeekly(display: string, period: "weekly" | "daily" | "monthly"): number | null {
  const num = parseInt(display, 10);
  if (isNaN(num) || num <= 0) return null;
  if (period === "daily") return Math.round(num * 5);
  if (period === "monthly") return Math.round(num / 4.33);
  return num;
}

function PriceSlider({
  minWeeklyPrice,
  onMinWeeklyPriceChange,
  maxWeeklyPrice,
  onMaxWeeklyPriceChange,
  pricePeriod,
  onPricePeriodChange,
  ageBrackets = [],
}: {
  minWeeklyPrice: number | null;
  onMinWeeklyPriceChange: (v: number | null) => void;
  maxWeeklyPrice: number | null;
  onMaxWeeklyPriceChange: (v: number | null) => void;
  pricePeriod: "weekly" | "daily" | "monthly";
  onPricePeriodChange: (v: "weekly" | "daily" | "monthly") => void;
  ageBrackets?: string[];
}) {
  // Map null → edge values for sliders
  const minSlider = minWeeklyPrice ?? PRICE_SLIDER_MIN;
  // max slider: null = "Any" = one step past PRICE_SLIDER_MAX
  const maxSlider = maxWeeklyPrice === null ? PRICE_SLIDER_MAX + PRICE_SLIDER_STEP : maxWeeklyPrice;

  const handleMinSlider = (val: number) => {
    if (val <= PRICE_SLIDER_MIN) { onMinWeeklyPriceChange(null); }
    else {
      onMinWeeklyPriceChange(val);
      // push max up if needed
      if (maxWeeklyPrice !== null && val > maxWeeklyPrice) onMaxWeeklyPriceChange(val);
    }
  };

  const handleMaxSlider = (val: number) => {
    if (val > PRICE_SLIDER_MAX) { onMaxWeeklyPriceChange(null); }
    else {
      onMaxWeeklyPriceChange(val);
      // push min down if needed
      if (minWeeklyPrice !== null && val < minWeeklyPrice) onMinWeeklyPriceChange(val);
    }
  };

  // Label for the slider summary
  let rangeLabel: string;
  if (minWeeklyPrice === null && maxWeeklyPrice === null) {
    rangeLabel = "Any price";
  } else if (minWeeklyPrice !== null && maxWeeklyPrice !== null) {
    rangeLabel = `${weeklyToDisplay(minWeeklyPrice, pricePeriod)} – ${weeklyToDisplay(maxWeeklyPrice, pricePeriod)}`;
  } else if (minWeeklyPrice !== null) {
    rangeLabel = `${weeklyToDisplay(minWeeklyPrice, pricePeriod)}+`;
  } else {
    rangeLabel = `Up to ${weeklyToDisplay(maxWeeklyPrice, pricePeriod)}`;
  }

  return (
    <div className="space-y-3">
      {/* Period dropdown */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium whitespace-nowrap">Show as</Label>
        <select
          value={pricePeriod}
          onChange={(e) => onPricePeriodChange(e.target.value as "weekly" | "daily" | "monthly")}
          className="flex-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Range label */}
      <div className="text-center">
        <span className="text-sm font-semibold text-[#4A6B67]">{rangeLabel}</span>
      </div>

      {/* Dual range sliders (stacked, CSS-overlaid) */}
      <div className="relative h-6">
        {/* Max slider (behind — track visible, thumb reachable) */}
        <input
          type="range"
          min={PRICE_SLIDER_MIN}
          max={PRICE_SLIDER_MAX + PRICE_SLIDER_STEP}
          step={PRICE_SLIDER_STEP}
          value={maxSlider}
          onChange={(e) => handleMaxSlider(Number(e.target.value))}
          className="absolute inset-0 w-full accent-[#7EA8A4] cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: 2 }}
        />
        {/* Min slider (on top — thumb not hidden behind max track) */}
        <input
          type="range"
          min={PRICE_SLIDER_MIN}
          max={PRICE_SLIDER_MAX}
          step={PRICE_SLIDER_STEP}
          value={minSlider}
          onChange={(e) => handleMinSlider(Number(e.target.value))}
          className="absolute inset-0 w-full accent-[#4A6B67] cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent"
          style={{ zIndex: 3 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>{weeklyToDisplay(PRICE_SLIDER_MIN, pricePeriod)}</span>
        <span>Any</span>
      </div>

      {/* Manual Min / Max inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs text-neutral-500">Min</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-neutral-400">$</span>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={weeklyToInputDisplay(minWeeklyPrice, pricePeriod)}
              onChange={(e) => onMinWeeklyPriceChange(inputDisplayToWeekly(e.target.value, pricePeriod))}
              className="w-full rounded-md border border-neutral-200 bg-white pl-6 pr-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#4A6B67]/30 focus:border-[#7EA8A4]"
            />
          </div>
        </div>
        <span className="mt-4 text-neutral-400">–</span>
        <div className="flex-1">
          <Label className="text-xs text-neutral-500">Max</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-neutral-400">$</span>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={weeklyToInputDisplay(maxWeeklyPrice, pricePeriod)}
              onChange={(e) => onMaxWeeklyPriceChange(inputDisplayToWeekly(e.target.value, pricePeriod))}
              className="w-full rounded-md border border-neutral-200 bg-white pl-6 pr-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#4A6B67]/30 focus:border-[#7EA8A4]"
            />
          </div>
        </div>
      </div>

      {/* Age-scope hint */}
      {ageBrackets.length > 0 ? (
        <p className="text-[11px] text-[#4A6B67] italic">
          Pricing for: {ageBrackets.map((b) => AGE_BRACKETS.find((ab) => ab.value === b)?.label ?? b).join(", ")}
        </p>
      ) : (
        <p className="text-[11px] text-neutral-400 italic">
          Select an age group for more accurate pricing
        </p>
      )}
    </div>
  );
}

const SCHEDULE_CODES = [
  { value: "full_time_care", label: "Full-Time Care" },
  { value: "part_time_care", label: "Part-Time Care" },
  { value: "before_school_care", label: "Before-School Care" },
  { value: "after_school_care", label: "After-School Care" },
  { value: "weekend_hours", label: "Weekend Hours" },
  { value: "evening_care", label: "Evening Care" },
  { value: "drop_in_care", label: "Drop-In Care" },
  { value: "overnight_care", label: "Overnight Care" },
  { value: "summer_care", label: "Summer Care" },
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
      { value: "handicap_accessible", label: "Handicap Accessible" },
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
  onToggle,
  onClear,
}: {
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = selected.length > 0;
  const displayLabel = active ? `Age (${selected.length})` : "Age Group";

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
            <div key={b.value} className="flex items-center gap-2">
              <Checkbox
                id={`chip-age-${b.value}`}
                checked={selected.includes(b.value)}
                onCheckedChange={() => onToggle(b.value)}
              />
              <Label
                htmlFor={`chip-age-${b.value}`}
                className="text-sm font-normal cursor-pointer leading-tight flex items-center justify-between flex-1"
              >
                <span>{b.label}</span>
                <span className="text-xs text-neutral-400 ml-3">{b.desc}</span>
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

// ── Price Chip ───────────────────────────────────────────────────────────

function PriceChip({
  minWeeklyPrice,
  onMinWeeklyPriceChange,
  maxWeeklyPrice,
  onMaxWeeklyPriceChange,
  pricePeriod,
  onPricePeriodChange,
  ageBrackets = [],
}: {
  minWeeklyPrice: number | null;
  onMinWeeklyPriceChange: (v: number | null) => void;
  maxWeeklyPrice: number | null;
  onMaxWeeklyPriceChange: (v: number | null) => void;
  pricePeriod: "weekly" | "daily" | "monthly";
  onPricePeriodChange: (v: "weekly" | "daily" | "monthly") => void;
  ageBrackets?: string[];
}) {
  const [open, setOpen] = useState(false);
  const active = minWeeklyPrice !== null || maxWeeklyPrice !== null;

  let displayLabel = "Price";
  if (minWeeklyPrice !== null && maxWeeklyPrice !== null) {
    displayLabel = `${weeklyToDisplay(minWeeklyPrice, pricePeriod)} – ${weeklyToDisplay(maxWeeklyPrice, pricePeriod)}`;
  } else if (minWeeklyPrice !== null) {
    displayLabel = `${weeklyToDisplay(minWeeklyPrice, pricePeriod)}+`;
  } else if (maxWeeklyPrice !== null) {
    displayLabel = `Up to ${weeklyToDisplay(maxWeeklyPrice, pricePeriod)}`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            active
              ? "border-[#7EA8A4] bg-[#D5E5E3] text-[#4A6B67]"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          {displayLabel}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" side="bottom">
        <PriceSlider
          minWeeklyPrice={minWeeklyPrice}
          onMinWeeklyPriceChange={onMinWeeklyPriceChange}
          maxWeeklyPrice={maxWeeklyPrice}
          onMaxWeeklyPriceChange={onMaxWeeklyPriceChange}
          pricePeriod={pricePeriod}
          onPricePeriodChange={onPricePeriodChange}
          ageBrackets={ageBrackets}
        />
        {active && (
          <button
            type="button"
            onClick={() => { onMinWeeklyPriceChange(null); onMaxWeeklyPriceChange(null); setOpen(false); }}
            className="mt-2 w-full text-xs text-neutral-500 hover:text-neutral-800 underline text-left"
          >
            Clear
          </button>
        )}
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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

// ── Mobile Full-Screen Filter Sheet ─────────────────────────────────────

function MobileFilterSheet({
  open,
  onClose,
  pfccEnabled,
  setPfccEnabled,
  verifiedEnabled,
  setVerifiedEnabled,
  nowHiringEnabled,
  setNowHiringEnabled,
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
  enableCityFilter,
  onClearAll,
  hasActiveFilters,
  hasPremiumData,
  ageBrackets,
  toggleAgeBracket,
  clearAgeBrackets,
  minWeeklyPrice,
  setMinWeeklyPrice,
  maxWeeklyPrice,
  setMaxWeeklyPrice,
  pricePeriod,
  setPricePeriod,
  scheduleFilters,
  toggleScheduleFilter,
  clearScheduleFilters,
  amenityFilters,
  toggleAmenityFilter,
  clearAmenityFilters,
  hasPhotosFilter,
  setHasPhotosFilter,
}: {
  open: boolean;
  onClose: () => void;
  pfccEnabled: boolean;
  setPfccEnabled: (v: boolean) => void;
  verifiedEnabled: boolean;
  setVerifiedEnabled: (v: boolean) => void;
  nowHiringEnabled: boolean;
  setNowHiringEnabled: (v: boolean) => void;
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
  enableCityFilter: boolean;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  hasPremiumData: boolean;
  ageBrackets: string[];
  toggleAgeBracket?: (v: string) => void;
  clearAgeBrackets?: () => void;
  minWeeklyPrice?: number | null;
  setMinWeeklyPrice?: (v: number | null) => void;
  maxWeeklyPrice?: number | null;
  setMaxWeeklyPrice?: (v: number | null) => void;
  pricePeriod: "weekly" | "daily" | "monthly";
  setPricePeriod?: (v: "weekly" | "daily" | "monthly") => void;
  scheduleFilters: string[];
  toggleScheduleFilter?: (v: string) => void;
  clearScheduleFilters?: () => void;
  amenityFilters: string[];
  toggleAmenityFilter?: (v: string) => void;
  clearAmenityFilters?: () => void;
  hasPhotosFilter: boolean;
  setHasPhotosFilter?: (v: boolean) => void;
}) {
  const [cityOpen, setCityOpen] = useState(false);
  const [countyOpen, setCountyOpen] = useState(false);
  const [expandedAmenityGroups, setExpandedAmenityGroups] = useState<Set<string>>(new Set());

  const toggleAmenityGroup = (group: string) => {
    setExpandedAmenityGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200" style={{ background: "#D5E5E3" }}>
        <h2 className="text-lg font-semibold text-neutral-800">Filters</h2>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button type="button" onClick={onClearAll} className="text-sm text-red-600 font-medium">
              Clear all
            </button>
          )}
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <X className="h-5 w-5 text-neutral-700" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Now Hiring */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Now Hiring</Label>
          <button
            type="button"
            onClick={() => setNowHiringEnabled(!nowHiringEnabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              nowHiringEnabled ? "bg-[#DCB346]" : "bg-neutral-300"
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              nowHiringEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
            }`} />
          </button>
        </div>

        {/* Owner Verified */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Owner Verified</Label>
          <button
            type="button"
            onClick={() => setVerifiedEnabled(!verifiedEnabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              verifiedEnabled ? "bg-[#4A6B67]" : "bg-neutral-300"
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              verifiedEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
            }`} />
          </button>
        </div>

        {/* Publicly Funded */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Publicly Funded (PFCC)</Label>
          <button
            type="button"
            onClick={() => setPfccEnabled(!pfccEnabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              pfccEnabled ? "bg-blue-500" : "bg-neutral-300"
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              pfccEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
            }`} />
          </button>
        </div>

        {/* Has Photos */}
        {hasPremiumData && setHasPhotosFilter && (
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Camera className="h-4 w-4" /> Has Photos
            </Label>
            <button
              type="button"
              onClick={() => setHasPhotosFilter(!hasPhotosFilter)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                hasPhotosFilter ? "bg-sky-500" : "bg-neutral-300"
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                hasPhotosFilter ? "translate-x-[18px]" : "translate-x-[3px]"
              }`} />
            </button>
          </div>
        )}

        {/* SUTQ Rating */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">SUTQ Rating</Label>
          <div className="space-y-1.5">
            {RATINGS.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <Checkbox
                  id={`mobile-rating-${r}`}
                  checked={selectedRatings.includes(r)}
                  onCheckedChange={() => toggleRating(r)}
                />
                <Label htmlFor={`mobile-rating-${r}`} className="text-sm font-normal cursor-pointer">
                  <SutqBadge rating={r} className="scale-90 origin-left" />
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="mobile-rating-0"
                checked={selectedRatings.includes("0")}
                onCheckedChange={() => toggleRating("0")}
              />
              <Label htmlFor="mobile-rating-0" className="text-sm font-normal cursor-pointer">Not Rated</Label>
            </div>
          </div>
        </div>

        {/* Program Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Type{selectedProgramTypes.length > 0 ? ` (${selectedProgramTypes.length})` : ""}
          </Label>
          <div className="space-y-1.5">
            {PROGRAM_TYPES.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Checkbox
                  id={`mobile-type-${t}`}
                  checked={selectedProgramTypes.includes(t)}
                  onCheckedChange={() => toggleProgramType(t)}
                />
                <Label htmlFor={`mobile-type-${t}`} className="text-sm font-normal cursor-pointer leading-tight">
                  {PROGRAM_TYPE_SHORT[t] || t}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Age Group */}
        {hasPremiumData && toggleAgeBracket && clearAgeBrackets && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Age Group{ageBrackets.length > 0 ? ` (${ageBrackets.length})` : ""}
            </Label>
            <div className="space-y-1.5">
              {AGE_BRACKETS.map((b) => (
                <div key={b.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`mobile-age-${b.value}`}
                    checked={ageBrackets.includes(b.value)}
                    onCheckedChange={() => toggleAgeBracket(b.value)}
                  />
                  <Label htmlFor={`mobile-age-${b.value}`} className="text-sm font-normal cursor-pointer leading-tight flex items-center justify-between flex-1">
                    <span>{b.label}</span>
                    <span className="text-xs text-neutral-400">{b.desc}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        {hasPremiumData && setMinWeeklyPrice && setMaxWeeklyPrice && setPricePeriod && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Price</Label>
            <PriceSlider
              minWeeklyPrice={minWeeklyPrice ?? null}
              onMinWeeklyPriceChange={setMinWeeklyPrice}
              maxWeeklyPrice={maxWeeklyPrice ?? null}
              onMaxWeeklyPriceChange={setMaxWeeklyPrice}
              pricePeriod={pricePeriod}
              onPricePeriodChange={setPricePeriod}
              ageBrackets={ageBrackets}
            />
          </div>
        )}

        {/* Schedule */}
        {hasPremiumData && toggleScheduleFilter && clearScheduleFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Schedule{scheduleFilters.length > 0 ? ` (${scheduleFilters.length})` : ""}
            </Label>
            <div className="space-y-1.5">
              {SCHEDULE_CODES.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`mobile-schedule-${opt.value}`}
                    checked={scheduleFilters.includes(opt.value)}
                    onCheckedChange={() => toggleScheduleFilter(opt.value)}
                  />
                  <Label htmlFor={`mobile-schedule-${opt.value}`} className="text-sm font-normal cursor-pointer leading-tight">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {hasPremiumData && toggleAmenityFilter && clearAmenityFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Amenities{amenityFilters.length > 0 ? ` (${amenityFilters.length})` : ""}
            </Label>
            <div className="space-y-2">
              {AMENITY_GROUPS.map((g) => {
                const isExpanded = expandedAmenityGroups.has(g.group);
                const groupSelectedCount = g.codes.filter((c) => amenityFilters.includes(c.value)).length;
                return (
                  <div key={g.group}>
                    <button
                      type="button"
                      onClick={() => toggleAmenityGroup(g.group)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-neutral-500 uppercase tracking-wider py-1.5"
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
                              id={`mobile-amenity-${opt.value}`}
                              checked={amenityFilters.includes(opt.value)}
                              onCheckedChange={() => toggleAmenityFilter(opt.value)}
                            />
                            <Label htmlFor={`mobile-amenity-${opt.value}`} className="text-sm font-normal cursor-pointer leading-tight">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* City */}
        {enableCityFilter && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">City</Label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={cityOpen} className="w-full justify-between text-sm">
                  {selectedCity ? prettyCity(selectedCity) : "All cities"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search city..." />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all_cities_reset" onSelect={() => { setSelectedCity(""); setCityOpen(false); }}>
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

        {/* County */}
        {counties && setSelectedCounty && selectedCounty !== undefined && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">County</Label>
            <Popover open={countyOpen} onOpenChange={setCountyOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={countyOpen} className="w-full justify-between text-sm">
                  {selectedCounty ? prettyCity(selectedCounty) : "All counties"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search county..." />
                  <CommandList>
                    <CommandEmpty>No county found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all_counties_reset" onSelect={() => { setSelectedCounty(""); setCountyOpen(false); }}>
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
      </div>

      {/* Footer — Done button */}
      <div className="border-t border-neutral-200 px-4 py-3" style={{ background: "#D5E5E3" }}>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ background: "#4A6B67" }}
        >
          Apply
        </button>
      </div>
    </div>
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
  nowHiringEnabled: boolean;
  setNowHiringEnabled: (v: boolean) => void;
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
  ageBrackets?: string[];
  toggleAgeBracket?: (v: string) => void;
  clearAgeBrackets?: () => void;
  minWeeklyPrice?: number | null;
  setMinWeeklyPrice?: (v: number | null) => void;
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
  nowHiringEnabled,
  setNowHiringEnabled,
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
  ageBrackets = [],
  toggleAgeBracket,
  clearAgeBrackets,
  minWeeklyPrice,
  setMinWeeklyPrice,
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const hasPremiumData = premiumSummaries && Object.keys(premiumSummaries).length > 0;
  const hasActiveFilters =
    pfccEnabled ||
    verifiedEnabled ||
    nowHiringEnabled ||
    selectedRatings.length > 0 ||
    selectedProgramTypes.length > 0 ||
    !!searchQuery ||
    !!selectedCity ||
    !!selectedCounty ||
    ageBrackets.length > 0 ||
    (minWeeklyPrice !== null && minWeeklyPrice !== undefined) ||
    (maxWeeklyPrice !== null && maxWeeklyPrice !== undefined) ||
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

  // Collect active filter labels for mobile summary badges
  const mobileBadges: string[] = [];
  if (verifiedEnabled) mobileBadges.push("Verified");
  if (nowHiringEnabled) mobileBadges.push("Now Hiring");
  if (pfccEnabled) mobileBadges.push("PFCC");
  if (hasPhotosFilter) mobileBadges.push("Photos");
  selectedRatings.forEach((r) => mobileBadges.push(r === "0" ? "Not Rated" : `${r}★`));
  selectedProgramTypes.forEach((t) => mobileBadges.push(PROGRAM_TYPE_SHORT[t] || t));
  ageBrackets.forEach((b) => {
    const found = AGE_BRACKETS.find((ab) => ab.value === b);
    if (found) mobileBadges.push(found.label);
  });
  if (minWeeklyPrice !== null && minWeeklyPrice !== undefined && maxWeeklyPrice !== null && maxWeeklyPrice !== undefined) {
    mobileBadges.push(`$${minWeeklyPrice}–$${maxWeeklyPrice}/wk`);
  } else if (minWeeklyPrice !== null && minWeeklyPrice !== undefined) {
    mobileBadges.push(`$${minWeeklyPrice}+/wk`);
  } else if (maxWeeklyPrice !== null && maxWeeklyPrice !== undefined) {
    mobileBadges.push(`≤$${maxWeeklyPrice}/wk`);
  }
  scheduleFilters.forEach((s) => {
    const found = SCHEDULE_CODES.find((sc) => sc.value === s);
    if (found) mobileBadges.push(found.label);
  });
  if (amenityFilters.length > 0) mobileBadges.push(`${amenityFilters.length} amenities`);
  if (selectedCity) mobileBadges.push(prettyCity(selectedCity));
  if (selectedCounty) mobileBadges.push(prettyCity(selectedCounty));

  // Count active filters (excluding search) for the mobile filter button badge
  const activeFilterCount =
    (pfccEnabled ? 1 : 0) +
    (verifiedEnabled ? 1 : 0) +
    (nowHiringEnabled ? 1 : 0) +
    selectedRatings.length +
    selectedProgramTypes.length +
    ageBrackets.length +
    ((minWeeklyPrice !== null && minWeeklyPrice !== undefined) || (maxWeeklyPrice !== null && maxWeeklyPrice !== undefined) ? 1 : 0) +
    scheduleFilters.length +
    amenityFilters.length +
    (hasPhotosFilter ? 1 : 0) +
    (selectedCity ? 1 : 0) +
    (selectedCounty ? 1 : 0);

  return (
    <div className="-mx-2 -mt-3 sm:-mx-6 sm:-mt-6 rounded-none sm:rounded-t-3xl px-3 py-2.5 sm:px-6 sm:py-3" style={{ background: "#D5E5E3" }}>
      {/* Search — full width above chips */}
      <div className="mb-2">
        <SearchChip value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* ── Mobile: filter icon + chips ── */}
      <div className="sm:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -my-1">
        {/* All Filters button */}
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className={`relative inline-flex items-center justify-center rounded-full border px-2.5 py-1.5 transition-colors flex-shrink-0 ${
            activeFilterCount > 0
              ? "border-neutral-400 bg-neutral-100 text-neutral-800"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-[#4A6B67] text-[10px] font-bold text-white px-1">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Now Hiring */}
        <ToggleChip
          active={nowHiringEnabled}
          onToggle={() => setNowHiringEnabled(!nowHiringEnabled)}
          label="Now Hiring"
          activeClassName="border-[#DCB346] bg-[#DCB346] text-white"
          inactiveClassName="border-[#DCB346]/50 bg-white text-[#4A6B67] hover:border-[#DCB346]/80"
        >
          <BriefcaseBusiness className="h-4 w-4 flex-shrink-0" />
          <span>Now Hiring</span>
        </ToggleChip>

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

        {/* Premium Filter Chips */}
        {hasPremiumData && toggleAgeBracket && clearAgeBrackets && (
          <AgeGroupChip selected={ageBrackets} onToggle={toggleAgeBracket} onClear={clearAgeBrackets} />
        )}
        {hasPremiumData && setMinWeeklyPrice && setMaxWeeklyPrice && setPricePeriod && (
          <PriceChip
            minWeeklyPrice={minWeeklyPrice ?? null}
            onMinWeeklyPriceChange={setMinWeeklyPrice}
            maxWeeklyPrice={maxWeeklyPrice ?? null}
            onMaxWeeklyPriceChange={setMaxWeeklyPrice}
            pricePeriod={pricePeriod}
            onPricePeriodChange={setPricePeriod}
            ageBrackets={ageBrackets}
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
        {hasPremiumData && toggleScheduleFilter && clearScheduleFilters && (
          <ScheduleChip
            selected={scheduleFilters}
            onToggle={toggleScheduleFilter}
            onClear={clearScheduleFilters}
          />
        )}
      </div>
      {/* Clear all link below chips — mobile only */}
      {hasActiveFilters && (
        <div className="sm:hidden pt-1.5">
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-neutral-500 underline hover:text-neutral-800"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
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
        enableCityFilter={enableCityFilter ?? true}
        onClearAll={onClearAll}
        hasActiveFilters={hasActiveFilters}
        hasPremiumData={!!hasPremiumData}
        ageBrackets={ageBrackets}
        toggleAgeBracket={toggleAgeBracket}
        clearAgeBrackets={clearAgeBrackets}
        minWeeklyPrice={minWeeklyPrice}
        setMinWeeklyPrice={setMinWeeklyPrice}
        maxWeeklyPrice={maxWeeklyPrice}
        setMaxWeeklyPrice={setMaxWeeklyPrice}
        pricePeriod={pricePeriod}
        setPricePeriod={setPricePeriod}
        scheduleFilters={scheduleFilters}
        toggleScheduleFilter={toggleScheduleFilter}
        clearScheduleFilters={clearScheduleFilters}
        amenityFilters={amenityFilters}
        toggleAmenityFilter={toggleAmenityFilter}
        clearAmenityFilters={clearAmenityFilters}
        hasPhotosFilter={hasPhotosFilter}
        setHasPhotosFilter={setHasPhotosFilter}
      />

      {/* ── Desktop: horizontal chip row ── */}
      <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -my-1">

      {/* Owner Verified */}
      <ToggleChip
        active={nowHiringEnabled}
        onToggle={() => setNowHiringEnabled(!nowHiringEnabled)}
        label="Now Hiring"
        activeClassName="border-[#DCB346] bg-[#DCB346] text-white"
        inactiveClassName="border-[#DCB346]/50 bg-white text-[#4A6B67] hover:border-[#DCB346]/80"
      >
        <BriefcaseBusiness className="h-4 w-4 flex-shrink-0" />
        <span>Now Hiring</span>
      </ToggleChip>

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

      {/* ── Premium Filter Chips (only render when premium data exists) ── */}
      {hasPremiumData && toggleAgeBracket && clearAgeBrackets && (
        <AgeGroupChip selected={ageBrackets} onToggle={toggleAgeBracket} onClear={clearAgeBrackets} />
      )}
      {hasPremiumData && setMinWeeklyPrice && setMaxWeeklyPrice && setPricePeriod && (
        <PriceChip
          minWeeklyPrice={minWeeklyPrice ?? null}
          onMinWeeklyPriceChange={setMinWeeklyPrice}
          maxWeeklyPrice={maxWeeklyPrice ?? null}
          onMaxWeeklyPriceChange={setMaxWeeklyPrice}
          pricePeriod={pricePeriod}
          onPricePeriodChange={setPricePeriod}
          ageBrackets={ageBrackets}
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
      {hasPremiumData && toggleScheduleFilter && clearScheduleFilters && (
        <ScheduleChip
          selected={scheduleFilters}
          onToggle={toggleScheduleFilter}
          onClear={clearScheduleFilters}
        />
      )}

      {/* More Filters — end position on desktop */}
      <MoreFiltersChip
        pfccEnabled={pfccEnabled}
        setPfccEnabled={setPfccEnabled}
        selectedProgramTypes={selectedProgramTypes}
        toggleProgramType={toggleProgramType}
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

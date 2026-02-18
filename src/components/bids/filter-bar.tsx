"use client";

import { Calendar, Filter, MapPin, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

interface FilterBarProps {
  categories: Category[];
}

export function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentSubCategory = searchParams.get("subCategory");
  const currentLocation = searchParams.get("location");
  const currentStartDate = searchParams.get("startDate");
  const currentEndDate = searchParams.get("endDate");
  const currentSearch = searchParams.get("search");

  // Local state for all filters
  const [category, setCategory] = useState(currentCategory || "All Categories");
  const [subCategory, setSubCategory] = useState(currentSubCategory || "");
  const [location, setLocation] = useState(currentLocation || "");
  const [startDate, setStartDate] = useState(currentStartDate || "");
  const [endDate, setEndDate] = useState(currentEndDate || "");
  const [search, setSearch] = useState(currentSearch || "");
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  // Sync local state with URL params on mount or URL change (e.g. back button)
  useEffect(() => {
    setCategory(currentCategory || "All Categories");
    setSubCategory(currentSubCategory || "");
    setLocation(currentLocation || "");
    setStartDate(currentStartDate || "");
    setEndDate(currentEndDate || "");
    setSearch(currentSearch || "");
  }, [
    currentCategory,
    currentSubCategory,
    currentLocation,
    currentStartDate,
    currentEndDate,
    currentSearch,
  ]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (category && category !== "All Categories") {
      params.set("category", category);
    }
    if (subCategory && subCategory !== "all") {
      params.set("subCategory", subCategory);
    }
    if (location) {
      params.set("location", location);
    }
    if (startDate) {
      params.set("startDate", startDate);
    }
    if (endDate) {
      params.set("endDate", endDate);
    }
    if (search) {
      params.set("search", search);
    }

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setCategory("All Categories");
    setSubCategory("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    router.push("?");
  };

  const selectedCategoryData = categories.find((c) => c.name === category);

  const activeFiltersCount = [
    currentCategory,
    currentSubCategory,
    currentLocation,
    currentStartDate,
    currentEndDate,
    currentSearch,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Category Filter */}
        <Select
          value={category}
          onValueChange={(val) => {
            setCategory(val);
            setSubCategory("");
          }}
        >
          <SelectTrigger className="w-[180px] h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest border-border/50 bg-background shadow-sm hover:bg-muted/50 transition-all">
            <div className="flex items-center gap-2 truncate">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Categories">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sub Category Filter (only if category selected) */}
        {selectedCategoryData &&
          selectedCategoryData.subCategories.length > 0 && (
            <Select
              value={subCategory || "all"}
              onValueChange={(val) => setSubCategory(val === "all" ? "" : val)}
            >
              <SelectTrigger className="w-[180px] h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest border-border/50 bg-background shadow-sm hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-muted-foreground">Sub:</span>
                  <SelectValue placeholder="All" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-categories</SelectItem>
                {selectedCategoryData.subCategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.name}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

        {/* Location Filter */}
        <div className="relative w-full max-w-[200px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter by location..."
            className="h-10 pl-9 rounded-xl border-border/50 bg-background shadow-sm text-[11px] font-medium"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (startDateRef.current) {
                  startDateRef.current?.focus();
                  startDateRef.current.showPicker();
                }
              }}
              className={cn(
                "flex bg-background items-center h-10 group rounded-xl border border-border/50 shadow-sm transition-all overflow-hidden  relative",
                startDate
                  ? "border-primary/20 bg-primary/5"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="pl-3 text-muted-foreground pointer-events-none">
                <Calendar
                  className={cn("h-3.5 w-3.5", startDate && "text-primary")}
                />
              </div>
              <input
                ref={startDateRef}
                type="date"
                placeholder="From"
                className={cn(
                  "w-full h-full bg-transparent border-none px-2 text-[10px] font-bold uppercase tracking-widest focus:ring-0 focus:outline-none text-muted-foreground cursor-pointer",
                  startDate && "text-primary",
                )}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </button>
          </div>
          <span className="text-muted-foreground text-[10px] font-bold uppercase">
            To
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (endDateRef.current) {
                  endDateRef.current?.focus();
                  endDateRef.current.showPicker();
                }
              }}
              className={cn(
                "flex items-center h-10 rounded-xl border border-border/50 shadow-sm transition-all overflow-hidden bg-background relative",
                endDate
                  ? "border-primary/20 bg-primary/5"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="pl-3 text-muted-foreground pointer-events-none">
                <Calendar
                  className={cn("h-3.5 w-3.5", endDate && "text-primary")}
                />
              </div>
              <input
                ref={endDateRef}
                type="date"
                placeholder="To"
                className={cn(
                  "w-full h-full bg-transparent border-none px-2 text-[10px] font-bold uppercase tracking-widest focus:ring-0 focus:outline-none text-muted-foreground cursor-pointer",
                  endDate && "text-primary",
                )}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-[200px] flex justify-end ml-auto gap-2">
          <Button
            onClick={handleSearch}
            className="h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm"
          >
            Search
          </Button>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-10 px-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Clear
            </span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentCategory && (
            <Badge
              variant="secondary"
              className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-secondary/80"
            >
              Category: {currentCategory}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={() => {
                  setCategory("All Categories");
                  setSubCategory("");
                  // Need to trigger update immediately for clear actions or let user click search?
                  // User expects 'Clear' button to clear everything, but individual badges?
                  // Let's make individual badges update state AND trigger search for better UX, or just update state?
                  // The prompt implies manual search. Let's make them update state and maybe user has to click search?
                  // No, usually 'X' on a filter badge implies immediate removal.
                  // But to be consistent with "manual trigger", maybe just update state?
                  // Or better: update state and auto-trigger search for REMOVAL only?
                  // Let's stick to: Update state, user must click Search.
                  // BUT that feels broken. "I clicked X and nothing happened".
                  // Let's make badge removal immediate.

                  // Actually, let's make badge removal trigger a new search with that item removed.
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("category");
                  params.delete("subCategory");
                  router.push(`?${params.toString()}`);
                }}
              />
            </Badge>
          )}
          {currentSubCategory && (
            <Badge
              variant="secondary"
              className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-secondary/80"
            >
              Sub: {currentSubCategory}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={() => {
                  setSubCategory("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("subCategory");
                  router.push(`?${params.toString()}`);
                }}
              />
            </Badge>
          )}
          {currentLocation && (
            <Badge
              variant="secondary"
              className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-secondary/80"
            >
              Location: {currentLocation}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={() => {
                  setLocation("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("location");
                  router.push(`?${params.toString()}`);
                }}
              />
            </Badge>
          )}
          {currentStartDate && (
            <Badge
              variant="secondary"
              className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-secondary/80"
            >
              From: {currentStartDate}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={() => {
                  setStartDate("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("startDate");
                  router.push(`?${params.toString()}`);
                }}
              />
            </Badge>
          )}
          {currentEndDate && (
            <Badge
              variant="secondary"
              className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-secondary/80"
            >
              To: {currentEndDate}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={() => {
                  setEndDate("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("endDate");
                  router.push(`?${params.toString()}`);
                }}
              />
            </Badge>
          )}
          {currentSearch && (
            <Badge
              variant="secondary"
              className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-secondary/80"
            >
              Search: {currentSearch}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={() => {
                  setSearch("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("search");
                  router.push(`?${params.toString()}`);
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

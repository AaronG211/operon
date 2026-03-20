"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";

/**
 * Cuisine categories based on Google Maps / Google Places restaurant type taxonomy.
 * Covers all major categories used in Google's restaurant classification system.
 */
export const CUISINE_TYPES = [
  // Asian
  "Chinese",
  "Japanese",
  "Korean",
  "Thai",
  "Vietnamese",
  "Indian",
  "Filipino",
  "Malaysian",
  "Indonesian",
  "Taiwanese",
  "Singaporean",
  "Burmese",
  "Cambodian",
  "Laotian",
  "Mongolian",
  "Asian Fusion",

  // East Asian specialty
  "Sushi",
  "Ramen",
  "Dim Sum",
  "Hot Pot",
  "Teppanyaki",
  "Izakaya",
  "Pho",
  "Bibimbap",

  // South Asian
  "Pakistani",
  "Bangladeshi",
  "Sri Lankan",
  "Nepalese",
  "Afghan",

  // Middle Eastern & Central Asian
  "Middle Eastern",
  "Lebanese",
  "Turkish",
  "Persian",
  "Israeli",
  "Moroccan",
  "Egyptian",

  // European
  "Italian",
  "French",
  "Spanish",
  "Greek",
  "German",
  "British",
  "Irish",
  "Portuguese",
  "Swiss",
  "Belgian",
  "Dutch",
  "Scandinavian",
  "Polish",
  "Russian",
  "Hungarian",
  "Austrian",
  "Czech",

  // Italian specialty
  "Pizza",
  "Pasta",

  // Americas
  "American",
  "Mexican",
  "Brazilian",
  "Peruvian",
  "Argentine",
  "Colombian",
  "Cuban",
  "Puerto Rican",
  "Cajun / Creole",
  "Tex-Mex",
  "Hawaiian",
  "Canadian",
  "Jamaican",
  "Caribbean",
  "Latin American",

  // American specialty
  "BBQ",
  "Burger",
  "Southern",
  "Soul Food",
  "New American",

  // African
  "Ethiopian",
  "Nigerian",
  "South African",
  "Ghanaian",
  "Senegalese",
  "Somali",
  "North African",
  "West African",
  "East African",

  // Oceanian
  "Australian",
  "New Zealand",
  "Pacific Islander",

  // Dietary / Style
  "Seafood",
  "Steakhouse",
  "Vegetarian",
  "Vegan",
  "Raw / Living Food",
  "Organic",
  "Farm-to-Table",
  "Gluten-Free Friendly",

  // Format / Concept
  "Fast Food",
  "Fast Casual",
  "Fine Dining",
  "Buffet",
  "Food Truck",
  "Café",
  "Bakery",
  "Deli",
  "Diner",
  "Bistro",
  "Brasserie",
  "Gastropub",
  "Wine Bar",
  "Tapas",
  "Brunch",
  "Breakfast",
  "Dessert",
  "Ice Cream",
  "Juice / Smoothie Bar",
  "Tea House",
  "Coffee Shop",
  "Noodle Bar",
  "Sandwich Shop",
  "Salad Bar",
  "Poke",
  "Açaí",

  // Fusion / Other
  "Fusion",
  "Mediterranean",
  "Pan-Asian",
  "International",
  "Contemporary",
  "Comfort Food",
  "Health Food",
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];

interface CuisineSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CuisineSelect({ value, onChange }: CuisineSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return [...CUISINE_TYPES];
    const q = search.toLowerCase();
    return CUISINE_TYPES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (cuisine: string) => {
    onChange(cuisine);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "hover:bg-accent/50 transition-colors",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {value || "Select cuisine type..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cuisine..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <div
            ref={listRef}
            className="max-h-[240px] overflow-y-auto p-1"
          >
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No cuisine found.
              </div>
            ) : (
              filtered.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => handleSelect(cuisine)}
                  className={cn(
                    "relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    value === cuisine && "bg-accent/50"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === cuisine ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cuisine}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (location: string, lat: number, lng: number) => void;
  placeholder?: string;
  id?: string;
}

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

interface PlacesAutocompletePrediction {
  placePrediction?: {
    placeId?: string;
    place?: string;
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
    text?: { text?: string };
  };
}

interface PlacesAutocompleteResponse {
  suggestions?: PlacesAutocompletePrediction[];
}

interface PlaceLocationResponse {
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Google Places API (New) — Autocomplete REST endpoint
async function fetchSuggestionsFromAPI(
  input: string,
  apiKey: string
): Promise<Suggestion[]> {
  const res = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ["restaurant", "food", "geocode"],
      }),
    }
  );

  if (!res.ok) return [];

  const data = (await res.json()) as PlacesAutocompleteResponse;
  const suggestions: Suggestion[] = (data.suggestions ?? [])
    .filter((suggestion) => suggestion.placePrediction)
    .map((suggestion) => {
      const p = suggestion.placePrediction!;
      return {
        placeId: p.placeId || p.place || "",
        mainText: p.structuredFormat?.mainText?.text || p.text?.text || "",
        secondaryText: p.structuredFormat?.secondaryText?.text || "",
        fullText: p.text?.text || "",
      };
    });

  return suggestions;
}

// Fetch lat/lng from Place Details
async function fetchPlaceLocation(
  placeId: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // placeId from autocomplete may be in "places/XXXXX" format or just the ID
    const id = placeId.startsWith("places/")
      ? placeId.replace("places/", "")
      : placeId;
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${id}?fields=location&key=${apiKey}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as PlaceLocationResponse;
    if (data.location) {
      return { lat: data.location.latitude, lng: data.location.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search restaurant name or address...",
  id,
}: PlacesAutocompleteProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced fetch
  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!apiKey || !input.trim() || input.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setFetching(true);
      fetchSuggestionsFromAPI(input, apiKey)
        .then((items) => {
          setSuggestions(items);
          setShowDropdown(items.length > 0);
          setHighlightIdx(-1);
        })
        .catch(() => {
          setSuggestions([]);
          setShowDropdown(false);
        })
        .finally(() => setFetching(false));
    },
    [apiKey]
  );

  const handleInputChange = useCallback(
    (val: string) => {
      onChange(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    },
    [onChange, fetchSuggestions]
  );

  const handleSelect = useCallback(
    async (suggestion: Suggestion) => {
      onChange(suggestion.fullText);
      setSuggestions([]);
      setShowDropdown(false);

      // Fetch lat/lng for the selected place
      if (onPlaceSelect && apiKey && suggestion.placeId) {
        const location = await fetchPlaceLocation(suggestion.placeId, apiKey);
        if (location) {
          onPlaceSelect(suggestion.fullText, location.lat, location.lng);
        }
      }
    },
    [onChange, onPlaceSelect, apiKey]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && highlightIdx >= 0) {
        e.preventDefault();
        handleSelect(suggestions[highlightIdx]);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    },
    [showDropdown, suggestions, highlightIdx, handleSelect]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // No API key — plain input fallback
  if (!apiKey) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Downtown Seattle, WA"
          className="pl-9"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      {fetching && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin pointer-events-none z-10" />
      )}
      <Input
        id={id}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-9"
        autoComplete="off"
      />

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId + i}
              type="button"
              className={cn(
                "flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                i === highlightIdx
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onMouseEnter={() => setHighlightIdx(i)}
              onClick={() => handleSelect(s)}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium truncate">{s.mainText}</p>
                {s.secondaryText && (
                  <p className="text-xs text-muted-foreground truncate">
                    {s.secondaryText}
                  </p>
                )}
              </div>
            </button>
          ))}
          <div className="border-t px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground/60 text-right">
              Powered by Google
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

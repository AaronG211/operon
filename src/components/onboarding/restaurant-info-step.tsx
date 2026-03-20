"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlacesAutocomplete } from "@/components/shared/places-autocomplete";
import {
  WeeklyHoursPicker,
  parseHoursToSchedule,
  scheduleToString,
} from "@/components/shared/weekly-hours-picker";
import type { WeeklySchedule } from "@/components/shared/weekly-hours-picker";
import { CuisineSelect } from "@/components/shared/cuisine-select";

interface RestaurantInfo {
  name: string;
  cuisine_type: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  service_model: string; // comma-separated: "dine_in,takeout,delivery"
  seats: number | null;
  hours: string;
}

const SERVICE_OPTIONS = [
  { value: "dine_in", label: "Dine-in" },
  { value: "takeout", label: "Takeout" },
  { value: "delivery", label: "Delivery" },
] as const;

interface Props {
  data: RestaurantInfo;
  onChange: (data: RestaurantInfo) => void;
}

export function RestaurantInfoStep({ data, onChange }: Props) {
  const update = (field: keyof RestaurantInfo, value: string | number | null) => {
    onChange({ ...data, [field]: value });
  };

  const weeklySchedule = useMemo(
    () => parseHoursToSchedule(data.hours),
    [data.hours]
  );

  const handleScheduleChange = (schedule: WeeklySchedule) => {
    onChange({ ...data, hours: scheduleToString(schedule) });
  };

  const handlePlaceSelect = (location: string, lat: number, lng: number) => {
    onChange({ ...data, location, latitude: lat, longitude: lng });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tell us about your restaurant</h2>
        <p className="text-muted-foreground">
          Basic information helps the AI tailor its analysis.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Restaurant Name *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Golden Dragon"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cuisine">Cuisine Type</Label>
          <CuisineSelect
            value={data.cuisine_type}
            onChange={(val) => update("cuisine_type", val)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location">Location</Label>
          <PlacesAutocomplete
            id="location"
            value={data.location}
            onChange={(val) => update("location", val)}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search restaurant name or address..."
          />
        </div>
        <div className="space-y-2">
          <Label>Service Model *</Label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((opt) => {
              const selected = data.service_model.split(",").filter(Boolean);
              const isActive = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const next = isActive
                      ? selected.filter((s) => s !== opt.value)
                      : [...selected, opt.value];
                    update("service_model", next.join(","));
                  }}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {data.service_model === "" && (
            <p className="text-xs text-muted-foreground">Select at least one</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="seats">Number of Seats</Label>
          <Input
            id="seats"
            type="number"
            value={data.seats ?? ""}
            onChange={(e) =>
              update("seats", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="e.g. 60"
          />
        </div>
      </div>

      {/* Weekly Hours Picker */}
      <div className="space-y-2">
        <Label>Opening Hours</Label>
        <WeeklyHoursPicker
          value={weeklySchedule}
          onChange={handleScheduleChange}
        />
      </div>
    </div>
  );
}

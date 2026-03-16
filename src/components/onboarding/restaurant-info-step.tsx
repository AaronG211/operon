"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RestaurantInfo {
  name: string;
  cuisine_type: string;
  location: string;
  service_model: "dine_in" | "takeout" | "delivery" | "hybrid";
  seats: number | null;
  hours: string;
}

interface Props {
  data: RestaurantInfo;
  onChange: (data: RestaurantInfo) => void;
}

export function RestaurantInfoStep({ data, onChange }: Props) {
  const update = (field: keyof RestaurantInfo, value: string | number | null) => {
    onChange({ ...data, [field]: value });
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
          <Input
            id="cuisine"
            value={data.cuisine_type}
            onChange={(e) => update("cuisine_type", e.target.value)}
            placeholder="e.g. Asian Fusion, Italian, Mexican"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Downtown Seattle, WA"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service_model">Service Model *</Label>
          <Select
            value={data.service_model}
            onValueChange={(v) => v && update("service_model", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dine_in">Dine-in</SelectItem>
              <SelectItem value="takeout">Takeout</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="space-y-2">
          <Label htmlFor="hours">Opening Hours</Label>
          <Input
            id="hours"
            value={data.hours}
            onChange={(e) => update("hours", e.target.value)}
            placeholder="e.g. Mon-Sat 11am-10pm"
          />
        </div>
      </div>
    </div>
  );
}

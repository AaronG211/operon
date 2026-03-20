"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  GraduationCap,
  ShoppingBag,
  Train,
  Home,
  Clapperboard,
  Heart,
  Clock,
  MapPin,
  Lightbulb,
} from "lucide-react";
import type { TargetCustomerAnalysis } from "@/types";

interface Props {
  data: TargetCustomerAnalysis;
}

const facilityIcons: Record<string, React.ElementType> = {
  office: Building2,
  school: GraduationCap,
  shopping: ShoppingBag,
  transit: Train,
  residential: Home,
  entertainment: Clapperboard,
  medical: Heart,
};

export function TargetCustomerCard({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Target Customers
        </CardTitle>
        <CardDescription>{data.customer_profile}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demographics */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium">Demographics</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.demographics.primary_segments.map((seg, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {seg}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              Income: {data.demographics.income_level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {data.demographics.analysis}
          </p>
        </div>

        {/* Foot Traffic */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Foot Traffic
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {data.foot_traffic.peak_times.map((time, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400"
              >
                {time}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.foot_traffic.patterns}
          </p>
          {data.foot_traffic.nearby_drivers.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-0.5 ml-3 list-disc">
              {data.foot_traffic.nearby_drivers.slice(0, 4).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Nearby Facilities */}
        {data.nearby_facilities.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Key Nearby Facilities
            </h4>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {data.nearby_facilities.slice(0, 8).map((f, i) => {
                const Icon = facilityIcons[f.type] || Building2;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded border p-2"
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {f.estimated_impact}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Underserved Needs */}
        {data.underserved_needs.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-sm font-medium flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" />
              Underserved Needs
            </h4>
            <div className="flex flex-wrap gap-1">
              {data.underserved_needs.map((need, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400"
                >
                  {need}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

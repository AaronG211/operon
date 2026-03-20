"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CompetitorAnalysis } from "@/types";

interface Props {
  data: CompetitorAnalysis;
}

const pricingBadge = {
  below_market: {
    label: "Below Market",
    variant: "secondary" as const,
    icon: TrendingDown,
  },
  at_market: {
    label: "At Market",
    variant: "outline" as const,
    icon: Minus,
  },
  above_market: {
    label: "Above Market",
    variant: "destructive" as const,
    icon: TrendingUp,
  },
};

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-muted-foreground">N/A</span>;
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export function CompetitionCard({ data }: Props) {
  const pricing = pricingBadge[data.pricing_position];
  const PricingIcon = pricing.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-blue-600" />
          Competition Analysis
        </CardTitle>
        <CardDescription>{data.landscape_summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing Position */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Your Pricing:</span>
          <Badge variant={pricing.variant} className="gap-1">
            <PricingIcon className="h-3 w-3" />
            {pricing.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{data.pricing_analysis}</p>

        {/* Top Competitors */}
        {data.competitors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Nearby Competitors</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.competitors.slice(0, 6).map((comp, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border p-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {comp.name}
                      </p>
                      <RatingStars rating={comp.rating} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {comp.cuisine} • {comp.price_range}
                      {comp.distance && ` • ${comp.distance}`}
                    </p>
                    {comp.strengths.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Strength: {comp.strengths[0]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advantages & Gaps */}
        <div className="space-y-3">
          {data.competitive_advantages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1.5 text-green-700 dark:text-green-400">
                Your Advantages
              </h4>
              <div className="flex flex-wrap gap-1">
                {data.competitive_advantages.map((adv, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
                  >
                    {adv}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {data.differentiation_gaps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1.5 text-amber-700 dark:text-amber-400">
                Differentiation Gaps
              </h4>
              <div className="flex flex-wrap gap-1">
                {data.differentiation_gaps.map((gap, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400"
                  >
                    {gap}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

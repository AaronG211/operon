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
  Truck,
  Package,
  Lightbulb,
  ExternalLink,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";
import type { SupplyRecommendation } from "@/types";

interface Props {
  data: SupplyRecommendation;
}

const pricingColor: Record<string, string> = {
  Budget:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400",
  Competitive:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400",
  Premium:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400",
};

export function SupplyCard({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-emerald-600" />
          Local Supply Recommendations
        </CardTitle>
        <CardDescription>{data.sourcing_strategy}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ingredient Categories */}
        {data.ingredient_categories.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-sm font-medium">
              <Package className="h-3.5 w-3.5" />
              Ingredient Needs
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {data.ingredient_categories.map((cat, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="gap-1 text-xs"
                  title={`${cat.key_items.join(", ")} — ${cat.estimated_weekly_volume}/week`}
                >
                  {cat.category}
                  <span className="text-muted-foreground">
                    ({cat.estimated_weekly_volume})
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Suppliers */}
        {data.recommended_suppliers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommended Suppliers</h4>
            <div className="space-y-2">
              {data.recommended_suppliers.map((supplier, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {supplier.website_or_contact &&
                      supplier.website_or_contact !== "N/A" ? (
                        <a
                          href={
                            supplier.website_or_contact.startsWith("http")
                              ? supplier.website_or_contact
                              : `https://${supplier.website_or_contact}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 truncate text-sm font-medium text-primary hover:underline"
                        >
                          {supplier.name}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <p className="truncate text-sm font-medium">
                          {supplier.name}
                        </p>
                      )}
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] ${pricingColor[supplier.estimated_pricing ?? ""] || ""}`}
                      >
                        {supplier.estimated_pricing ?? "Unknown"}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{supplier.type}</span>
                      {supplier.distance && (
                        <>
                          <span>&middot;</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {supplier.distance}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {supplier.why_recommended}
                    </p>
                    {supplier.specialties.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {supplier.specialties.slice(0, 3).map((s, j) => (
                          <Badge
                            key={j}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {supplier.menu_items_served &&
                      supplier.menu_items_served.length > 0 && (
                        <div className="mt-1.5">
                          <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <UtensilsCrossed className="h-2.5 w-2.5" />
                            Supports menu items:
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {supplier.menu_items_served.map((item, j) => (
                              <Badge
                                key={j}
                                variant="outline"
                                className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Saving Tips */}
        {data.cost_saving_tips.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" />
              Cost Saving Tips
            </h4>
            <ul className="space-y-1">
              {data.cost_saving_tips.map((tip, i) => (
                <li
                  key={i}
                  className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

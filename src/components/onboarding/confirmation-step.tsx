"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle } from "lucide-react";
import type { OnboardingData } from "@/types";

interface Props {
  data: OnboardingData;
}

export function ConfirmationStep({ data }: Props) {
  const metricsCount = data.metrics.filter((m) => m.period_start).length;
  const menuCount = data.menuItems.filter((m) => m.item_name).length;
  const reviewCount = data.reviews.filter((r) => r.review_text).length;

  const items = [
    {
      label: "Restaurant",
      value: data.restaurant.name || "Not entered",
      ok: !!data.restaurant.name,
    },
    {
      label: "Business Metrics",
      value: `${metricsCount} period(s)`,
      ok: metricsCount > 0,
    },
    {
      label: "Menu Items",
      value: `${menuCount} item(s)`,
      ok: menuCount > 0,
    },
    {
      label: "Reviews",
      value: `${reviewCount} review(s)`,
      ok: reviewCount > 0,
    },
  ];

  const canProceed = items[0].ok && (items[1].ok || items[2].ok);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Your Data</h2>
        <p className="text-muted-foreground">
          Confirm what you&apos;ve entered before generating your AI analysis.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {item.label}
                </CardTitle>
                {item.ok ? (
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" /> Ready
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <AlertTriangle className="h-3 w-3" /> Missing
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!canProceed && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Please enter at least your restaurant name and some business metrics
            or menu data to generate an analysis.
          </p>
        </div>
      )}

      {canProceed && (
        <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
          <p className="text-sm">
            Your data is ready! Click &quot;Generate Analysis&quot; to get your
            AI-powered health check and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

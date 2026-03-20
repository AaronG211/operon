"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle } from "lucide-react";
import type { OnboardingData } from "@/types";
import { getOnboardingAssessment } from "@/lib/restaurant-insights";

interface Props {
  data: OnboardingData;
}

export function ConfirmationStep({ data }: Props) {
  const assessment = getOnboardingAssessment(data);

  const items = [
    {
      label: "Restaurant",
      value: data.restaurant.name || "Not entered",
      ok: assessment.hasRequiredBasics,
    },
    {
      label: "Menu Items",
      value: `${assessment.validMenuItems} priced item(s)`,
      ok: assessment.validMenuItems > 0,
    },
    {
      label: "Cost and Revenue",
      value: `${assessment.validMetrics} valid period(s)`,
      ok: assessment.validMetrics > 0,
    },
    {
      label: "Reviews",
      value: `${assessment.validReviews} review(s)`,
      ok: assessment.validReviews > 0,
    },
  ];

  const canProceed = assessment.canGenerate;

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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Readiness Score</CardTitle>
              <p className="text-sm text-muted-foreground">
                {assessment.confidenceSummary}
              </p>
            </div>
            <Badge variant={canProceed ? "default" : "secondary"}>
              {assessment.confidenceLabel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={assessment.coveragePercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Coverage {assessment.coveragePercent}% based on restaurant basics,
            metrics, menu, and reviews.
          </p>
        </CardContent>
      </Card>

      {!canProceed && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="space-y-2">
            <p className="text-sm text-destructive">
              Finish the minimum path before generating analysis.
            </p>
            <ul className="list-disc pl-5 text-sm text-destructive">
              {assessment.missingRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {canProceed && (
        <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 space-y-2">
          <p className="text-sm">
            Your data clears the minimum bar. You can generate analysis now.
          </p>
          {assessment.suggestedNextSteps.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {assessment.suggestedNextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

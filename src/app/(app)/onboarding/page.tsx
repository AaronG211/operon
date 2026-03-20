"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { RestaurantInfoStep } from "@/components/onboarding/restaurant-info-step";
import { CostRevenueStep } from "@/components/onboarding/cost-revenue-step";
import { MenuStep } from "@/components/onboarding/menu-step";
import { ReviewsStep } from "@/components/onboarding/reviews-step";
import { ConfirmationStep } from "@/components/onboarding/confirmation-step";
import type { OnboardingData } from "@/types";
import type { MenuItemInput, ReviewInput } from "@/lib/validators/schemas";
import { Loader2, Wand2 } from "lucide-react";
import { getOnboardingAssessment } from "@/lib/restaurant-insights";
import {
  demoRestaurant,
  demoMenuItems,
  getDemoMetricEntries,
  entriesToMetrics,
  getDemoReviews,
} from "@/lib/demo-data";

const initialData: OnboardingData = {
  restaurant: {
    name: "",
    cuisine_type: "",
    location: "",
    latitude: null,
    longitude: null,
    service_model: "",
    seats: null,
    hours: "",
  },
  metrics: [],
  metricEntries: [],
  menuItems: [
    {
      item_name: "",
      category: "",
      price: 0,
      estimated_cost: null,
      quantity_sold: null,
    },
  ],
  reviews: [],
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { refresh, switchRestaurant } = useRestaurant();
  const assessment = getOnboardingAssessment(data);

  const handleDemoFill = () => {
    switch (step) {
      case 0:
        setData({ ...data, restaurant: demoRestaurant });
        break;
      case 1:
        setData({ ...data, menuItems: demoMenuItems });
        break;
      case 2: {
        const entries = getDemoMetricEntries();
        setData({
          ...data,
          metricEntries: entries,
          metrics: entriesToMetrics(entries),
        });
        break;
      }
      case 3:
        setData({ ...data, reviews: getDemoReviews() });
        break;
    }
  };

  const canProceedFromStep = (s: number) => {
    switch (s) {
      case 0:
        return assessment.hasRequiredBasics;
      case 1:
      case 2:
      case 3:
        return true; // optional steps
      case 4: {
        return assessment.canGenerate;
      }
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert restaurant
      const { data: restaurant, error: restErr } = await supabase
        .from("restaurants")
        .insert({
          owner_id: user.id,
          name: data.restaurant.name,
          cuisine_type: data.restaurant.cuisine_type || null,
          location: data.restaurant.location || null,
          latitude: data.restaurant.latitude,
          longitude: data.restaurant.longitude,
          service_model: (() => {
            const parts = data.restaurant.service_model.split(",").filter(Boolean);
            if (parts.length >= 3) return "hybrid";
            return parts[0] || "dine_in";
          })(),
          seats: data.restaurant.seats,
          hours: data.restaurant.hours || null,
        })
        .select()
        .single();
      if (restErr) throw restErr;

      const restaurantId = restaurant.id;

      // Insert metrics
      const validMetrics = data.metrics.filter((m) => m.period_start && m.period_end);
      if (validMetrics.length > 0) {
        const { error: metricsErr } = await supabase
          .from("business_metrics")
          .insert(
            validMetrics.map((m) => ({ ...m, restaurant_id: restaurantId }))
          );
        if (metricsErr) throw metricsErr;
      }

      // Insert menu items and get back IDs for daily_sales
      const validMenu = data.menuItems.filter((m) => m.item_name && m.price > 0);
      let insertedMenuItems: { id: string; item_name: string; price: number }[] = [];
      if (validMenu.length > 0) {
        const { data: menuData, error: menuErr } = await supabase
          .from("menu_items")
          .insert(
            validMenu.map((m) => ({
              ...m,
              category: m.category || null,
              restaurant_id: restaurantId,
            }))
          )
          .select("id, item_name, price");
        if (menuErr) throw menuErr;
        insertedMenuItems = (menuData ?? []) as { id: string; item_name: string; price: number }[];
      }

      // Insert daily_sales from metricEntries (cost & revenue calendar data)
      if (data.metricEntries.length > 0 && insertedMenuItems.length > 0) {
        const nameToItem = new Map(
          insertedMenuItems.map((m) => [m.item_name, m])
        );

        const dailySalesRows: {
          restaurant_id: string;
          menu_item_id: string;
          sale_date: string;
          quantity: number;
          revenue: number;
        }[] = [];

        for (const entry of data.metricEntries) {
          for (const [itemName, qty] of Object.entries(entry.itemQuantities)) {
            if (qty <= 0) continue;
            const menuItem = nameToItem.get(itemName);
            if (!menuItem) {
              console.warn(`Onboarding: skipped daily_sales for "${itemName}" — not found in inserted menu items`);
              continue;
            }
            dailySalesRows.push({
              restaurant_id: restaurantId,
              menu_item_id: menuItem.id,
              sale_date: entry.period_start,
              quantity: qty,
              revenue: menuItem.price * qty,
            });
          }
        }

        if (dailySalesRows.length > 0) {
          const { error: salesErr } = await supabase
            .from("daily_sales")
            .insert(dailySalesRows);
          if (salesErr) throw salesErr;
        }
      }

      // Insert reviews
      const validReviews = data.reviews.filter((r) => r.review_text);
      if (validReviews.length > 0) {
        const { error: reviewErr } = await supabase
          .from("reviews")
          .insert(
            validReviews.map((r) => ({
              source: r.source || null,
              review_text: r.review_text,
              rating: r.rating,
              review_date: r.review_date || null,
              restaurant_id: restaurantId,
            }))
          );
        if (reviewErr) throw reviewErr;
      }

      // Refresh restaurant list and switch to the new one
      await refresh();
      switchRestaurant(restaurantId);

      // Navigate to dashboard — report will be generated there
      router.push(`/dashboard?restaurant=${restaurantId}&generate=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <StepIndicator currentStep={step} />
        </div>
        {step < 4 && (
          <Button
            variant="outline"
            size="sm"
            className="ml-4 shrink-0 gap-1.5 border-dashed"
            onClick={handleDemoFill}
          >
            <Wand2 className="h-3.5 w-3.5" />
            Demo Fill
          </Button>
        )}
      </div>

      <div className="min-h-[400px]">
        {step === 0 && (
          <RestaurantInfoStep
            data={data.restaurant}
            onChange={(restaurant) => setData({ ...data, restaurant })}
          />
        )}
        {step === 1 && (
          <MenuStep
            data={data.menuItems as MenuItemInput[]}
            onChange={(menuItems) => setData({ ...data, menuItems })}
          />
        )}
        {step === 2 && (
          <CostRevenueStep
            menuItems={data.menuItems as MenuItemInput[]}
            entries={data.metricEntries}
            onChange={(metricEntries, metrics) =>
              setData({ ...data, metricEntries, metrics })
            }
          />
        )}
        {step === 3 && (
          <ReviewsStep
            data={data.reviews as ReviewInput[]}
            onChange={(reviews) => setData({ ...data, reviews })}
          />
        )}
        {step === 4 && <ConfirmationStep data={data} />}
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-6 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              Analysis coverage: {assessment.coveragePercent}%
            </p>
            <p className="text-sm text-muted-foreground">
              Confidence: {assessment.confidenceLabel}. {assessment.confidenceSummary}
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              assessment.confidenceLabel === "high"
                ? "bg-green-100 text-green-700"
                : assessment.confidenceLabel === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {assessment.confidenceLabel.toUpperCase()}
          </div>
        </div>
        <Progress value={assessment.coveragePercent} className="mt-3 h-2" />
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceedFromStep(step)}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canProceedFromStep(4)}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Generate Analysis"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

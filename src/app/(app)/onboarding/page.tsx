"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { RestaurantInfoStep } from "@/components/onboarding/restaurant-info-step";
import { MetricsStep } from "@/components/onboarding/metrics-step";
import { MenuStep } from "@/components/onboarding/menu-step";
import { ReviewsStep } from "@/components/onboarding/reviews-step";
import { ConfirmationStep } from "@/components/onboarding/confirmation-step";
import type { OnboardingData } from "@/types";
import type { BusinessMetricInput, MenuItemInput, ReviewInput } from "@/lib/validators/schemas";
import { Loader2 } from "lucide-react";

const initialData: OnboardingData = {
  restaurant: {
    name: "",
    cuisine_type: "",
    location: "",
    service_model: "hybrid",
    seats: null,
    hours: "",
  },
  metrics: [
    {
      period_start: "",
      period_end: "",
      revenue: null,
      orders: null,
      avg_order_value: null,
      food_cost: null,
      labor_cost: null,
      fixed_cost: null,
      delivery_share: null,
    },
  ],
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

  const canProceedFromStep = (s: number) => {
    switch (s) {
      case 0:
        return !!data.restaurant.name;
      case 1:
      case 2:
      case 3:
        return true; // optional steps
      case 4: {
        const hasMetrics = data.metrics.some((m) => m.period_start);
        const hasMenu = data.menuItems.some((m) => m.item_name);
        return !!data.restaurant.name && (hasMetrics || hasMenu);
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
          service_model: data.restaurant.service_model,
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

      // Insert menu items
      const validMenu = data.menuItems.filter((m) => m.item_name && m.price > 0);
      if (validMenu.length > 0) {
        const { error: menuErr } = await supabase
          .from("menu_items")
          .insert(
            validMenu.map((m) => ({
              ...m,
              category: m.category || null,
              restaurant_id: restaurantId,
            }))
          );
        if (menuErr) throw menuErr;
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
      <StepIndicator currentStep={step} />

      <div className="min-h-[400px]">
        {step === 0 && (
          <RestaurantInfoStep
            data={data.restaurant}
            onChange={(restaurant) => setData({ ...data, restaurant })}
          />
        )}
        {step === 1 && (
          <MetricsStep
            data={data.metrics as BusinessMetricInput[]}
            onChange={(metrics) => setData({ ...data, metrics })}
          />
        )}
        {step === 2 && (
          <MenuStep
            data={data.menuItems as MenuItemInput[]}
            onChange={(menuItems) => setData({ ...data, menuItems })}
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

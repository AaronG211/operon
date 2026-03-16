"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsStep } from "@/components/onboarding/metrics-step";
import { MenuStep } from "@/components/onboarding/menu-step";
import { ReviewsStep } from "@/components/onboarding/reviews-step";
import {
  BarChart3,
  UtensilsCrossed,
  MessageSquare,
  Loader2,
  Plus,
} from "lucide-react";
import type { BusinessMetricInput, MenuItemInput, ReviewInput } from "@/lib/validators/schemas";

export default function DataPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [existingCounts, setExistingCounts] = useState({
    metrics: 0,
    menuItems: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("metrics");

  // New data being added
  const [newMetrics, setNewMetrics] = useState<BusinessMetricInput[]>([
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
  ]);
  const [newMenu, setNewMenu] = useState<MenuItemInput[]>([
    { item_name: "", category: "", price: 0, estimated_cost: null, quantity_sold: null },
  ]);
  const [newReviews, setNewReviews] = useState<ReviewInput[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!restaurants?.length) {
      setLoading(false);
      return;
    }

    setRestaurantId(restaurants[0].id);
    const rid = restaurants[0].id;

    const [
      { count: metricsCount },
      { count: menuCount },
      { count: reviewCount },
    ] = await Promise.all([
      supabase
        .from("business_metrics")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", rid),
      supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", rid),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", rid),
    ]);

    setExistingCounts({
      metrics: metricsCount ?? 0,
      menuItems: menuCount ?? 0,
      reviews: reviewCount ?? 0,
    });
    setLoading(false);
  }

  async function saveData() {
    if (!restaurantId) return;
    setSaving(true);

    try {
      if (activeTab === "metrics") {
        const valid = newMetrics.filter((m) => m.period_start && m.period_end);
        if (valid.length > 0) {
          await supabase
            .from("business_metrics")
            .insert(valid.map((m) => ({ ...m, restaurant_id: restaurantId })));
        }
      } else if (activeTab === "menu") {
        const valid = newMenu.filter((m) => m.item_name && m.price > 0);
        if (valid.length > 0) {
          await supabase
            .from("menu_items")
            .insert(
              valid.map((m) => ({
                ...m,
                category: m.category || null,
                restaurant_id: restaurantId,
              }))
            );
        }
      } else if (activeTab === "reviews") {
        const valid = newReviews.filter((r) => r.review_text);
        if (valid.length > 0) {
          await supabase
            .from("reviews")
            .insert(
              valid.map((r) => ({
                source: r.source || null,
                review_text: r.review_text,
                rating: r.rating,
                review_date: r.review_date || null,
                restaurant_id: restaurantId,
              }))
            );
        }
      }

      await loadData();
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Set up your restaurant first via onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Data</h1>
        <p className="text-muted-foreground">
          Add new business data to improve your analysis
        </p>
      </div>

      {/* Current data summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <CardTitle className="text-sm">Business Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{existingCounts.metrics}</p>
            <p className="text-xs text-muted-foreground">periods recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              <CardTitle className="text-sm">Menu Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{existingCounts.menuItems}</p>
            <p className="text-xs text-muted-foreground">items tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <CardTitle className="text-sm">Reviews</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{existingCounts.reviews}</p>
            <p className="text-xs text-muted-foreground">reviews uploaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Add new data */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Data</CardTitle>
          <CardDescription>
            Upload new periods, menu items, or reviews to get updated insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="metrics" className="mt-4">
              <MetricsStep data={newMetrics} onChange={setNewMetrics} />
            </TabsContent>
            <TabsContent value="menu" className="mt-4">
              <MenuStep data={newMenu} onChange={setNewMenu} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <ReviewsStep data={newReviews} onChange={setNewReviews} />
            </TabsContent>
          </Tabs>
          <div className="mt-6">
            <Button onClick={saveData} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

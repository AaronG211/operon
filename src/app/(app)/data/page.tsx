"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuStep } from "@/components/onboarding/menu-step";
import { ReviewsStep } from "@/components/onboarding/reviews-step";
import { SalesCalendar } from "@/components/data/sales-calendar";
import {
  UtensilsCrossed,
  MessageSquare,
  CalendarDays,
  Loader2,
  Plus,
  Save,
  Trash2,
  Sparkles,
} from "lucide-react";
import type {
  MenuItem,
  Review,
} from "@/types";
import type {
  MenuItemInput,
  ReviewInput,
} from "@/lib/validators/schemas";

type DataTab = "daily-sales" | "menu" | "reviews";
type TableName = "business_metrics" | "menu_items" | "reviews";

const emptyMenuItem: MenuItemInput = {
  item_name: "",
  category: "",
  price: 0,
  estimated_cost: null,
  quantity_sold: null,
};

export default function DataPage() {
  const router = useRouter();
  const { current: restaurant, loading: restaurantLoading } = useRestaurant();
  const restaurantId = restaurant?.id ?? null;
  const supabase = useMemo(() => createClient(), []);

  const [menuRows, setMenuRows] = useState<MenuItem[]>([]);
  const [reviewRows, setReviewRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DataTab>("daily-sales");

  const [newMenu, setNewMenu] = useState<MenuItemInput[]>([
    { ...emptyMenuItem },
  ]);
  const [newReviews, setNewReviews] = useState<ReviewInput[]>([]);

  const loadData = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [menuResult, reviewsResult] = await Promise.all([
      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false }),
    ]);

    if (menuResult.error) console.error("Failed to load menu:", menuResult.error);
    if (reviewsResult.error) console.error("Failed to load reviews:", reviewsResult.error);

    setMenuRows((menuResult.data ?? []) as MenuItem[]);
    setReviewRows((reviewsResult.data ?? []) as Review[]);
    setLoading(false);
  }, [restaurantId, supabase]);

  useEffect(() => {
    if (restaurantLoading) return;

    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData, restaurantLoading]);

  const saveData = useCallback(async () => {
    if (!restaurantId) return;

    setSaving(true);
    setNotice(null);

    try {
      if (activeTab === "menu") {
        const valid = newMenu.filter((item) => item.item_name && item.price > 0);
        if (valid.length > 0) {
          const { error } = await supabase.from("menu_items").insert(
            valid.map((item) => ({
              ...item,
              category: item.category || null,
              restaurant_id: restaurantId,
            }))
          );
          if (error) throw new Error(error.message);
          setNewMenu([{ ...emptyMenuItem }]);
        }
      } else {
        const valid = newReviews.filter((review) => review.review_text);
        if (valid.length > 0) {
          const { error } = await supabase.from("reviews").insert(
            valid.map((review) => ({
              source: review.source || null,
              review_text: review.review_text,
              rating: review.rating,
              review_date: review.review_date || null,
              restaurant_id: restaurantId,
            }))
          );
          if (error) throw new Error(error.message);
          setNewReviews([]);
        }
      }

      await loadData();
      setNotice("Data saved. Regenerate analysis to refresh the latest report.");
    } catch (err) {
      console.error("Failed to save:", err);
      setNotice("Saving failed. Please review the row values and try again.");
    }

    setSaving(false);
  }, [
    activeTab,
    loadData,
    newMenu,
    newReviews,
    restaurantId,
    supabase,
  ]);

  const regenerateAnalysis = useCallback(async () => {
    if (!restaurantId) return;

    setRegenerating(true);
    setNotice(null);

    try {
      const response = await fetch("/api/ai/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });

      if (!response.ok) {
        throw new Error("Health check generation failed");
      }

      router.push(`/dashboard?restaurant=${restaurantId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setNotice("Regeneration failed. Please try again.");
    }

    setRegenerating(false);
  }, [restaurantId, router]);

  const deleteRecord = useCallback(
    async (table: TableName, id: string) => {
      setRowBusyId(id);
      setNotice(null);

      try {
        await supabase.from(table).delete().eq("id", id);
        await loadData();
        setNotice("Row removed.");
      } catch (err) {
        console.error("Delete failed:", err);
        setNotice("Delete failed. Please try again.");
      }

      setRowBusyId(null);
    },
    [loadData, supabase]
  );


  const saveMenuRow = useCallback(
    async (item: MenuItem) => {
      setRowBusyId(item.id);
      setNotice(null);

      try {
        await supabase
          .from("menu_items")
          .update({
            item_name: item.item_name,
            category: item.category || null,
            price: item.price,
            estimated_cost: item.estimated_cost,
            quantity_sold: item.quantity_sold,
          })
          .eq("id", item.id);

        setNotice("Menu item saved.");
      } catch (err) {
        console.error("Menu save failed:", err);
        setNotice("Menu item save failed.");
      }

      setRowBusyId(null);
    },
    [supabase]
  );

  const saveReviewRow = useCallback(
    async (review: Review) => {
      setRowBusyId(review.id);
      setNotice(null);

      try {
        await supabase
          .from("reviews")
          .update({
            source: review.source || null,
            review_text: review.review_text,
            rating: review.rating,
            review_date: review.review_date || null,
          })
          .eq("id", review.id);

        setNotice("Review saved.");
      } catch (err) {
        console.error("Review save failed:", err);
        setNotice("Review save failed.");
      }

      setRowBusyId(null);
    },
    [supabase]
  );


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

  const counts = {
    menuItems: menuRows.length,
    reviews: reviewRows.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Data Workspace</h1>
          <p className="text-muted-foreground">
            Inspect, edit, and re-run analysis from one place
          </p>
        </div>
        <Button onClick={regenerateAnalysis} disabled={regenerating}>
          {regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerate Analysis
            </>
          )}
        </Button>
      </div>

      {notice && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              <CardTitle className="text-sm">Menu Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.menuItems}</p>
            <p className="text-xs text-muted-foreground">editable items</p>
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
            <p className="text-2xl font-bold">{counts.reviews}</p>
            <p className="text-xs text-muted-foreground">review records</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setActiveTab("daily-sales")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <CardTitle className="text-sm">Daily Sales</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <CalendarDays className="h-6 w-6 inline text-primary" />
            </p>
            <p className="text-xs text-muted-foreground">log daily orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Tables</CardTitle>
          <CardDescription>
            View, edit, and add data. Re-run analysis when you&apos;re ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DataTab)}>
            <TabsList>
              <TabsTrigger value="daily-sales" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Daily Sales
              </TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="daily-sales" className="mt-4">
              <SalesCalendar
                restaurantId={restaurantId}
                menuItems={menuRows}
              />
            </TabsContent>

            <TabsContent value="menu" className="mt-4">
              {/* Existing menu items */}
              {menuRows.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-left text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuRows.map((item) => (
                        <tr key={item.id} className="border-t align-top">
                          <td className="px-3 py-2">
                            <Input
                              value={item.item_name}
                              onChange={(event) =>
                                setMenuRows((current) =>
                                  current.map((row) =>
                                    row.id === item.id
                                      ? { ...row, item_name: event.target.value }
                                      : row
                                  )
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={item.category ?? ""}
                              onChange={(event) =>
                                setMenuRows((current) =>
                                  current.map((row) =>
                                    row.id === item.id
                                      ? { ...row, category: event.target.value }
                                      : row
                                  )
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(event) =>
                                setMenuRows((current) =>
                                  current.map((row) =>
                                    row.id === item.id
                                      ? {
                                          ...row,
                                          price: event.target.value
                                            ? Number(event.target.value)
                                            : 0,
                                        }
                                      : row
                                  )
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => void saveMenuRow(item)}
                                disabled={rowBusyId === item.id}
                              >
                                <Save className="mr-1 h-3.5 w-3.5" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void deleteRecord("menu_items", item.id)}
                                disabled={rowBusyId === item.id}
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add new menu items */}
              <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">Add New Items</h4>
                <MenuStep data={newMenu} onChange={setNewMenu} />
                <div className="mt-4">
                  <Button onClick={saveData} disabled={saving} size="sm">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Menu
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              {/* Existing reviews */}
              {reviewRows.length > 0 && (
                <div className="space-y-3">
                  {reviewRows.map((review) => (
                    <div key={review.id} className="rounded-lg border p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <Input
                          value={review.source ?? ""}
                          onChange={(event) =>
                            setReviewRows((current) =>
                              current.map((row) =>
                                row.id === review.id
                                  ? { ...row, source: event.target.value }
                                  : row
                              )
                            )
                          }
                          placeholder="Source"
                        />
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={review.rating ?? ""}
                          onChange={(event) =>
                            setReviewRows((current) =>
                              current.map((row) =>
                                row.id === review.id
                                  ? {
                                      ...row,
                                      rating: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                    }
                                  : row
                              )
                            )
                          }
                          placeholder="Rating"
                        />
                        <Input
                          type="date"
                          value={review.review_date ?? ""}
                          onChange={(event) =>
                            setReviewRows((current) =>
                              current.map((row) =>
                                row.id === review.id
                                  ? { ...row, review_date: event.target.value }
                                  : row
                              )
                            )
                          }
                        />
                      </div>
                      <Textarea
                        className="mt-3"
                        value={review.review_text ?? ""}
                        onChange={(event) =>
                          setReviewRows((current) =>
                            current.map((row) =>
                              row.id === review.id
                                ? { ...row, review_text: event.target.value }
                                : row
                            )
                          )
                        }
                      />
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => void saveReviewRow(review)}
                          disabled={rowBusyId === review.id}
                        >
                          <Save className="mr-1 h-3.5 w-3.5" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void deleteRecord("reviews", review.id)}
                          disabled={rowBusyId === review.id}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new reviews */}
              <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">Add New Reviews</h4>
                <ReviewsStep data={newReviews} onChange={setNewReviews} />
                <div className="mt-4">
                  <Button onClick={saveData} disabled={saving} size="sm">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Reviews
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

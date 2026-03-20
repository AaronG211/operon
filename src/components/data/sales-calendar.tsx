"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  X,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface DailySale {
  id?: string;
  menu_item_id: string;
  sale_date: string;
  quantity: number;
  revenue: number | null;
}

interface DaySummary {
  totalItems: number;
  totalRevenue: number;
  hasData: boolean;
}

interface SalesCalendarProps {
  restaurantId: string;
  menuItems: MenuItem[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatCurrency(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

export function SalesCalendar({ restaurantId, menuItems }: SalesCalendarProps) {
  const supabase = useMemo(() => createClient(), []);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [salesMap, setSalesMap] = useState<Map<string, DailySale[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editQuantities, setEditQuantities] = useState<Map<string, number>>(
    new Map()
  );
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayOfWeek = days[0].getDay();

  // Load sales data for current month
  const loadSales = useCallback(async () => {
    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(days.length).padStart(2, "0")}`;

    const { data } = await supabase
      .from("daily_sales")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .gte("sale_date", startDate)
      .lte("sale_date", endDate);

    const map = new Map<string, DailySale[]>();
    for (const row of (data ?? []) as DailySale[]) {
      const existing = map.get(row.sale_date) ?? [];
      existing.push(row);
      map.set(row.sale_date, existing);
    }
    setSalesMap(map);
    setLoading(false);
  }, [year, month, days.length, restaurantId, supabase]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Compute summaries per day
  const daySummaries = useMemo(() => {
    const summaries = new Map<string, DaySummary>();
    for (const [date, sales] of salesMap) {
      let totalItems = 0;
      let totalRevenue = 0;
      for (const s of sales) {
        totalItems += s.quantity;
        totalRevenue += s.revenue ?? 0;
      }
      summaries.set(date, { totalItems, totalRevenue, hasData: true });
    }
    return summaries;
  }, [salesMap]);

  // Open a day panel
  const openDay = useCallback(
    (dateStr: string) => {
      setSelectedDate(dateStr);
      const existing = salesMap.get(dateStr) ?? [];
      const qtyMap = new Map<string, number>();
      for (const item of menuItems) {
        const sale = existing.find((s) => s.menu_item_id === item.id);
        qtyMap.set(item.id, sale?.quantity ?? 0);
      }
      setEditQuantities(qtyMap);
    },
    [salesMap, menuItems]
  );

  // Save day
  const saveDay = useCallback(async () => {
    if (!selectedDate) return;
    setSaving(true);

    const rows: {
      restaurant_id: string;
      menu_item_id: string;
      sale_date: string;
      quantity: number;
      revenue: number;
    }[] = [];

    for (const [itemId, qty] of editQuantities) {
      if (qty > 0) {
        const menuItem = menuItems.find((m) => m.id === itemId);
        rows.push({
          restaurant_id: restaurantId,
          menu_item_id: itemId,
          sale_date: selectedDate,
          quantity: qty,
          revenue: (menuItem?.price ?? 0) * qty,
        });
      }
    }

    // Delete existing sales for this date, then insert new ones
    const { error: deleteErr } = await supabase
      .from("daily_sales")
      .delete()
      .eq("restaurant_id", restaurantId)
      .eq("sale_date", selectedDate);

    if (deleteErr) {
      console.error("Failed to delete existing sales:", deleteErr);
      setSaving(false);
      return;
    }

    if (rows.length > 0) {
      const { error: insertErr } = await supabase
        .from("daily_sales")
        .insert(rows);
      if (insertErr) {
        console.error("Failed to save daily sales:", insertErr);
        setSaving(false);
        return;
      }
    }

    await loadSales();
    setSaving(false);
    setSelectedDate(null);
  }, [
    selectedDate,
    editQuantities,
    menuItems,
    restaurantId,
    supabase,
    loadSales,
  ]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(null);
  };

  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Compute totals for the month
  const monthTotal = useMemo(() => {
    let items = 0;
    let revenue = 0;
    for (const summary of daySummaries.values()) {
      items += summary.totalItems;
      revenue += summary.totalRevenue;
    }
    return { items, revenue };
  }, [daySummaries]);

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-medium">No menu items yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add menu items first (via Menu tab or Onboarding), then come back to
          log daily sales.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold w-44 text-center">
            {monthName}
          </h3>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday} className="ml-2">
            Today
          </Button>
        </div>
        {monthTotal.items > 0 && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{monthTotal.items.toLocaleString()} items sold</span>
            <span>•</span>
            <span>${monthTotal.revenue.toLocaleString()} est. revenue</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Calendar grid */}
          <div className="flex-1">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20" />
              ))}

              {days.map((day) => {
                const dateStr = formatDate(day);
                const summary = daySummaries.get(dateStr);
                const isToday = dateStr === formatDate(today);
                const isSelected = dateStr === selectedDate;
                const isFuture = day > today;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => !isFuture && openDay(dateStr)}
                    disabled={isFuture}
                    className={cn(
                      "h-20 rounded-lg border p-1.5 text-left transition-all",
                      "hover:border-primary/50 hover:bg-muted/30",
                      isToday && "ring-2 ring-primary/30",
                      isSelected && "border-primary bg-primary/5",
                      isFuture && "opacity-40 cursor-not-allowed",
                      summary?.hasData && "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isToday &&
                            "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                        )}
                      >
                        {day.getDate()}
                      </span>
                      {summary?.hasData && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </div>
                    {summary?.hasData && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground truncate">
                          {summary.totalItems} items
                        </p>
                        <p className="text-[10px] font-medium text-green-700 dark:text-green-400 truncate">
                          {formatCurrency(summary.totalRevenue)}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          {selectedDate && (
            <div className="w-80 shrink-0 rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
                <div>
                  <p className="font-semibold text-sm">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                      "default",
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                  {(() => {
                    let total = 0;
                    let rev = 0;
                    for (const [itemId, qty] of editQuantities) {
                      if (qty > 0) {
                        total += qty;
                        const item = menuItems.find((m) => m.id === itemId);
                        rev += (item?.price ?? 0) * qty;
                      }
                    }
                    return total > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {total} items • ${rev.toFixed(2)}
                      </p>
                    ) : null;
                  })()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSelectedDate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-y-auto max-h-[500px] divide-y">
                {/* Group by category */}
                {(() => {
                  const categories = new Map<string, MenuItem[]>();
                  for (const item of menuItems) {
                    const cat = item.category || "Uncategorized";
                    const existing = categories.get(cat) ?? [];
                    existing.push(item);
                    categories.set(cat, existing);
                  }

                  return Array.from(categories.entries()).map(
                    ([category, items]) => (
                      <div key={category}>
                        <div className="px-4 py-1.5 bg-muted/20 text-xs font-medium text-muted-foreground sticky top-0">
                          {category}
                        </div>
                        {items.map((item) => {
                          const qty = editQuantities.get(item.id) ?? 0;
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2",
                                qty > 0 && "bg-green-50/50 dark:bg-green-950/10"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">
                                  {item.item_name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  ${item.price.toFixed(2)}
                                  {qty > 0 && (
                                    <span className="text-green-600 dark:text-green-400 ml-1">
                                      = ${(item.price * qty).toFixed(2)}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 text-xs"
                                  onClick={() =>
                                    setEditQuantities((prev) => {
                                      const next = new Map(prev);
                                      next.set(
                                        item.id,
                                        Math.max(0, (prev.get(item.id) ?? 0) - 1)
                                      );
                                      return next;
                                    })
                                  }
                                  disabled={qty === 0}
                                >
                                  −
                                </Button>
                                <Input
                                  type="number"
                                  min={0}
                                  value={qty}
                                  onChange={(e) =>
                                    setEditQuantities((prev) => {
                                      const next = new Map(prev);
                                      next.set(
                                        item.id,
                                        Math.max(
                                          0,
                                          parseInt(e.target.value) || 0
                                        )
                                      );
                                      return next;
                                    })
                                  }
                                  className="w-14 h-7 text-center text-sm px-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 text-xs"
                                  onClick={() =>
                                    setEditQuantities((prev) => {
                                      const next = new Map(prev);
                                      next.set(
                                        item.id,
                                        (prev.get(item.id) ?? 0) + 1
                                      );
                                      return next;
                                    })
                                  }
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  );
                })()}
              </div>

              <div className="border-t p-3">
                <Button
                  className="w-full gap-2"
                  onClick={saveDay}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Day
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

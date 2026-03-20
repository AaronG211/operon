"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Minus,
  Trash2,
  X,
  Save,
  Pencil,
} from "lucide-react";
import type { BusinessMetricInput, MenuItemInput } from "@/lib/validators/schemas";
import type { MetricEntry } from "@/types";

// ─── Props ───

interface Props {
  menuItems: MenuItemInput[];
  entries: MetricEntry[];
  onChange: (entries: MetricEntry[], metrics: BusinessMetricInput[]) => void;
}

// ─── Helpers ───

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtShort(s: string) {
  const d = parseDate(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

function getCoveredDates(entries: MetricEntry[]): Map<string, MetricEntry> {
  const map = new Map<string, MetricEntry>();
  for (const entry of entries) {
    const start = parseDate(entry.period_start);
    const end = parseDate(entry.period_end);
    const d = new Date(start);
    while (d <= end) {
      map.set(fmtDate(d), entry);
      d.setDate(d.getDate() + 1);
    }
  }
  return map;
}

function hasConflict(
  start: string,
  end: string,
  entries: MetricEntry[],
  excludeId?: string
): boolean {
  const covered = getCoveredDates(entries.filter((e) => e.id !== excludeId));
  const s = parseDate(start);
  const e = parseDate(end);
  const d = new Date(s);
  while (d <= e) {
    if (covered.has(fmtDate(d))) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
}

function entriesToMetrics(
  entries: MetricEntry[],
  menuItems: MenuItemInput[]
): BusinessMetricInput[] {
  return entries.map((entry) => {
    let revenue = 0;
    let totalQty = 0;
    for (const [name, qty] of Object.entries(entry.itemQuantities)) {
      if (qty <= 0) continue;
      const item = menuItems.find((m) => m.item_name === name);
      if (item) {
        revenue += item.price * qty;
        totalQty += qty;
      }
    }
    return {
      period_start: entry.period_start,
      period_end: entry.period_end,
      revenue: revenue || null,
      orders: totalQty || null,
      avg_order_value:
        totalQty > 0 ? Math.round((revenue / totalQty) * 100) / 100 : null,
      food_cost: entry.food_cost,
      labor_cost: entry.labor_cost,
      fixed_cost: entry.fixed_cost,
      delivery_share: entry.delivery_share,
    };
  });
}

function getEntryRevenue(entry: MetricEntry, menuItems: MenuItemInput[]) {
  let revenue = 0;
  for (const [name, qty] of Object.entries(entry.itemQuantities)) {
    if (qty <= 0) continue;
    const item = menuItems.find((m) => m.item_name === name);
    if (item) revenue += item.price * qty;
  }
  return revenue;
}

function getEntryTotalQty(entry: MetricEntry) {
  return Object.values(entry.itemQuantities).reduce(
    (s, q) => s + (q > 0 ? q : 0),
    0
  );
}

// ─── Component ───

export function CostRevenueStep({ menuItems, entries, onChange }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [editingEntry, setEditingEntry] = useState<MetricEntry | null>(null);

  const coveredDates = useMemo(() => getCoveredDates(entries), [entries]);

  const validMenuItems = useMemo(
    () => menuItems.filter((m) => m.item_name && m.price > 0),
    [menuItems]
  );

  // Group menu items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItemInput[]> = {};
    for (const item of validMenuItems) {
      const cat = item.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [validMenuItems]);

  const updateEntries = useCallback(
    (newEntries: MetricEntry[]) => {
      onChange(newEntries, entriesToMetrics(newEntries, menuItems));
    },
    [onChange, menuItems]
  );

  // ─── Calendar Navigation ───

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // ─── Day Click ───

  const handleDayClick = (dateStr: string) => {
    const existing = coveredDates.get(dateStr);

    // If this date belongs to an existing entry, open it for editing
    if (existing) {
      if (editingEntry && editingEntry.id !== existing.id) {
        saveEntry(); // auto-save current work
      }
      setEditingEntry({ ...existing });
      return;
    }

    if (editingEntry) saveEntry(); // auto-save current work
    // Create new daily entry
    setEditingEntry({
      id: crypto.randomUUID(),
      type: "daily",
      period_start: dateStr,
      period_end: dateStr,
      itemQuantities: {},
      food_cost: null,
      labor_cost: null,
      fixed_cost: null,
      delivery_share: null,
    });
  };

  // ─── Entry Panel Actions ───

  const updateQuantity = (itemName: string, delta: number) => {
    if (!editingEntry) return;
    const current = editingEntry.itemQuantities[itemName] || 0;
    const newQty = Math.max(0, current + delta);
    setEditingEntry({
      ...editingEntry,
      itemQuantities: {
        ...editingEntry.itemQuantities,
        [itemName]: newQty,
      },
    });
  };

  const setQuantity = (itemName: string, qty: number) => {
    if (!editingEntry) return;
    setEditingEntry({
      ...editingEntry,
      itemQuantities: {
        ...editingEntry.itemQuantities,
        [itemName]: Math.max(0, qty),
      },
    });
  };

  const updateCost = (
    field: "food_cost" | "labor_cost" | "fixed_cost" | "delivery_share",
    value: string
  ) => {
    if (!editingEntry) return;
    setEditingEntry({
      ...editingEntry,
      [field]: value === "" ? null : Number(value),
    });
  };

  const saveEntry = () => {
    if (!editingEntry) return;
    const existing = entries.find((e) => e.id === editingEntry.id);
    const newEntries = existing
      ? entries.map((e) => (e.id === editingEntry.id ? editingEntry : e))
      : [...entries, editingEntry];
    updateEntries(newEntries);
    setEditingEntry(null);
  };

  const deleteEntry = (id: string) => {
    updateEntries(entries.filter((e) => e.id !== id));
    if (editingEntry?.id === id) setEditingEntry(null);
  };

  const cancelEdit = () => {
    // Auto-save if there's unsaved data
    if (editingEntry && !entries.find((e) => e.id === editingEntry.id)) {
      const hasData =
        getEntryTotalQty(editingEntry) > 0 ||
        editingEntry.food_cost !== null ||
        editingEntry.labor_cost !== null;
      if (hasData) {
        updateEntries([...entries, editingEntry]);
      }
    }
    setEditingEntry(null);
  };

  // ─── Calendar Render Data ───

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

  // Editing stats
  const editRevenue = editingEntry
    ? getEntryRevenue(editingEntry, validMenuItems)
    : 0;
  const editTotalQty = editingEntry ? getEntryTotalQty(editingEntry) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cost and Revenue</h2>
        <p className="text-muted-foreground">
          Select dates on the calendar and log item quantities sold plus costs.
        </p>
      </div>

      {validMenuItems.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Go back and add menu items with prices first — revenue is calculated
            from item quantities.
          </p>
        </div>
      )}

      {/* Calendar + Entry Panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* ─── Calendar ─── */}
        <div className="rounded-lg border p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{monthName}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={goToday}
              >
                Today
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-1 text-center text-xs font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {/* Empty offset cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = fmtDate(new Date(viewYear, viewMonth, day));
              const covered = coveredDates.get(dateStr);
              const isToday = dateStr === fmtDate(today);
              const isFuture = dateStr > fmtDate(today);
              const isEditing =
                editingEntry &&
                dateStr >= editingEntry.period_start &&
                dateStr <= editingEntry.period_end;

              let cellClass =
                "h-14 rounded-md text-sm flex flex-col items-center justify-center transition-colors relative ";

              if (isFuture) {
                cellClass += "opacity-30 cursor-not-allowed ";
              } else if (isEditing) {
                cellClass +=
                  "bg-primary text-primary-foreground ring-2 ring-primary cursor-pointer ";
              } else if (covered) {
                cellClass +=
                  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-pointer ";
              } else {
                cellClass += "hover:bg-muted cursor-pointer ";
              }

              if (isToday) {
                cellClass += "font-bold ";
              }

              return (
                <div
                  key={day}
                  className={cellClass}
                  onClick={() => !isFuture && handleDayClick(dateStr)}
                >
                  <span>{day}</span>
                  {covered && !isEditing && (
                    <span className="mt-0.5 text-[10px] leading-none">✓</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm border bg-green-100 dark:bg-green-900/30" />
              Has data
            </div>
          </div>
        </div>

        {/* ─── Entry Panel ─── */}
        {editingEntry ? (
          <div className="max-h-[600px] space-y-4 overflow-y-auto rounded-lg border p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">
                  {fmtShort(editingEntry.period_start)}
                </h4>
                <p className="text-xs text-muted-foreground">Daily Entry</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={cancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Revenue Summary */}
            <div className="space-y-1 rounded-md bg-muted/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items sold</span>
                <span className="font-medium">{editTotalQty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${editRevenue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            {validMenuItems.length > 0 && (
              <div className="space-y-3">
                <Label className="text-xs font-medium">Menu Items Sold</Label>
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {category}
                    </p>
                    <div className="space-y-1.5">
                      {items.map((item) => {
                        const qty =
                          editingEntry.itemQuantities[item.item_name] || 0;
                        return (
                          <div
                            key={item.item_name}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm">
                                {item.item_name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  updateQuantity(item.item_name, -1)
                                }
                                disabled={qty === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min={0}
                                value={qty || ""}
                                onChange={(e) =>
                                  setQuantity(
                                    item.item_name,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-6 w-14 px-1 text-center text-sm"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  updateQuantity(item.item_name, 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Costs */}
            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-medium">Costs</Label>
              <div className="grid gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Food Cost ($)
                  </Label>
                  <Input
                    type="number"
                    value={editingEntry.food_cost ?? ""}
                    onChange={(e) => updateCost("food_cost", e.target.value)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Labor Cost ($)
                  </Label>
                  <Input
                    type="number"
                    value={editingEntry.labor_cost ?? ""}
                    onChange={(e) => updateCost("labor_cost", e.target.value)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Fixed Cost ($)
                  </Label>
                  <Input
                    type="number"
                    value={editingEntry.fixed_cost ?? ""}
                    onChange={(e) => updateCost("fixed_cost", e.target.value)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Delivery Share (%)
                  </Label>
                  <Input
                    type="number"
                    value={editingEntry.delivery_share ?? ""}
                    onChange={(e) =>
                      updateCost("delivery_share", e.target.value)
                    }
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <Button onClick={saveEntry} className="w-full gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Save Entry
            </Button>
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center text-muted-foreground">
            <CalendarDays className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm font-medium">Click a day to log data</p>
            <p className="mt-1 text-xs">
              Each day records items sold and costs
            </p>
          </div>
        )}
      </div>

      {/* ─── Saved Entries List ─── */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Saved Entries ({entries.length})
          </h3>
          <div className="space-y-2">
            {entries.map((entry) => {
              const revenue = getEntryRevenue(entry, validMenuItems);
              const qty = getEntryTotalQty(entry);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {fmtShort(entry.period_start)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {qty} items &middot; ${revenue.toFixed(2)} revenue
                        {entry.food_cost
                          ? ` · $${entry.food_cost} food cost`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingEntry({ ...entry })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

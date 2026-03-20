"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CalendarDays, Loader2 } from "lucide-react";
import type { BusinessMetricInput } from "@/lib/validators/schemas";

interface Props {
  data: BusinessMetricInput[];
  onChange: (data: BusinessMetricInput[]) => void;
  /** When provided, shows "Auto-fill from Daily Sales" button */
  restaurantId?: string | null;
}

const emptyMetric: BusinessMetricInput = {
  period_start: "",
  period_end: "",
  revenue: null,
  orders: null,
  avg_order_value: null,
  food_cost: null,
  labor_cost: null,
  fixed_cost: null,
  delivery_share: null,
};

export function MetricsStep({ data, onChange, restaurantId }: Props) {
  const [autoFilling, setAutoFilling] = useState<number | null>(null);

  const addPeriod = () => onChange([...data, { ...emptyMetric }]);
  const removePeriod = (index: number) =>
    onChange(data.filter((_, i) => i !== index));
  const updatePeriod = (
    index: number,
    field: keyof BusinessMetricInput,
    value: string
  ) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]:
        field === "period_start" || field === "period_end"
          ? value
          : value === ""
            ? null
            : Number(value),
    };
    onChange(updated);
  };

  const autoFillFromDailySales = useCallback(
    async (index: number) => {
      const metric = data[index];
      if (!restaurantId || !metric.period_start || !metric.period_end) return;

      setAutoFilling(index);
      try {
        const params = new URLSearchParams({
          restaurantId,
          start: metric.period_start,
          end: metric.period_end,
        });
        const res = await fetch(`/api/data/daily-sales-summary?${params}`);
        const json = await res.json();

        if (res.ok && json.orders > 0) {
          const updated = [...data];
          updated[index] = {
            ...updated[index],
            revenue: json.revenue,
            orders: json.orders,
            avg_order_value: json.avg_order_value,
          };
          onChange(updated);
        }
      } catch (err) {
        console.error("Auto-fill failed:", err);
      }
      setAutoFilling(null);
    },
    [data, onChange, restaurantId]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cost and Revenue</h2>
        <p className="text-muted-foreground">
          Enter your weekly or monthly financial data. More periods = better
          analysis.
        </p>
      </div>

      <div className="space-y-6">
          {data.map((metric, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">Period {index + 1}</h3>
                <div className="flex items-center gap-2">
                  {/* Auto-fill button — only in data workspace, when dates are set */}
                  {restaurantId &&
                    metric.period_start &&
                    metric.period_end && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => autoFillFromDailySales(index)}
                        disabled={autoFilling === index}
                      >
                        {autoFilling === index ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CalendarDays className="h-3 w-3" />
                        )}
                        Auto-fill from Daily Sales
                      </Button>
                    )}
                  {data.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePeriod(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date *</Label>
                  <Input
                    type="date"
                    value={metric.period_start}
                    onChange={(e) =>
                      updatePeriod(index, "period_start", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date *</Label>
                  <Input
                    type="date"
                    value={metric.period_end}
                    onChange={(e) =>
                      updatePeriod(index, "period_end", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Revenue ($)</Label>
                  <Input
                    type="number"
                    value={metric.revenue ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "revenue", e.target.value)
                    }
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Orders</Label>
                  <Input
                    type="number"
                    value={metric.orders ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "orders", e.target.value)
                    }
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Avg Order Value ($)</Label>
                  <Input
                    type="number"
                    value={metric.avg_order_value ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "avg_order_value", e.target.value)
                    }
                    placeholder="41.67"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Food Cost ($)</Label>
                  <Input
                    type="number"
                    value={metric.food_cost ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "food_cost", e.target.value)
                    }
                    placeholder="15000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Labor Cost ($)</Label>
                  <Input
                    type="number"
                    value={metric.labor_cost ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "labor_cost", e.target.value)
                    }
                    placeholder="12000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fixed Cost ($)</Label>
                  <Input
                    type="number"
                    value={metric.fixed_cost ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "fixed_cost", e.target.value)
                    }
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Delivery Share (%)</Label>
                  <Input
                    type="number"
                    value={metric.delivery_share ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "delivery_share", e.target.value)
                    }
                    placeholder="25"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addPeriod} className="gap-2">
            <Plus className="h-4 w-4" /> Add Period
          </Button>
      </div>

      {data.length > 0 && data[0].period_start && (
        <p className="text-sm text-muted-foreground">
          {data.length} period(s) entered
        </p>
      )}
    </div>
  );
}

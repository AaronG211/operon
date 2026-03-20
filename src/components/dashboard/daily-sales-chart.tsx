"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailySalesChartProps {
  restaurantId: string;
}

interface DayData {
  date: string;
  label: string;
  revenue: number;
  items: number;
}

type RangeKey = "7d" | "14d" | "30d";

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 Days", days: 7 },
  { key: "14d", label: "14 Days", days: 14 },
  { key: "30d", label: "30 Days", days: 30 },
];

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatWeekday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function DailySalesChart({ restaurantId }: DailySalesChartProps) {
  const supabase = useMemo(() => createClient(), []);
  const [range, setRange] = useState<RangeKey>("14d");
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const days = RANGES.find((r) => r.key === range)!.days;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);

    const { data: sales } = await supabase
      .from("daily_sales")
      .select("sale_date, quantity, revenue")
      .eq("restaurant_id", restaurantId)
      .gte("sale_date", formatDate(startDate))
      .lte("sale_date", formatDate(today))
      .order("sale_date", { ascending: true });

    // Build a map of date → totals
    const dateMap = new Map<string, { revenue: number; items: number }>();
    for (const row of (sales ?? []) as { sale_date: string; quantity: number; revenue: number | null }[]) {
      const existing = dateMap.get(row.sale_date) ?? {
        revenue: 0,
        items: 0,
      };
      existing.revenue += row.revenue ?? 0;
      existing.items += row.quantity ?? 0;
      dateMap.set(row.sale_date, existing);
    }

    // Fill in all days in the range (including empty ones)
    const result: DayData[] = [];
    const cursor = new Date(startDate);
    while (cursor <= today) {
      const dateStr = formatDate(cursor);
      const entry = dateMap.get(dateStr);
      result.push({
        date: dateStr,
        label:
          days <= 14
            ? `${formatWeekday(dateStr)} ${formatShortDate(dateStr)}`
            : formatShortDate(dateStr),
        revenue: Math.round((entry?.revenue ?? 0) * 100) / 100,
        items: entry?.items ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    setData(result);
    setLoading(false);
  }, [range, restaurantId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalItems = data.reduce((s, d) => s + d.items, 0);
  const daysWithSales = data.filter((d) => d.items > 0).length;
  const avgDaily = daysWithSales > 0 ? totalRevenue / daysWithSales : 0;

  const hasData = totalItems > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Daily Sales Trend
            </CardTitle>
            <CardDescription>
              {hasData
                ? `${daysWithSales} day${daysWithSales !== 1 ? "s" : ""} with sales • $${totalRevenue.toLocaleString()} total • $${Math.round(avgDaily).toLocaleString()}/day avg`
                : "Log daily sales in Upload Data → Daily Sales to see trends here"}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.key}
                variant={range === r.key ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2.5"
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No daily sales data for this period
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Revenue area chart */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Revenue ($)
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart
                  data={data}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    interval={data.length <= 14 ? 0 : "preserveStartEnd"}
                    angle={data.length > 14 ? -45 : 0}
                    textAnchor={data.length > 14 ? "end" : "middle"}
                    height={data.length > 14 ? 50 : 30}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                    }
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(label: any) => label}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Items bar chart */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Items Sold
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={data}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    interval={data.length <= 14 ? 0 : "preserveStartEnd"}
                    angle={data.length > 14 ? -45 : 0}
                    textAnchor={data.length > 14 ? "end" : "middle"}
                    height={data.length > 14 ? 50 : 30}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [value, "Items"]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(label: any) => label}
                  />
                  <Bar
                    dataKey="items"
                    fill="hsl(var(--primary))"
                    radius={[3, 3, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

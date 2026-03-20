"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BusinessMetric } from "@/types";
import { getRevenueTrend } from "@/lib/restaurant-insights";

type View = "revenue" | "cost" | "profit";

interface FinancialTrendCardProps {
  metrics: BusinessMetric[];
  title?: string;
  description?: string;
}

export function FinancialTrendCard({
  metrics,
  title = "Financial Trends",
  description = "Recent periods, newest on the right",
}: FinancialTrendCardProps) {
  const [view, setView] = useState<View>("revenue");

  const trend = useMemo(() => getRevenueTrend(metrics), [metrics]);

  const chartData = useMemo(() => {
    return trend.map((m) => {
      const revenue = m.revenue ?? 0;
      const totalCost =
        (m.food_cost ?? 0) + (m.labor_cost ?? 0) + (m.fixed_cost ?? 0);
      const profit = revenue - totalCost;

      return {
        label: m.period_start.slice(5), // MM-DD
        revenue,
        cost: totalCost,
        profit,
      };
    });
  }, [trend]);

  const viewConfig: Record<
    View,
    { dataKey: string; color: string; gradientId: string; label: string }
  > = {
    revenue: {
      dataKey: "revenue",
      color: "#059669",
      gradientId: "colorRevenue",
      label: "Revenue",
    },
    cost: {
      dataKey: "cost",
      color: "#ef4444",
      gradientId: "colorCost",
      label: "Total Cost",
    },
    profit: {
      dataKey: "profit",
      color: "#6366f1",
      gradientId: "colorProfit",
      label: "Profit",
    },
  };

  const current = viewConfig[view];

  const formatDollar = (value: number) =>
    `$${Math.round(value).toLocaleString()}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-1">
            {(["revenue", "cost", "profit"] as View[]).map((v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "outline"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setView(v)}
              >
                {viewConfig[v].label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add metric periods to see financial trends.
          </p>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={current.gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={current.color}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={current.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickFormatter={formatDollar}
                  tickLine={false}
                  axisLine={false}
                  width={65}
                />
                <Tooltip
                  formatter={(value) => [formatDollar(Number(value)), current.label]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={current.dataKey}
                  stroke={current.color}
                  strokeWidth={2}
                  fill={`url(#${current.gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

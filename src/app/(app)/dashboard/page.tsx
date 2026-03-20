"use client";

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingAnalysis } from "@/components/shared/loading-analysis";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  FileText,
  MessageSquare,
  Store,
  Users,
  Truck as TruckIcon,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { FinancialTrendCard } from "@/components/shared/financial-trend-card";
import {
  getEvidenceItems,
  getHealthLabel,
  getHealthScore,
  getMetricDelta,
  getPrimaryIssue,
  getPrimaryOpportunity,
  getTopRecommendations,
  getWeeklyAggregates,
} from "@/lib/restaurant-insights";
import type {
  BusinessMetric,
  Report,
  Recommendation,
} from "@/types";

function DashboardContent() {
  const searchParams = useSearchParams();
  const shouldGenerate = searchParams.get("generate") === "true";
  const urlRestaurantId = searchParams.get("restaurant");

  const {
    current: restaurant,
    loading: restaurantLoading,
    switchRestaurant,
  } = useRestaurant();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [metrics, setMetrics] = useState<BusinessMetric[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const generationTriggered = useRef(false);

  // If we arrived from onboarding with a specific restaurant ID in the URL,
  // make sure the context is switched to it.
  useEffect(() => {
    if (
      urlRestaurantId &&
      !restaurantLoading &&
      restaurant?.id !== urlRestaurantId
    ) {
      switchRestaurant(urlRestaurantId);
    }
  }, [urlRestaurantId, restaurantLoading, restaurant?.id, switchRestaurant]);

  const loadData = useCallback(
    async (restId: string) => {
      setLoading(true);
      setReport(null);
      setRecommendations([]);
      setMetrics([]);

      const { data: metricsData } = await supabase
        .from("business_metrics")
        .select("*")
        .eq("restaurant_id", restId)
        .order("period_start", { ascending: false });
      setMetrics((metricsData ?? []) as unknown as BusinessMetric[]);

      const { data: reports } = await supabase
        .from("reports")
        .select("*")
        .eq("restaurant_id", restId)
        .eq("report_type", "health_check")
        .order("created_at", { ascending: false })
        .limit(1);

      if (reports?.length) {
        setReport(reports[0] as unknown as Report);

        const { data: recs } = await supabase
          .from("recommendations")
          .select("*")
          .eq("report_id", reports[0].id)
          .order("created_at", { ascending: true });
        setRecommendations((recs ?? []) as unknown as Recommendation[]);
      }

      setLoading(false);
    },
    [supabase]
  );

  const generateReport = useCallback(
    async (restaurantId: string) => {
      setGenerating(true);
      setLoading(false);

      try {
        const res = await fetch("/api/ai/health-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Health check failed:", err);
        }
      } catch (err) {
        console.error("Failed to generate report:", err);
      }

      setGenerating(false);
      await loadData(restaurantId);
    },
    [loadData]
  );

  useEffect(() => {
    generationTriggered.current = false;
  }, [shouldGenerate, urlRestaurantId]);

  // Main data loading + auto-generation logic
  useEffect(() => {
    if (restaurantLoading) return;

    // If URL specifies a restaurant and context hasn't switched yet, wait
    if (urlRestaurantId && restaurant?.id !== urlRestaurantId) return;

    if (!restaurant) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (shouldGenerate && !generationTriggered.current) {
        generationTriggered.current = true;
        void generateReport(restaurant.id);
      } else {
        void loadData(restaurant.id);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    generateReport,
    loadData,
    restaurant,
    restaurantLoading,
    shouldGenerate,
    urlRestaurantId,
  ]);

  if (restaurantLoading || (restaurant && loading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (generating) {
    return <LoadingAnalysis />;
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to Operon</h2>
          <p className="mt-2 text-muted-foreground">
            Get started by setting up your restaurant.
          </p>
          <Link href="/onboarding">
            <Button className="mt-4">Start Setup</Button>
          </Link>
        </div>
      </div>
    );
  }

  const competition = report?.summary.competition;
  const targetCustomers = report?.summary.target_customers;
  const localSupply = report?.summary.local_supply;
  const topActions = report ? getTopRecommendations(recommendations, 3) : [];
  const evidenceItems = report ? getEvidenceItems(report) : [];
  const healthScore = report ? getHealthScore(report) : null;
  const healthLabel = healthScore != null ? getHealthLabel(healthScore) : null;
  const primaryIssue = report ? getPrimaryIssue(report) : null;
  const primaryOpportunity = report
    ? getPrimaryOpportunity(report, recommendations)
    : null;

  // Weekly aggregates for week-to-week comparison
  const weeks = getWeeklyAggregates(metrics);
  const thisWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;
  const lastWeek = weeks.length > 1 ? weeks[weeks.length - 2] : null;

  const avgDailyRevThis = thisWeek && thisWeek.days > 0 ? thisWeek.revenue / thisWeek.days : null;
  const avgDailyRevLast = lastWeek && lastWeek.days > 0 ? lastWeek.revenue / lastWeek.days : null;
  const avgDailyOrdThis = thisWeek && thisWeek.days > 0 ? thisWeek.orders / thisWeek.days : null;
  const avgDailyOrdLast = lastWeek && lastWeek.days > 0 ? lastWeek.orders / lastWeek.days : null;

  const revenueDelta = getMetricDelta(avgDailyRevThis, avgDailyRevLast);
  const orderDelta = getMetricDelta(avgDailyOrdThis, avgDailyOrdLast);
  const aovDelta = getMetricDelta(
    thisWeek && thisWeek.orders > 0
      ? thisWeek.revenue / thisWeek.orders
      : null,
    lastWeek && lastWeek.orders > 0
      ? lastWeek.revenue / lastWeek.orders
      : null
  );
  const deliveryDelta = getMetricDelta(
    thisWeek?.delivery_share_avg,
    lastWeek?.delivery_share_avg
  );
  const foodCostPct =
    thisWeek && thisWeek.revenue > 0
      ? ((thisWeek.food_cost / thisWeek.revenue) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-muted-foreground">
            {restaurant.cuisine_type && `${restaurant.cuisine_type} • `}
            {restaurant.location}
          </p>
        </div>
        <Button
          onClick={() => generateReport(restaurant.id)}
          variant={report ? "outline" : "default"}
        >
          {report ? "Regenerate Analysis" : "Generate Analysis"}
        </Button>
      </div>

      {/* ── 1. KPI stat cards — the first thing owners glance at ── */}
      {thisWeek && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">This Week&apos;s Metrics</h2>
            <span className="text-sm text-muted-foreground">
              {thisWeek.weekLabel} ({thisWeek.days}d)
            </span>
          </div>
          <div className="-mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Avg Daily Revenue",
                icon: DollarSign,
                value: `$${avgDailyRevThis != null ? Math.round(avgDailyRevThis).toLocaleString() : "N/A"}`,
                subtitle: `total $${thisWeek.revenue.toLocaleString()}`,
                delta: revenueDelta,
                iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
                iconColor: "text-emerald-600",
              },
              {
                title: "Avg Daily Orders",
                icon: ShoppingCart,
                value: avgDailyOrdThis != null ? Math.round(avgDailyOrdThis).toLocaleString() : "N/A",
                subtitle: `AOV: $${thisWeek.orders > 0 ? (thisWeek.revenue / thisWeek.orders).toFixed(2) : "N/A"}`,
                delta: orderDelta,
                iconBg: "bg-blue-100 dark:bg-blue-950/50",
                iconColor: "text-blue-600",
              },
              {
                title: "Food Cost",
                icon: Percent,
                value: foodCostPct ? `${foodCostPct}%` : "N/A",
                subtitle: `$${Math.round(thisWeek.food_cost / thisWeek.days).toLocaleString()}/day avg`,
                delta: getMetricDelta(
                  thisWeek.days > 0 ? thisWeek.food_cost / thisWeek.days : null,
                  lastWeek && lastWeek.days > 0 ? lastWeek.food_cost / lastWeek.days : null
                ),
                iconBg: "bg-amber-100 dark:bg-amber-950/50",
                iconColor: "text-amber-600",
              },
              {
                title: "Delivery Share",
                icon: TrendingUp,
                value: thisWeek.delivery_share_avg != null ? `${thisWeek.delivery_share_avg.toFixed(0)}%` : "N/A",
                subtitle: `avg of ${thisWeek.days} days`,
                delta: deliveryDelta,
                iconBg: "bg-purple-100 dark:bg-purple-950/50",
                iconColor: "text-purple-600",
              },
            ].map((card) => {
              const Icon = card.icon;
              const isUp = card.delta.direction === "up";
              const isDown = card.delta.direction === "down";
              return (
                <Card key={card.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                      <Icon className={`h-4 w-4 ${card.iconColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{card.value}</span>
                      {card.delta.percentage != null && (
                        <Badge
                          className={
                            isUp
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : isDown
                                ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {isUp ? "+" : ""}{card.delta.percentage.toFixed(1)}%{isUp ? " \u2197" : isDown ? " \u2198" : ""}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.subtitle}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ── 2. Executive Snapshot + Top 3 Actions ── */}
      {report && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Executive Snapshot</CardTitle>
                  <CardDescription>
                    Quick view of your latest health check
                  </CardDescription>
                </div>
                <Link href="/chat?q=What%20should%20I%20do%20first%20based%20on%20my%20latest%20health%20check%3F">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Ask AI
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {/* Health Score with circular progress */}
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Health Score</p>
                  {(() => {
                    const score = healthScore ?? 0;
                    const color =
                      score >= 80
                        ? "#10b981"   // emerald — healthy
                        : score >= 60
                          ? "#f59e0b" // amber — needs attention
                          : score >= 40
                            ? "#f97316" // orange — at risk
                            : "#ef4444"; // red — critical
                    const radius = 36;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (score / 100) * circumference;
                    return (
                      <div className="mt-2 flex items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0">
                          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                            <circle
                              cx="40" cy="40" r={radius}
                              fill="none"
                              stroke="currentColor"
                              className="text-muted/40"
                              strokeWidth="6"
                            />
                            <circle
                              cx="40" cy="40" r={radius}
                              fill="none"
                              stroke={color}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              style={{ transition: "stroke-dashoffset 0.6s ease" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold" style={{ color }}>
                              {score}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{healthLabel}</p>
                          <p className="text-[10px] text-muted-foreground">out of 100</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Biggest Issue</p>
                  <p className="mt-2 text-sm font-medium leading-snug">{primaryIssue}</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Biggest Opportunity</p>
                  <p className="mt-2 text-sm font-medium leading-snug">{primaryOpportunity}</p>
                </div>
              </div>

              {/* Evidence */}
              {evidenceItems.length > 0 && (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Evidence to review</p>
                  <ul className="space-y-1.5">
                    {evidenceItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick links row */}
              <div className="grid grid-cols-3 gap-2">
                <Link href={`/report/${report.id}`} className="flex flex-col items-center gap-1.5 rounded-xl border bg-muted/20 p-3 text-center transition-colors hover:bg-muted/40">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-medium">Full Report</span>
                </Link>
                <Link href="/data" className="flex flex-col items-center gap-1.5 rounded-xl border bg-muted/20 p-3 text-center transition-colors hover:bg-muted/40">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-medium">Upload Data</span>
                </Link>
                <Link href="/weekly-summary" className="flex flex-col items-center gap-1.5 rounded-xl border bg-muted/20 p-3 text-center transition-colors hover:bg-muted/40">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-medium">Weekly Plan</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top 3 Actions</CardTitle>
              <CardDescription>Start here this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topActions.map((rec, index) => (
                <div key={rec.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug">
                      {index + 1}. {rec.title}
                    </p>
                    <Badge
                      variant={rec.priority === "high" ? "destructive" : "secondary"}
                      className="shrink-0 text-[10px]"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {rec.description}
                  </p>
                  {rec.data_source && (
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      Based on: <span className="font-medium text-muted-foreground">{rec.data_source}</span>
                    </p>
                  )}
                </div>
              ))}
              <Link href={`/report/${report.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Full Report & Recommendations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 3. Explore: Analysis cards + AI Chat ── */}
      {report && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {competition && (
            <Link href="/dashboard/competition">
              <Card className="group h-full cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                      <Store className="h-4 w-4 text-blue-600" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-sm">Competition</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {(competition as unknown as Record<string, string>).landscape_summary ||
                      "Nearby competitors & pricing position"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
          {targetCustomers && (
            <Link href="/dashboard/target-customers">
              <Card className="group h-full cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-sm">Target Customers</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {(targetCustomers as unknown as Record<string, string>).customer_profile ||
                      "Demographics & foot traffic"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
          {localSupply && (
            <Link href="/dashboard/supply-chain">
              <Card className="group h-full cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                      <TruckIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-sm">Supply Chain</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {(localSupply as unknown as Record<string, string>).sourcing_strategy ||
                      "Local suppliers & cost savings"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
          <Link href="/chat">
            <Card className="group h-full cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <CardTitle className="text-sm">AI Chat</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  Ask anything about your business data
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}

      {/* ── 4. Financial Trends + Week-to-Week ── */}
      {weeks.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <FinancialTrendCard metrics={metrics} />
          <Card>
            <CardHeader>
              <CardTitle>Week-to-Week Changes</CardTitle>
              <CardDescription>
                {thisWeek && lastWeek
                  ? `${thisWeek.weekLabel} (${thisWeek.days}d) vs ${lastWeek.weekLabel} (${lastWeek.days}d)`
                  : thisWeek
                    ? `${thisWeek.weekLabel} — no prior week to compare`
                    : "No weekly data yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Avg Daily Revenue", delta: revenueDelta },
                { label: "Avg Daily Orders", delta: orderDelta },
                { label: "Average Order Value", delta: aovDelta },
                { label: "Delivery Share", delta: deliveryDelta },
              ].map((item) => {
                const isUp = item.delta.direction === "up";
                const isDown = item.delta.direction === "down";
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span
                      className={`text-sm font-medium ${isUp
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isDown
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        }`}
                    >
                      {item.delta.percentage != null
                        ? `${isUp ? "+" : ""}${item.delta.percentage.toFixed(1)}% ${isUp ? "\u2197" : "\u2198"}`
                        : item.delta.label}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

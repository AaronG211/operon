"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { LoadingAnalysis } from "@/components/shared/loading-analysis";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  AlertTriangle,
  Lightbulb,
  Target,
  FileText,
  MessageSquare,
} from "lucide-react";
import type {
  Restaurant,
  BusinessMetric,
  Report,
  Recommendation,
  Risk,
  Opportunity,
} from "@/types";

function DashboardContent() {
  const searchParams = useSearchParams();
  const restaurantIdParam = searchParams.get("restaurant");
  const shouldGenerate = searchParams.get("generate") === "true";

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [metrics, setMetrics] = useState<BusinessMetric[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let restaurantQuery = supabase.from("restaurants").select("*").eq("owner_id", user.id);
    if (restaurantIdParam) {
      restaurantQuery = restaurantQuery.eq("id", restaurantIdParam);
    }
    const { data: restaurants } = await restaurantQuery
      .order("created_at", { ascending: false })
      .limit(1);

    if (!restaurants?.length) {
      setLoading(false);
      return;
    }

    const rest = restaurants[0] as unknown as Restaurant;
    setRestaurant(rest);

    const { data: metricsData } = await supabase
      .from("business_metrics")
      .select("*")
      .eq("restaurant_id", rest.id)
      .order("period_start", { ascending: false });
    setMetrics((metricsData ?? []) as unknown as BusinessMetric[]);

    const { data: reports } = await supabase
      .from("reports")
      .select("*")
      .eq("restaurant_id", rest.id)
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

      setLoading(false);
    } else if (shouldGenerate) {
      setLoading(false);
      setGenerating(true);
      await generateReport(rest.id);
    } else {
      setLoading(false);
    }
  }

  async function generateReport(restaurantId: string) {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
    setGenerating(false);
  }

  if (loading) {
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

  const latestMetric = metrics[0] as BusinessMetric | undefined;
  const foodCostPct =
    latestMetric?.revenue && latestMetric?.food_cost
      ? ((latestMetric.food_cost / latestMetric.revenue) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-muted-foreground">
            {restaurant.cuisine_type && `${restaurant.cuisine_type} • `}
            {restaurant.location}
          </p>
        </div>
        {!report && (
          <Button onClick={() => generateReport(restaurant.id)}>
            Generate Analysis
          </Button>
        )}
      </div>

      {latestMetric && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${latestMetric.revenue?.toLocaleString() ?? "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestMetric.period_start} - {latestMetric.period_end}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestMetric.orders?.toLocaleString() ?? "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                AOV: ${latestMetric.avg_order_value ?? "N/A"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Food Cost</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {foodCostPct ? `${foodCostPct}%` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                ${latestMetric.food_cost?.toLocaleString() ?? "N/A"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Delivery Share
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestMetric.delivery_share != null
                  ? `${latestMetric.delivery_share}%`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                of total orders
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Top Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(report.risks as Risk[]).slice(0, 3).map((risk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge
                      variant={
                        risk.severity === "high" ? "destructive" : "secondary"
                      }
                      className="mt-0.5 shrink-0"
                    >
                      {risk.severity}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{risk.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {risk.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Top Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(report.opportunities as Opportunity[])
                  .slice(0, 3)
                  .map((opp, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium">{opp.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {opp.description}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Recommendations
              </CardTitle>
              <CardDescription>
                Your most impactful action items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Badge
                      variant={
                        rec.priority === "high" ? "destructive" : "secondary"
                      }
                    >
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline">{rec.effort} effort</Badge>
                  </div>
                </div>
              ))}
              {recommendations.length > 3 && (
                <Link href="/recommendations">
                  <Button variant="outline" className="w-full">
                    View All {recommendations.length} Recommendations
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Link href={`/report/${report.id}`}>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle>Full Report</CardTitle>
                  <CardDescription>
                    View detailed health check analysis
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/recommendations">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <Target className="h-8 w-8 text-primary" />
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Track and manage action items
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/chat">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <CardTitle>AI Chat</CardTitle>
                  <CardDescription>
                    Ask questions about your business
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </>
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

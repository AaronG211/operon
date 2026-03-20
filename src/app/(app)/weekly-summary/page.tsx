"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  Loader2,
} from "lucide-react";

interface WeeklySummary {
  trend: string;
  biggest_issue: string;
  biggest_opportunity: string;
  actions: string[];
  metrics_to_watch: string[];
}

export default function WeeklySummaryPage() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const { current: restaurant, loading: restaurantLoading } = useRestaurant();

  const restaurantId = restaurant?.id ?? null;

  const loadSummary = useCallback(async () => {
    if (!restaurantId) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSummary(null);

    const { data: reports } = await supabase
      .from("reports")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("report_type", "weekly_summary")
      .order("created_at", { ascending: false })
      .limit(1);

    if (reports?.length) {
      setSummary(reports[0].summary as WeeklySummary);
    }
    setLoading(false);
  }, [restaurantId, supabase]);

  const generateSummary = useCallback(async () => {
    if (!restaurantId) return;

    setGenerating(true);

    try {
      const res = await fetch("/api/ai/weekly-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary as WeeklySummary);
      }
    } catch (err) {
      console.error("Failed to generate weekly summary:", err);
    }

    setGenerating(false);
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantLoading) return;

    const timeoutId = window.setTimeout(() => {
      void loadSummary();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSummary, restaurantLoading]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Summary</h1>
          <p className="text-muted-foreground">
            Your business at a glance this week
          </p>
        </div>
        <Button
          onClick={generateSummary}
          disabled={generating || !restaurantId}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Summary"
          )}
        </Button>
      </div>

      {!summary ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No weekly summary yet. Click &quot;Generate Summary&quot; to create one.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Overall Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{summary.trend}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Biggest Issue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{summary.biggest_issue}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Biggest Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{summary.biggest_opportunity}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                {summary.actions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Metrics to Watch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {summary.metrics_to_watch.map((metric, i) => (
                  <li key={i}>{metric}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

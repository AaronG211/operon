"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Recommendation } from "@/types";

const priorityColors: Record<string, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const categoryLabels: Record<string, string> = {
  quick_win: "Quick Win",
  operational: "Operational",
  strategic: "Strategic",
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadRecommendations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadRecommendations() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1);

    if (!restaurants?.length) {
      setLoading(false);
      return;
    }

    const { data: recs } = await supabase
      .from("recommendations")
      .select("*")
      .eq("restaurant_id", restaurants[0].id)
      .order("created_at", { ascending: true });

    setRecommendations((recs ?? []) as unknown as Recommendation[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from("recommendations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: status as Recommendation["status"] } : r
      )
    );
  }

  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === filter);

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
          <h1 className="text-3xl font-bold">Recommendations</h1>
          <p className="text-muted-foreground">
            {recommendations.length} action items from your analysis
          </p>
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="quick_win">Quick Wins</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="strategic">Strategic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted-foreground">
            No recommendations yet. Generate a health check first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => (
            <Card key={rec.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[rec.category] ?? rec.category}
                      </Badge>
                      <Badge variant={priorityColors[rec.priority]}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline">{rec.effort} effort</Badge>
                    </div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {rec.description}
                    </CardDescription>
                  </div>
                  <Select
                    value={rec.status}
                    onValueChange={(v) => v && updateStatus(rec.id, v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Why this matters
                    </p>
                    <p>{rec.reason}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Expected impact
                    </p>
                    <p>{rec.impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

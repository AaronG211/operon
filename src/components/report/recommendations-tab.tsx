"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Recommendation } from "@/types";

const priorityColors: Record<string, "destructive" | "secondary" | "outline"> =
  {
    high: "destructive",
    medium: "secondary",
    low: "outline",
  };

const categoryLabels: Record<string, string> = {
  quick_win: "Quick Win",
  operational: "Operational",
  strategic: "Strategic",
};

interface RecommendationsTabProps {
  initialRecommendations: Recommendation[];
}

export function RecommendationsTab({
  initialRecommendations,
}: RecommendationsTabProps) {
  const [recommendations, setRecommendations] = useState(
    initialRecommendations
  );
  const [filter, setFilter] = useState("all");
  const supabase = useMemo(() => createClient(), []);

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      await supabase
        .from("recommendations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: status as Recommendation["status"] }
            : r
        )
      );
    },
    [supabase]
  );

  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {recommendations.length} action items from this analysis
        </p>
        <div className="flex items-center gap-2">
          <Link href="/chat?q=Turn%20these%20recommendations%20into%20a%20weekly%20execution%20plan">
            <Button size="sm">Ask AI to Prioritize</Button>
          </Link>
          <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
            <SelectTrigger className="w-36">
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
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No recommendations match the current filter.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => (
            <Card key={rec.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[rec.category] ?? rec.category}
                      </Badge>
                      <Badge variant={priorityColors[rec.priority]}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline">{rec.effort} effort</Badge>
                      {rec.data_source && (
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400"
                        >
                          {rec.data_source}
                        </Badge>
                      )}
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
                <div className="grid gap-4 text-sm md:grid-cols-2">
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
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/chat?q=${encodeURIComponent(
                      `How should I execute this recommendation next week: ${rec.title}?`
                    )}`}
                  >
                    <Button variant="outline" size="sm">
                      Ask AI How to Execute
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

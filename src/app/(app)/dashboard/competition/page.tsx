"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompetitionCard } from "@/components/dashboard/competition-card";
import type { Report, CompetitorAnalysis } from "@/types";

export default function CompetitionPage() {
  const router = useRouter();
  const { current: restaurant, loading: restaurantLoading } = useRestaurant();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (restaurantLoading || !restaurant) return;

    async function load() {
      const { data: reports } = await supabase
        .from("reports")
        .select("*")
        .eq("restaurant_id", restaurant!.id)
        .eq("report_type", "health_check")
        .order("created_at", { ascending: false })
        .limit(1);

      if (reports?.length) {
        setReport(reports[0] as unknown as Report);
      }
      setLoading(false);
    }

    void load();
  }, [restaurant, restaurantLoading, supabase]);

  if (restaurantLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const competition = report?.summary?.competition as
    | CompetitorAnalysis
    | undefined;

  if (!competition) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <p className="text-muted-foreground">
          No competition analysis available. Generate a report first.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      <CompetitionCard data={competition} />
    </div>
  );
}

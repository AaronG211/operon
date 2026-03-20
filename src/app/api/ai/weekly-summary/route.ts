import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON } from "@/lib/ai/gemini";
import {
  buildWeeklySummarySystemPrompt,
  buildHealthCheckUserPrompt,
} from "@/lib/ai/prompts";
import { z } from "zod";
import type { Restaurant, BusinessMetric, MenuItem, Review } from "@/types";

const weeklySummarySchema = z.object({
  trend: z.string(),
  biggest_issue: z.string(),
  biggest_opportunity: z.string(),
  actions: z.array(z.string()),
  metrics_to_watch: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: ownedRestaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", restaurantId)
      .eq("owner_id", user.id)
      .single();

    if (!ownedRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const admin = createAdminClient();

    const [
      { data: restaurant },
      { data: metrics },
      { data: menuItems },
      { data: reviews },
    ] = await Promise.all([
      admin.from("restaurants").select("*").eq("id", restaurantId).single(),
      admin
        .from("business_metrics")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("period_start", { ascending: false })
        .limit(4),
      admin.from("menu_items").select("*").eq("restaurant_id", restaurantId),
      admin
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const systemPrompt = buildWeeklySummarySystemPrompt();
    const userPrompt = buildHealthCheckUserPrompt(
      restaurant as Restaurant,
      (metrics ?? []) as BusinessMetric[],
      (menuItems ?? []) as MenuItem[],
      (reviews ?? []) as Review[]
    );

    const summary = await generateJSON(
      systemPrompt,
      userPrompt,
      (text) => weeklySummarySchema.parse(JSON.parse(text))
    );

    // Save as a report
    const { data: report } = await admin
      .from("reports")
      .insert({
        restaurant_id: restaurantId,
        report_type: "weekly_summary",
        summary: summary,
        risks: [],
        opportunities: [],
      })
      .select()
      .single();

    return NextResponse.json({ report, summary });
  } catch (err) {
    console.error("Weekly summary failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}

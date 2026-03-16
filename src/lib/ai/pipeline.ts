import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON } from "./gemini";
import {
  buildHealthCheckSystemPrompt,
  buildHealthCheckUserPrompt,
} from "./prompts";
import { healthCheckResponseSchema } from "@/lib/validators/schemas";
import type {
  Restaurant,
  BusinessMetric,
  MenuItem,
  Review,
  HealthCheckResponse,
} from "@/types";

export async function generateHealthCheck(restaurantId: string) {
  const supabase = createAdminClient();

  // Fetch all data
  const [
    { data: restaurant },
    { data: metrics },
    { data: menuItems },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .single(),
    supabase
      .from("business_metrics")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("period_start", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("reviews")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!restaurant) throw new Error("Restaurant not found");

  const systemPrompt = buildHealthCheckSystemPrompt();
  const userPrompt = buildHealthCheckUserPrompt(
    restaurant as Restaurant,
    (metrics ?? []) as BusinessMetric[],
    (menuItems ?? []) as MenuItem[],
    (reviews ?? []) as Review[]
  );

  // Generate AI analysis
  const healthCheck = await generateJSON<HealthCheckResponse>(
    systemPrompt,
    userPrompt,
    (text) => {
      const parsed = healthCheckResponseSchema.parse(JSON.parse(text));
      return parsed as HealthCheckResponse;
    }
  );

  // Save report
  const { data: report, error: reportErr } = await supabase
    .from("reports")
    .insert({
      restaurant_id: restaurantId,
      report_type: "health_check",
      summary: {
        revenue: healthCheck.revenue,
        margin: healthCheck.margin,
        menu: healthCheck.menu,
        sentiment: healthCheck.sentiment,
      },
      risks: healthCheck.risks,
      opportunities: healthCheck.opportunities,
    })
    .select()
    .single();

  if (reportErr) throw reportErr;

  // Save recommendations
  if (healthCheck.recommendations.length > 0) {
    const { error: recErr } = await supabase.from("recommendations").insert(
      healthCheck.recommendations.map((rec) => ({
        report_id: report.id,
        restaurant_id: restaurantId,
        title: rec.title,
        description: rec.description,
        reason: rec.reason,
        category: rec.category,
        priority: rec.priority,
        effort: rec.effort,
        impact: rec.impact,
        status: "not_started",
      }))
    );
    if (recErr) throw recErr;
  }

  return report;
}

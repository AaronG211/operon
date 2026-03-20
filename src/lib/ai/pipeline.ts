import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON } from "./gemini";
import {
  buildHealthCheckSystemPrompt,
  buildHealthCheckUserPrompt,
} from "./prompts";
import { healthCheckResponseSchema } from "@/lib/validators/schemas";
import { generateLocationAnalysis } from "./location-analysis";
import type {
  Restaurant,
  BusinessMetric,
  MenuItem,
  Review,
  HealthCheckResponse,
  CompetitorAnalysis,
  TargetCustomerAnalysis,
  SupplyRecommendation,
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

  const rest = restaurant as Restaurant;
  const hasLocation = rest.latitude && rest.longitude;

  // Run location analysis first if coordinates are available
  // This is optional — if it fails, we still generate the health check
  let locationData: {
    competition: CompetitorAnalysis;
    targetCustomers: TargetCustomerAnalysis;
    localSupply: SupplyRecommendation;
  } | null = null;

  if (hasLocation) {
    try {
      locationData = await generateLocationAnalysis(restaurantId);
    } catch (err) {
      console.error("Location analysis failed (non-fatal):", err);
    }
  }

  // Build prompts — include location context for better recommendations
  const systemPrompt = buildHealthCheckSystemPrompt(
    locationData?.competition,
    locationData?.targetCustomers
  );
  const userPrompt = buildHealthCheckUserPrompt(
    rest,
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

  // Save report — include location analysis in summary if available
  const summary: Record<string, unknown> = {
    revenue: healthCheck.revenue,
    margin: healthCheck.margin,
    menu: healthCheck.menu,
    sentiment: healthCheck.sentiment,
  };

  if (locationData?.competition) {
    summary.competition = locationData.competition;
  }
  if (locationData?.targetCustomers) {
    summary.target_customers = locationData.targetCustomers;
  }
  if (locationData?.localSupply) {
    summary.local_supply = locationData.localSupply;
  }

  const { data: report, error: reportErr } = await supabase
    .from("reports")
    .insert({
      restaurant_id: restaurantId,
      report_type: "health_check",
      summary,
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
        data_source: rec.data_source,
        status: "not_started",
      }))
    );
    if (recErr) throw recErr;
  }

  return report;
}

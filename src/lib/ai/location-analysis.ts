import { createAdminClient } from "@/lib/supabase/admin";
import { generateWithGrounding, generateJSON } from "./gemini";
import {
  buildCompetitionGroundingSystemPrompt,
  buildCompetitionGroundingUserPrompt,
  buildCompetitionExtractionSystemPrompt,
  buildCompetitionExtractionUserPrompt,
  buildTargetCustomerGroundingSystemPrompt,
  buildTargetCustomerGroundingUserPrompt,
  buildTargetCustomerExtractionSystemPrompt,
  buildTargetCustomerExtractionUserPrompt,
  buildSupplyGroundingSystemPrompt,
  buildSupplyGroundingUserPrompt,
  buildSupplyExtractionSystemPrompt,
  buildSupplyExtractionUserPrompt,
} from "./prompts";
import {
  competitorAnalysisSchema,
  targetCustomerAnalysisSchema,
  supplyRecommendationSchema,
} from "@/lib/validators/schemas";
import { findNearbyCompetitors } from "@/lib/google/places";
import type {
  Restaurant,
  MenuItem,
  CompetitorAnalysis,
  TargetCustomerAnalysis,
  SupplyRecommendation,
} from "@/types";

/**
 * Try grounding (Google Search) first; fall back to a plain generateJSON call
 * that uses only the nearby-places data we already have.
 */
async function groundedOrFallback(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    return await generateWithGrounding(systemPrompt, userPrompt);
  } catch (err) {
    console.warn("Grounding unavailable, falling back to direct generation:", err);
    // Fall back: ask the model without grounding — it still has the nearby
    // places data and restaurant info in the prompt, just no live web search.
    return await generateJSON<string>(
      systemPrompt,
      userPrompt + "\n\nNote: Web search is unavailable. Provide your best analysis based only on the data given above.",
      (text) => text,
      1
    );
  }
}

export async function generateLocationAnalysis(
  restaurantId: string
): Promise<{
  competition: CompetitorAnalysis;
  targetCustomers: TargetCustomerAnalysis;
  localSupply: SupplyRecommendation;
} | null> {
  const supabase = createAdminClient();

  // Fetch restaurant and menu items
  const [{ data: restaurant }, { data: menuItems }] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", restaurantId).single(),
    supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId),
  ]);

  if (!restaurant) throw new Error("Restaurant not found");

  const rest = restaurant as unknown as Restaurant;
  const menu = (menuItems ?? []) as unknown as MenuItem[];

  // Need coordinates for nearby search
  if (!rest.latitude || !rest.longitude) {
    console.log("No coordinates available, skipping location analysis");
    return null;
  }

  // Step 1: Find nearby competitors via Places API
  let nearbyPlaces = await findNearbyCompetitors(rest.latitude, rest.longitude);

  // Filter out our own restaurant from results
  nearbyPlaces = nearbyPlaces.filter(
    (p) => p.name.toLowerCase() !== rest.name.toLowerCase()
  );

  console.log(`Found ${nearbyPlaces.length} nearby competitors for ${rest.name}`);

  // Step 2: Run grounding calls in parallel (with fallback)
  const [competitionGrounded, customerGrounded, supplyGrounded] =
    await Promise.all([
      groundedOrFallback(
        buildCompetitionGroundingSystemPrompt(),
        buildCompetitionGroundingUserPrompt(rest, nearbyPlaces, menu)
      ),
      groundedOrFallback(
        buildTargetCustomerGroundingSystemPrompt(),
        buildTargetCustomerGroundingUserPrompt(rest)
      ),
      groundedOrFallback(
        buildSupplyGroundingSystemPrompt(),
        buildSupplyGroundingUserPrompt(rest, menu)
      ),
    ]);

  // Step 3: Run extraction calls in parallel (JSON mode)
  const [competition, targetCustomers, localSupply] = await Promise.all([
    generateJSON<CompetitorAnalysis>(
      buildCompetitionExtractionSystemPrompt(),
      buildCompetitionExtractionUserPrompt(competitionGrounded, rest, menu),
      (text) => competitorAnalysisSchema.parse(JSON.parse(text))
    ),
    generateJSON<TargetCustomerAnalysis>(
      buildTargetCustomerExtractionSystemPrompt(),
      buildTargetCustomerExtractionUserPrompt(customerGrounded, rest),
      (text) => targetCustomerAnalysisSchema.parse(JSON.parse(text))
    ),
    generateJSON<SupplyRecommendation>(
      buildSupplyExtractionSystemPrompt(),
      buildSupplyExtractionUserPrompt(supplyGrounded, rest, menu),
      (text) => supplyRecommendationSchema.parse(JSON.parse(text))
    ),
  ]);

  return { competition, targetCustomers, localSupply };
}

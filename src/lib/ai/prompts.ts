import type {
  Restaurant,
  BusinessMetric,
  MenuItem,
  Review,
  Report,
  Recommendation,
  CompetitorAnalysis,
  TargetCustomerAnalysis,
} from "@/types";
import type { NearbyCompetitor } from "@/lib/google/places";

export function buildHealthCheckSystemPrompt(
  competitionData?: CompetitorAnalysis | null,
  targetCustomerData?: TargetCustomerAnalysis | null
): string {
  let locationContext = "";

  if (competitionData) {
    locationContext += `\n\nYou also have COMPETITION ANALYSIS data. Use it to make recommendations about pricing relative to competitors, menu differentiation, and competitive positioning. Reference specific competitor names and their prices/ratings.

=== COMPETITION ANALYSIS ===
${JSON.stringify(competitionData, null, 2)}`;
  }

  if (targetCustomerData) {
    locationContext += `\n\nYou also have TARGET CUSTOMER ANALYSIS data. Use it to make recommendations about marketing, menu offerings, hours, and service model based on the local demographics, foot traffic, and nearby facilities. Reference specific facilities and customer segments.

=== TARGET CUSTOMER ANALYSIS ===
${JSON.stringify(targetCustomerData, null, 2)}`;
  }

  return `You are an expert restaurant business consultant with deep experience in restaurant operations, profitability optimization, menu engineering, and customer experience.

You will receive data about a restaurant including financial metrics, menu performance, and customer reviews. Your job is to produce a thorough, specific business health check.
${locationContext}

You MUST respond with valid JSON matching this exact structure:
{
  "revenue": {
    "status": "rising" | "stable" | "declining",
    "analysis": "detailed analysis paragraph",
    "drivers": ["driver 1", "driver 2"]
  },
  "margin": {
    "status": "healthy" | "concerning" | "critical",
    "analysis": "detailed analysis paragraph",
    "concerns": ["concern 1", "concern 2"]
  },
  "menu": {
    "stars": [{"item": "item name", "reason": "why it's a star"}],
    "underperformers": [{"item": "item name", "reason": "why it underperforms"}],
    "pricing_opportunities": ["opportunity 1", "opportunity 2"]
  },
  "sentiment": {
    "overall": "positive" | "mixed" | "negative",
    "positives": ["positive theme 1"],
    "negatives": ["negative theme 1"],
    "analysis": "detailed analysis paragraph"
  },
  "risks": [
    {"title": "risk title", "description": "detailed description", "severity": "high" | "medium" | "low", "data_source": "Reviews" | "Cost & Revenue" | "Menu" | "Competition" | "Target Customers" | "Local Supply"}
  ],
  "opportunities": [
    {"title": "opportunity title", "description": "detailed description", "potential_impact": "expected impact", "data_source": "Reviews" | "Cost & Revenue" | "Menu" | "Competition" | "Target Customers" | "Local Supply"}
  ],
  "recommendations": [
    {
      "title": "action title",
      "description": "what to do",
      "reason": "why this matters, referencing specific data",
      "category": "quick_win" | "operational" | "strategic",
      "priority": "high" | "medium" | "low",
      "effort": "low" | "medium" | "high",
      "impact": "expected business impact",
      "data_source": "Reviews" | "Cost & Revenue" | "Menu" | "Competition" | "Target Customers" | "Local Supply"
    }
  ]
}

Rules:
- Every insight MUST reference specific data from the restaurant (exact numbers, item names, review quotes).
- Provide 3-5 risks, 3-5 opportunities, and 5-10 recommendations.
- Recommendations must be concrete and actionable, not generic advice.
- Every risk, opportunity, and recommendation MUST include a "data_source" field indicating the PRIMARY data source that led to this insight. Use exactly one of: "Reviews", "Cost & Revenue", "Menu", "Competition", "Target Customers", or "Local Supply". Pick the single most relevant source.${competitionData ? "\n- Include 2-3 recommendations specifically about competitive positioning, pricing vs competitors, and menu differentiation." : ""}${targetCustomerData ? "\n- Include 2-3 recommendations specifically about targeting local customer segments, adjusting for foot traffic patterns, and marketing to nearby facilities." : ""}
- If data is insufficient for a section, say so honestly rather than making assumptions.
- Do not invent data that was not provided.`;
}

export function buildHealthCheckUserPrompt(
  restaurant: Restaurant,
  metrics: BusinessMetric[],
  menuItems: MenuItem[],
  reviews: Review[]
): string {
  let prompt = `Restaurant: ${restaurant.name}`;
  if (restaurant.cuisine_type) prompt += `, ${restaurant.cuisine_type}`;
  if (restaurant.location) prompt += `, ${restaurant.location}`;
  prompt += `\nService model: ${restaurant.service_model?.split(",").join(", ") ?? "Not specified"}`;
  if (restaurant.seats) prompt += `, Seats: ${restaurant.seats}`;
  if (restaurant.hours) prompt += `\nHours: ${restaurant.hours}`;

  if (metrics.length > 0) {
    prompt += `\n\n=== FINANCIAL METRICS ===`;
    metrics.forEach((m) => {
      const foodCostPct =
        m.revenue && m.food_cost
          ? ((m.food_cost / m.revenue) * 100).toFixed(1)
          : "N/A";
      const laborCostPct =
        m.revenue && m.labor_cost
          ? ((m.labor_cost / m.revenue) * 100).toFixed(1)
          : "N/A";
      prompt += `\nPeriod: ${m.period_start} to ${m.period_end}`;
      prompt += `\n  Revenue: $${m.revenue?.toLocaleString() ?? "N/A"}`;
      prompt += `, Orders: ${m.orders ?? "N/A"}`;
      prompt += `, AOV: $${m.avg_order_value ?? "N/A"}`;
      prompt += `\n  Food Cost: $${m.food_cost?.toLocaleString() ?? "N/A"} (${foodCostPct}%)`;
      prompt += `, Labor Cost: $${m.labor_cost?.toLocaleString() ?? "N/A"} (${laborCostPct}%)`;
      prompt += `, Fixed Cost: $${m.fixed_cost?.toLocaleString() ?? "N/A"}`;
      prompt += `\n  Delivery Share: ${m.delivery_share ?? "N/A"}%`;
    });
  } else {
    prompt += `\n\n=== FINANCIAL METRICS ===\nNo financial metrics provided.`;
  }

  if (menuItems.length > 0) {
    prompt += `\n\n=== MENU ITEMS (${menuItems.length} items) ===`;
    prompt += `\nItem | Category | Price | Est. Cost | Margin% | Qty Sold`;
    menuItems.forEach((item) => {
      const margin =
        item.estimated_cost != null
          ? (((item.price - item.estimated_cost) / item.price) * 100).toFixed(1)
          : "N/A";
      prompt += `\n${item.item_name} | ${item.category ?? "-"} | $${item.price} | $${item.estimated_cost ?? "N/A"} | ${margin}% | ${item.quantity_sold ?? "N/A"}`;
    });
  } else {
    prompt += `\n\n=== MENU ITEMS ===\nNo menu data provided.`;
  }

  if (reviews.length > 0) {
    const avgRating =
      reviews.filter((r) => r.rating).reduce((sum, r) => sum + (r.rating ?? 0), 0) /
      reviews.filter((r) => r.rating).length;
    prompt += `\n\n=== CUSTOMER REVIEWS (${reviews.length} total, avg rating: ${avgRating.toFixed(1)}) ===`;
    // Cap at 50 reviews
    reviews.slice(0, 50).forEach((r) => {
      const text =
        r.review_text && r.review_text.length > 200
          ? r.review_text.slice(0, 200) + "..."
          : r.review_text;
      prompt += `\n[${r.source ?? "unknown"}] ${r.rating ?? "?"}/5: "${text}"`;
    });
  } else {
    prompt += `\n\n=== CUSTOMER REVIEWS ===\nNo reviews provided.`;
  }

  return prompt;
}

// ─── Competition Analysis Prompts ─────────────────────────────────────────

export function buildCompetitionGroundingSystemPrompt(): string {
  return `You are a competitive intelligence analyst specializing in the restaurant industry. Your job is to research nearby competing restaurants and provide detailed intelligence about each one.

For each competitor, try to find:
- What type of cuisine they serve and their specialty dishes
- Their menu items and approximate pricing
- Their Google rating, review count, and what customers say about them
- Their strengths (what they're known for) and weaknesses (common complaints)
- Their price range and positioning

Also analyze the overall competitive landscape: how saturated is the area, what cuisines are over/under-represented, and where are the gaps.

Be thorough and factual. Clearly state when you're estimating vs. using confirmed data.`;
}

export function buildCompetitionGroundingUserPrompt(
  restaurant: Restaurant,
  nearbyPlaces: NearbyCompetitor[],
  menuItems: MenuItem[]
): string {
  let prompt = `I need competitive intelligence for my restaurant:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine_type || "Not specified"}
- Location: ${restaurant.location || "Not specified"}
- Service: ${restaurant.service_model?.split(",").join(", ") || "Not specified"}`;

  if (menuItems.length > 0) {
    const avgPrice =
      menuItems.reduce((sum, m) => sum + m.price, 0) / menuItems.length;
    prompt += `\n- My avg menu price: $${avgPrice.toFixed(2)}`;
    prompt += `\n- My menu items: ${menuItems.slice(0, 10).map((m) => `${m.item_name} ($${m.price})`).join(", ")}`;
  }

  if (nearbyPlaces.length > 0) {
    prompt += `\n\nNearby restaurants found via Google Maps (within 1.5km):`;
    nearbyPlaces.forEach((p, i) => {
      prompt += `\n${i + 1}. ${p.name} — ${p.address}`;
      if (p.rating) prompt += ` | Rating: ${p.rating}/5`;
      if (p.userRatingCount) prompt += ` (${p.userRatingCount} reviews)`;
      if (p.priceLevel) prompt += ` | Price: ${p.priceLevel}`;
    });
    prompt += `\n\nPlease search the web for detailed info about each of these competitors — their menus, pricing, reviews, and reputation. Then analyze how my restaurant competes.`;
  } else {
    prompt += `\n\nPlease search the web for restaurants near ${restaurant.location || "this location"} and analyze the competitive landscape for a ${restaurant.cuisine_type || ""} restaurant.`;
  }

  return prompt;
}

export function buildCompetitionExtractionSystemPrompt(): string {
  return `You are a data extraction specialist. Extract structured competitive analysis data from the research text provided.

You MUST respond with valid JSON matching this exact structure:
{
  "competitors": [
    {
      "name": "restaurant name",
      "distance": "approximate distance, e.g. '0.3 miles'",
      "cuisine": "cuisine type",
      "price_range": "$ / $$ / $$$ / $$$$",
      "rating": 4.2,
      "review_count": 150,
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1"],
      "menu_highlights": ["dish 1 ($X)", "dish 2 ($Y)"],
      "estimated_avg_price": 15.99
    }
  ],
  "landscape_summary": "2-3 sentence summary of the competitive landscape",
  "pricing_position": "below_market" | "at_market" | "above_market",
  "pricing_analysis": "How the restaurant's pricing compares to competitors",
  "differentiation_gaps": ["gap 1", "gap 2"],
  "competitive_advantages": ["advantage 1", "advantage 2"]
}

Rules:
- Include up to 8 most relevant competitors
- Use null for unknown numeric values
- Be specific with pricing comparisons
- Base pricing_position on actual menu price comparisons when available`;
}

export function buildCompetitionExtractionUserPrompt(
  groundedText: string,
  restaurant: Restaurant,
  menuItems: MenuItem[]
): string {
  let prompt = `Extract structured competitive analysis from this research about competitors near "${restaurant.name}" (${restaurant.cuisine_type || "restaurant"}) at ${restaurant.location || "unknown location"}.`;

  if (menuItems.length > 0) {
    const avgPrice =
      menuItems.reduce((sum, m) => sum + m.price, 0) / menuItems.length;
    prompt += `\n\nOur average menu price: $${avgPrice.toFixed(2)}`;
  }

  prompt += `\n\n=== RESEARCH DATA ===\n${groundedText}`;

  return prompt;
}

// ─── Target Customer Analysis Prompts ─────────────────────────────────────

export function buildTargetCustomerGroundingSystemPrompt(): string {
  return `You are a market research analyst specializing in restaurant location analysis. Your job is to research a specific geographic area and build a target customer profile for a restaurant.

Research and provide:
1. Demographics: What types of people live/work in this area? Income levels, age distribution, household types
2. Nearby facilities: What businesses, schools, offices, shopping centers, transit stops, entertainment venues, hospitals are nearby?
3. Foot traffic patterns: When is this area busiest? What drives foot traffic (commuters, shoppers, students, tourists)?
4. Economic indicators: What is the general spending power and dining-out frequency of people in this area?

Be thorough and factual. Use census data, local business directories, and any available information about the area.`;
}

export function buildTargetCustomerGroundingUserPrompt(
  restaurant: Restaurant
): string {
  return `Research the area around this restaurant for target customer analysis:
- Restaurant: ${restaurant.name}
- Cuisine: ${restaurant.cuisine_type || "Not specified"}
- Location: ${restaurant.location || "Not specified"}
- Coordinates: ${restaurant.latitude}, ${restaurant.longitude}
- Service model: ${restaurant.service_model?.split(",").join(", ") || "Not specified"}
- Seats: ${restaurant.seats ?? "Not specified"}

Please search the web for:
1. Demographics of the neighborhood/area (income, age, population density)
2. Notable businesses, offices, schools, universities within 1 mile
3. Shopping centers, entertainment venues, transit stations nearby
4. Foot traffic patterns and peak hours for this area
5. General dining trends and preferences in this neighborhood`;
}

export function buildTargetCustomerExtractionSystemPrompt(): string {
  return `You are a data extraction specialist. Extract structured target customer analysis from the research text provided.

You MUST respond with valid JSON matching this exact structure:
{
  "demographics": {
    "primary_segments": ["segment 1", "segment 2", "segment 3"],
    "income_level": "low / middle / upper-middle / high / mixed",
    "analysis": "2-3 sentence demographic analysis"
  },
  "foot_traffic": {
    "peak_times": ["weekday lunch 11:30-1:30", "friday/saturday dinner 6-9pm"],
    "patterns": "Description of foot traffic patterns",
    "nearby_drivers": ["driver 1 — estimated daily visitors", "driver 2"]
  },
  "nearby_facilities": [
    {"name": "facility name", "type": "office|school|shopping|transit|residential|entertainment|medical", "estimated_impact": "how it affects the restaurant"}
  ],
  "customer_profile": "2-3 sentence ideal customer profile for this restaurant at this location",
  "underserved_needs": ["need 1", "need 2", "need 3"]
}

Rules:
- Be specific with facility names and types
- Include at least 5-10 nearby facilities
- Foot traffic peak_times should be specific time ranges
- Underserved needs should be actionable opportunities`;
}

export function buildTargetCustomerExtractionUserPrompt(
  groundedText: string,
  restaurant: Restaurant
): string {
  return `Extract structured target customer analysis from this research about the area around "${restaurant.name}" (${restaurant.cuisine_type || "restaurant"}) at ${restaurant.location || "unknown location"}.

=== RESEARCH DATA ===
${groundedText}`;
}

// ─── Local Supply Recommendation Prompts ──────────────────────────────────

export function buildSupplyGroundingSystemPrompt(): string {
  return `You are a restaurant supply chain specialist. Your job is to research local food suppliers, distributors, wholesalers, and farmers markets near a restaurant location.

For each potential supplier, try to find:
- Their exact name and what they supply (produce, proteins, dairy, dry goods, specialty items, etc.)
- Their location / distance from the restaurant
- Whether they offer delivery, minimum order requirements, and pricing tier
- Their reputation and what restaurants they typically serve
- Contact information or website

Also consider:
- Local farmers markets and their schedules
- Restaurant-specific wholesalers (Sysco, US Foods, Restaurant Depot, local alternatives)
- Specialty suppliers for the specific cuisine type
- Direct-from-farm options for freshness and cost savings

Be thorough and factual. Clearly state when you're estimating vs. using confirmed data.`;
}

export function buildSupplyGroundingUserPrompt(
  restaurant: Restaurant,
  menuItems: MenuItem[]
): string {
  let prompt = `I need local supply chain recommendations for my restaurant:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine_type || "Not specified"}
- Location: ${restaurant.location || "Not specified"}
- Coordinates: ${restaurant.latitude}, ${restaurant.longitude}
- Service: ${restaurant.service_model?.split(",").join(", ") || "Not specified"}
- Seats: ${restaurant.seats ?? "Not specified"}`;

  if (menuItems.length > 0) {
    prompt += `\n\nOur menu items (used to determine ingredient needs):`;
    const categories = new Map<string, MenuItem[]>();
    menuItems.forEach((m) => {
      const cat = m.category || "Other";
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(m);
    });
    categories.forEach((items, cat) => {
      prompt += `\n  ${cat}: ${items.map((m) => m.item_name).join(", ")}`;
    });
  }

  prompt += `\n\nPlease search the web for:
1. Food distributors and wholesalers that deliver to ${restaurant.location || "this area"}
2. Local farmers markets near the restaurant
3. Specialty suppliers for ${restaurant.cuisine_type || "restaurant"} cuisine ingredients
4. Produce, protein, dairy, and dry goods suppliers in the area
5. Any restaurant supply stores (e.g., Restaurant Depot) nearby`;

  return prompt;
}

export function buildSupplyExtractionSystemPrompt(): string {
  return `You are a data extraction specialist. Extract structured local supply recommendations from the research text provided.

You MUST respond with valid JSON matching this exact structure:
{
  "ingredient_categories": [
    {
      "category": "Proteins / Produce / Dairy / Dry Goods / Specialty / Beverages",
      "key_items": ["ingredient 1", "ingredient 2"],
      "estimated_weekly_volume": "e.g. 50-100 lbs, 20 cases"
    }
  ],
  "recommended_suppliers": [
    {
      "name": "supplier name",
      "type": "Wholesale / Farm Direct / Specialty / Distributor / Market",
      "distance": "approximate distance from restaurant",
      "specialties": ["what they're known for"],
      "estimated_pricing": "Budget / Competitive / Premium",
      "website_or_contact": "full website URL starting with https:// — always try to provide one",
      "why_recommended": "why this supplier is a good fit for this restaurant",
      "menu_items_served": ["Pad Thai", "Green Curry"]
    }
  ],
  "cost_saving_tips": ["tip 1", "tip 2", "tip 3"],
  "sourcing_strategy": "2-3 sentence overall sourcing strategy recommendation"
}

Rules:
- Recommend 5-10 suppliers, prioritizing local and cost-effective options
- Include at least one option per major ingredient category
- Cost saving tips should be specific and actionable
- Estimate weekly volumes based on restaurant size (seats) and menu complexity
- Include a mix of large distributors and local/specialty options
- IMPORTANT: For "website_or_contact", always provide a full URL (https://...) when available. Only use a phone number as a last resort.
- IMPORTANT: For "menu_items_served", list the specific menu items from the restaurant's menu that this supplier's products would be used in. Match against the actual menu item names provided. Each supplier should list all relevant menu items.`;
}

export function buildSupplyExtractionUserPrompt(
  groundedText: string,
  restaurant: Restaurant,
  menuItems: MenuItem[]
): string {
  let prompt = `Extract structured local supply recommendations from this research for "${restaurant.name}" (${restaurant.cuisine_type || "restaurant"}) at ${restaurant.location || "unknown location"}.`;

  if (restaurant.seats) {
    prompt += `\nRestaurant seats: ${restaurant.seats}`;
  }

  if (menuItems.length > 0) {
    prompt += `\nMenu has ${menuItems.length} items across categories: ${[...new Set(menuItems.map((m) => m.category || "Other"))].join(", ")}`;
    prompt += `\n\nFull menu items (use these EXACT names in menu_items_served):`;
    menuItems.forEach((m) => {
      prompt += `\n- ${m.item_name}${m.category ? ` (${m.category})` : ""}`;
    });
  }

  prompt += `\n\n=== RESEARCH DATA ===\n${groundedText}`;

  return prompt;
}

// ─── Chat & Weekly Summary Prompts ────────────────────────────────────────

export function buildChatSystemPrompt(
  restaurant: Restaurant,
  latestReport: Report | null,
  recommendations: Recommendation[]
): string {
  let prompt = `You are an AI business consultant for "${restaurant.name}". You have already analyzed their business and produced a health check report. Use the following context to answer questions specifically and accurately.

=== RESTAURANT PROFILE ===
Name: ${restaurant.name}
Cuisine: ${restaurant.cuisine_type ?? "Not specified"}
Location: ${restaurant.location ?? "Not specified"}
Service Model: ${restaurant.service_model?.split(",").join(", ") ?? "Not specified"}
Seats: ${restaurant.seats ?? "Not specified"}`;

  if (latestReport) {
    prompt += `\n\n=== LATEST HEALTH CHECK SUMMARY ===
${JSON.stringify(latestReport.summary, null, 2)}

=== RISKS ===
${JSON.stringify(latestReport.risks, null, 2)}

=== OPPORTUNITIES ===
${JSON.stringify(latestReport.opportunities, null, 2)}`;

    // Include competition and target customer data if available
    if (latestReport.summary.competition) {
      prompt += `\n\n=== COMPETITION ANALYSIS ===
${JSON.stringify(latestReport.summary.competition, null, 2)}`;
    }
    if (latestReport.summary.target_customers) {
      prompt += `\n\n=== TARGET CUSTOMER ANALYSIS ===
${JSON.stringify(latestReport.summary.target_customers, null, 2)}`;
    }
  }

  if (recommendations.length > 0) {
    prompt += `\n\n=== CURRENT RECOMMENDATIONS ===`;
    recommendations.forEach((r, i) => {
      prompt += `\n${i + 1}. [${r.status}] ${r.title} - ${r.description} (Priority: ${r.priority}, Effort: ${r.effort})`;
    });
  }

  prompt += `\n\nRules:
- Always ground your answers in the specific data and report findings above.
- If asked about something not covered by the data, say so honestly.
- Be concise but specific. Reference actual numbers and items.
- If the user asks about implementing a recommendation, give step-by-step practical advice.
- If the user asks about competitors or local customers, use the competition and target customer analysis data.
- Do not make up data that was not provided.`;

  return prompt;
}

export function buildWeeklySummarySystemPrompt(): string {
  return `You are an expert restaurant business consultant generating a weekly summary report.

Respond with valid JSON matching this structure:
{
  "trend": "Overall business trend description",
  "biggest_issue": "The most critical issue this period",
  "biggest_opportunity": "The best opportunity to act on",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "metrics_to_watch": ["Metric 1", "Metric 2", "Metric 3"]
}

Be specific and reference actual data provided. Keep each field concise (1-2 sentences max).`;
}

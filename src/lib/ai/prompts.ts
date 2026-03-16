import type {
  Restaurant,
  BusinessMetric,
  MenuItem,
  Review,
  Report,
  Recommendation,
} from "@/types";

export function buildHealthCheckSystemPrompt(): string {
  return `You are an expert restaurant business consultant with deep experience in restaurant operations, profitability optimization, menu engineering, and customer experience.

You will receive data about a restaurant including financial metrics, menu performance, and customer reviews. Your job is to produce a thorough, specific business health check.

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
    {"title": "risk title", "description": "detailed description", "severity": "high" | "medium" | "low"}
  ],
  "opportunities": [
    {"title": "opportunity title", "description": "detailed description", "potential_impact": "expected impact"}
  ],
  "recommendations": [
    {
      "title": "action title",
      "description": "what to do",
      "reason": "why this matters, referencing specific data",
      "category": "quick_win" | "operational" | "strategic",
      "priority": "high" | "medium" | "low",
      "effort": "low" | "medium" | "high",
      "impact": "expected business impact"
    }
  ]
}

Rules:
- Every insight MUST reference specific data from the restaurant (exact numbers, item names, review quotes).
- Provide 3-5 risks, 3-5 opportunities, and 5-10 recommendations.
- Recommendations must be concrete and actionable, not generic advice.
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
  prompt += `\nService model: ${restaurant.service_model}`;
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
Service Model: ${restaurant.service_model}
Seats: ${restaurant.seats ?? "Not specified"}`;

  if (latestReport) {
    prompt += `\n\n=== LATEST HEALTH CHECK SUMMARY ===
${JSON.stringify(latestReport.summary, null, 2)}

=== RISKS ===
${JSON.stringify(latestReport.risks, null, 2)}

=== OPPORTUNITIES ===
${JSON.stringify(latestReport.opportunities, null, 2)}`;
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

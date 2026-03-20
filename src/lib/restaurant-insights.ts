import type {
  BusinessMetric,
  OnboardingData,
  Recommendation,
  Report,
} from "@/types";

const PRIORITY_ORDER: Record<Recommendation["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const EFFORT_ORDER: Record<Recommendation["effort"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export interface OnboardingAssessment {
  validMetrics: number;
  validMenuItems: number;
  validReviews: number;
  hasRequiredBasics: boolean;
  canGenerate: boolean;
  coveragePercent: number;
  confidenceLabel: "low" | "medium" | "high";
  confidenceSummary: string;
  missingRequirements: string[];
  suggestedNextSteps: string[];
}

export interface MetricDelta {
  direction: "up" | "down" | "flat";
  percentage: number | null;
  label: string;
}

export function isValidMetric(metric: OnboardingData["metrics"][number]) {
  return Boolean(metric.period_start && metric.period_end);
}

export function isValidMenuItem(menuItem: OnboardingData["menuItems"][number]) {
  return Boolean(menuItem.item_name.trim() && menuItem.price > 0);
}

export function isValidReview(review: OnboardingData["reviews"][number]) {
  return Boolean(review.review_text?.trim());
}

export function getOnboardingAssessment(
  data: OnboardingData
): OnboardingAssessment {
  const validMetrics = data.metrics.filter(isValidMetric).length;
  const validMenuItems = data.menuItems.filter(isValidMenuItem).length;
  const validReviews = data.reviews.filter(isValidReview).length;
  const hasRequiredBasics = Boolean(
    data.restaurant.name.trim() && data.restaurant.service_model.trim()
  );
  const hasMeaningfulBusinessData =
    validMetrics > 0 || validMenuItems > 0 || validReviews >= 3;

  let coverageScore = 0;
  if (hasRequiredBasics) coverageScore += 30;
  if (validMetrics > 0) coverageScore += validMetrics >= 2 ? 25 : 18;
  if (validMenuItems > 0) coverageScore += validMenuItems >= 5 ? 25 : 18;
  if (validReviews > 0) coverageScore += validReviews >= 5 ? 20 : 12;

  const coveragePercent = Math.min(100, coverageScore);
  const confidenceLabel =
    coveragePercent >= 80 ? "high" : coveragePercent >= 55 ? "medium" : "low";

  const missingRequirements: string[] = [];
  if (!data.restaurant.name.trim()) missingRequirements.push("Restaurant name");
  if (!data.restaurant.service_model.trim()) {
    missingRequirements.push("Service model");
  }
  if (!hasMeaningfulBusinessData) {
    missingRequirements.push(
      "At least one valid metric period, one priced menu item, or 3 reviews"
    );
  }

  const suggestedNextSteps: string[] = [];
  if (validMetrics === 0) {
    suggestedNextSteps.push("Add 1-2 metric periods to unlock revenue and margin analysis");
  }
  if (validMenuItems < 5) {
    suggestedNextSteps.push("Add 5+ menu items to improve menu engineering recommendations");
  }
  if (validReviews < 5) {
    suggestedNextSteps.push("Add 5+ reviews to strengthen sentiment insights");
  }

  const confidenceSummary =
    confidenceLabel === "high"
      ? "High confidence. You have enough depth for specific recommendations."
      : confidenceLabel === "medium"
        ? "Medium confidence. The analysis will work, but more data will sharpen priorities."
        : "Low confidence. The app can generate an initial read, but missing data will limit specificity.";

  return {
    validMetrics,
    validMenuItems,
    validReviews,
    hasRequiredBasics,
    canGenerate: hasRequiredBasics && hasMeaningfulBusinessData,
    coveragePercent,
    confidenceLabel,
    confidenceSummary,
    missingRequirements,
    suggestedNextSteps: suggestedNextSteps.slice(0, 3),
  };
}

export function getTopRecommendations(
  recommendations: Recommendation[],
  limit = 3
) {
  return [...recommendations]
    .sort((left, right) => {
      const priorityDelta =
        PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
      if (priorityDelta !== 0) return priorityDelta;

      const effortDelta =
        EFFORT_ORDER[left.effort] - EFFORT_ORDER[right.effort];
      if (effortDelta !== 0) return effortDelta;

      return left.created_at.localeCompare(right.created_at);
    })
    .slice(0, limit);
}

export function getHealthScore(report: Report) {
  let score = 75;

  if (report.summary.revenue.status === "rising") score += 8;
  if (report.summary.revenue.status === "declining") score -= 6;

  if (report.summary.margin.status === "healthy") score += 10;
  if (report.summary.margin.status === "concerning") score -= 5;
  if (report.summary.margin.status === "critical") score -= 10;

  if (report.summary.sentiment.overall === "positive") score += 6;
  if (report.summary.sentiment.overall === "negative") score -= 4;

  for (const risk of report.risks.slice(0, 3)) {
    if (risk.severity === "high") score -= 4;
    if (risk.severity === "medium") score -= 2;
    if (risk.severity === "low") score -= 1;
  }

  return Math.max(0, Math.min(100, score));
}

export function getHealthLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Stable";
  if (score >= 40) return "At Risk";
  return "Critical";
}

export function getMetricDelta(
  currentValue: number | null | undefined,
  previousValue: number | null | undefined,
  suffix = "vs prior week"
): MetricDelta {
  if (currentValue == null || previousValue == null || previousValue === 0) {
    return {
      direction: "flat",
      percentage: null,
      label: "Not enough data to compare",
    };
  }

  const percentage = ((currentValue - previousValue) / previousValue) * 100;
  const rounded = Math.abs(percentage).toFixed(1);
  const direction =
    percentage > 0 ? "up" : percentage < 0 ? "down" : "flat";
  const prefix =
    direction === "up" ? "+" : direction === "down" ? "-" : "";

  return {
    direction,
    percentage,
    label:
      direction === "flat"
        ? `Flat ${suffix}`
        : `${prefix}${rounded}% ${suffix}`,
  };
}

/** Aggregate daily metrics into ISO weeks (Mon–Sun). Returns sorted oldest→newest. */
export interface WeeklyAggregate {
  weekLabel: string; // e.g. "Mar 10–16"
  revenue: number;
  orders: number;
  food_cost: number;
  labor_cost: number;
  fixed_cost: number;
  delivery_share_avg: number | null;
  days: number;
}

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function fmtWeekLabel(monday: Date, sunday: Date): string {
  const m1 = monday.toLocaleString("en", { month: "short" });
  const m2 = sunday.toLocaleString("en", { month: "short" });
  if (m1 === m2) {
    return `${m1} ${monday.getDate()}–${sunday.getDate()}`;
  }
  return `${m1} ${monday.getDate()}–${m2} ${sunday.getDate()}`;
}

export function getWeeklyAggregates(metrics: BusinessMetric[]): WeeklyAggregate[] {
  const sorted = [...metrics]
    .filter((m) => m.period_start === m.period_end) // daily entries only
    .sort((a, b) => a.period_start.localeCompare(b.period_start));

  const weekMap = new Map<string, WeeklyAggregate>();

  for (const m of sorted) {
    const [y, mo, da] = m.period_start.split("-").map(Number);
    const date = new Date(y, mo - 1, da);
    const monday = getMonday(date);
    const key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

    let week = weekMap.get(key);
    if (!week) {
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      week = {
        weekLabel: fmtWeekLabel(monday, sunday),
        revenue: 0,
        orders: 0,
        food_cost: 0,
        labor_cost: 0,
        fixed_cost: 0,
        delivery_share_avg: null,
        days: 0,
      };
      weekMap.set(key, week);
    }

    week.revenue += m.revenue ?? 0;
    week.orders += m.orders ?? 0;
    week.food_cost += m.food_cost ?? 0;
    week.labor_cost += m.labor_cost ?? 0;
    week.fixed_cost += m.fixed_cost ?? 0;
    if (m.delivery_share != null) {
      week.delivery_share_avg =
        ((week.delivery_share_avg ?? 0) * week.days + m.delivery_share) /
        (week.days + 1);
    }
    week.days += 1;
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

export function getPrimaryIssue(report: Report) {
  return (
    report.risks[0]?.title ||
    report.summary.margin.concerns[0] ||
    report.summary.sentiment.negatives[0] ||
    "No major issue flagged"
  );
}

export function getPrimaryOpportunity(
  report: Report,
  recommendations: Recommendation[]
) {
  return (
    report.opportunities[0]?.title ||
    getTopRecommendations(recommendations, 1)[0]?.title ||
    report.summary.menu.pricing_opportunities[0] ||
    "No major opportunity flagged"
  );
}

export function getEvidenceItems(report: Report) {
  return [
    ...report.summary.revenue.drivers.slice(0, 1),
    ...report.summary.margin.concerns.slice(0, 1),
    ...report.summary.sentiment.negatives.slice(0, 1),
  ].filter(Boolean);
}

export function getRevenueTrend(metrics: BusinessMetric[]) {
  return [...metrics]
    .filter((metric) => metric.revenue != null)
    .sort((left, right) => left.period_start.localeCompare(right.period_start))
    .slice(-6);
}

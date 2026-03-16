export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  cuisine_type: string | null;
  location: string | null;
  service_model: "dine_in" | "takeout" | "delivery" | "hybrid";
  seats: number | null;
  hours: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessMetric {
  id: string;
  restaurant_id: string;
  period_start: string;
  period_end: string;
  revenue: number | null;
  orders: number | null;
  avg_order_value: number | null;
  food_cost: number | null;
  labor_cost: number | null;
  fixed_cost: number | null;
  delivery_share: number | null;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  item_name: string;
  category: string | null;
  price: number;
  estimated_cost: number | null;
  quantity_sold: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  source: string | null;
  review_text: string | null;
  rating: number | null;
  review_date: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  restaurant_id: string;
  report_type: "health_check" | "weekly_summary";
  summary: HealthCheckSummary;
  risks: Risk[];
  opportunities: Opportunity[];
  created_at: string;
}

export interface Recommendation {
  id: string;
  report_id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  reason: string | null;
  category: "quick_win" | "operational" | "strategic";
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  impact: string | null;
  status: "not_started" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  restaurant_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// AI Response Types
export interface HealthCheckSummary {
  revenue: {
    status: "rising" | "stable" | "declining";
    analysis: string;
    drivers: string[];
  };
  margin: {
    status: string;
    analysis: string;
    concerns: string[];
  };
  menu: {
    stars: { item: string; reason: string }[];
    underperformers: { item: string; reason: string }[];
    pricing_opportunities: string[];
  };
  sentiment: {
    overall: "positive" | "mixed" | "negative";
    positives: string[];
    negatives: string[];
    analysis: string;
  };
}

export interface Risk {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface Opportunity {
  title: string;
  description: string;
  potential_impact: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  reason: string;
  category: "quick_win" | "operational" | "strategic";
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  impact: string;
}

export interface HealthCheckResponse {
  revenue: HealthCheckSummary["revenue"];
  margin: HealthCheckSummary["margin"];
  menu: HealthCheckSummary["menu"];
  sentiment: HealthCheckSummary["sentiment"];
  risks: Risk[];
  opportunities: Opportunity[];
  recommendations: AIRecommendation[];
}

// Onboarding types
export interface OnboardingData {
  restaurant: {
    name: string;
    cuisine_type: string;
    location: string;
    service_model: "dine_in" | "takeout" | "delivery" | "hybrid";
    seats: number | null;
    hours: string;
  };
  metrics: Omit<BusinessMetric, "id" | "restaurant_id" | "created_at">[];
  menuItems: Omit<MenuItem, "id" | "restaurant_id" | "created_at">[];
  reviews: Omit<Review, "id" | "restaurant_id" | "created_at">[];
}

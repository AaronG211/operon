export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  cuisine_type: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  service_model: string; // comma-separated: "dine_in,takeout,delivery"
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
  data_source: string | null;
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
export interface CompetitorInfo {
  name: string;
  distance: string;
  cuisine: string;
  price_range: string;
  rating: number | null;
  review_count: number | null;
  strengths: string[];
  weaknesses: string[];
  menu_highlights: string[];
  estimated_avg_price: number | null;
}

export interface CompetitorAnalysis {
  competitors: CompetitorInfo[];
  landscape_summary: string;
  pricing_position: "below_market" | "at_market" | "above_market";
  pricing_analysis: string;
  differentiation_gaps: string[];
  competitive_advantages: string[];
}

export interface TargetCustomerAnalysis {
  demographics: {
    primary_segments: string[];
    income_level: string;
    analysis: string;
  };
  foot_traffic: {
    peak_times: string[];
    patterns: string;
    nearby_drivers: string[];
  };
  nearby_facilities: {
    name: string;
    type: string;
    estimated_impact: string;
  }[];
  customer_profile: string;
  underserved_needs: string[];
}

export interface SupplyRecommendation {
  ingredient_categories: {
    category: string;
    key_items: string[];
    estimated_weekly_volume: string;
  }[];
  recommended_suppliers: {
    name: string;
    type: string;
    distance: string;
    specialties: string[];
    estimated_pricing: string;
    website_or_contact: string;
    why_recommended: string;
    menu_items_served: string[];
  }[];
  cost_saving_tips: string[];
  sourcing_strategy: string;
}

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
  competition?: CompetitorAnalysis;
  target_customers?: TargetCustomerAnalysis;
  local_supply?: SupplyRecommendation;
}

export interface Risk {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  data_source?: string;
}

export interface Opportunity {
  title: string;
  description: string;
  potential_impact: string;
  data_source?: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  reason: string;
  category: "quick_win" | "operational" | "strategic";
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  impact: string;
  data_source: string;
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

// Cost & Revenue calendar entry (used during onboarding)
export interface MetricEntry {
  id: string;
  type: "period" | "daily";
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  itemQuantities: Record<string, number>; // item_name → quantity
  food_cost: number | null;
  labor_cost: number | null;
  fixed_cost: number | null;
  delivery_share: number | null;
}

// Onboarding types
export interface OnboardingData {
  restaurant: {
    name: string;
    cuisine_type: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    service_model: string;
    seats: number | null;
    hours: string;
  };
  metrics: Omit<BusinessMetric, "id" | "restaurant_id" | "created_at">[];
  metricEntries: MetricEntry[];
  menuItems: (Omit<MenuItem, "id" | "restaurant_id" | "created_at" | "estimated_cost" | "quantity_sold"> & { estimated_cost?: number | null; quantity_sold?: number | null })[];
  reviews: Omit<Review, "id" | "restaurant_id" | "created_at">[];
}

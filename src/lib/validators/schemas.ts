import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required").max(200),
  cuisine_type: z.string().optional().default(""),
  location: z.string().optional().default(""),
  service_model: z.enum(["dine_in", "takeout", "delivery", "hybrid"]),
  seats: z.coerce.number().int().positive().optional().nullable(),
  hours: z.string().optional().default(""),
});

export const businessMetricSchema = z.object({
  period_start: z.string().min(1, "Start date is required"),
  period_end: z.string().min(1, "End date is required"),
  revenue: z.coerce.number().nonnegative().nullable(),
  orders: z.coerce.number().int().nonnegative().nullable(),
  avg_order_value: z.coerce.number().nonnegative().nullable(),
  food_cost: z.coerce.number().nonnegative().nullable(),
  labor_cost: z.coerce.number().nonnegative().nullable(),
  fixed_cost: z.coerce.number().nonnegative().nullable(),
  delivery_share: z.coerce.number().min(0).max(100).nullable(),
});

export const menuItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  category: z.string().optional().default(""),
  price: z.coerce.number().positive("Price must be positive"),
  estimated_cost: z.coerce.number().nonnegative().nullable(),
  quantity_sold: z.coerce.number().int().nonnegative().nullable(),
});

export const reviewSchema = z.object({
  source: z.string().optional().default(""),
  review_text: z.string().min(1, "Review text is required"),
  rating: z.coerce.number().min(1).max(5).nullable(),
  review_date: z.string().optional().default(""),
});

export const healthCheckResponseSchema = z.object({
  revenue: z.object({
    status: z.enum(["rising", "stable", "declining"]),
    analysis: z.string(),
    drivers: z.array(z.string()),
  }),
  margin: z.object({
    status: z.string(),
    analysis: z.string(),
    concerns: z.array(z.string()),
  }),
  menu: z.object({
    stars: z.array(z.object({ item: z.string(), reason: z.string() })),
    underperformers: z.array(
      z.object({ item: z.string(), reason: z.string() })
    ),
    pricing_opportunities: z.array(z.string()),
  }),
  sentiment: z.object({
    overall: z.enum(["positive", "mixed", "negative"]),
    positives: z.array(z.string()),
    negatives: z.array(z.string()),
    analysis: z.string(),
  }),
  risks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      severity: z.enum(["high", "medium", "low"]),
    })
  ),
  opportunities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      potential_impact: z.string(),
    })
  ),
  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      reason: z.string(),
      category: z.enum(["quick_win", "operational", "strategic"]),
      priority: z.enum(["high", "medium", "low"]),
      effort: z.enum(["low", "medium", "high"]),
      impact: z.string(),
    })
  ),
});

export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type BusinessMetricInput = z.infer<typeof businessMetricSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type HealthCheckResponseInput = z.infer<
  typeof healthCheckResponseSchema
>;

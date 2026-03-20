/**
 * Demo data for onboarding — Noodle Story Chinese restaurant.
 *
 * Intentionally includes problems so that the AI analysis
 * can surface meaningful risks, opportunities, and recommendations:
 *
 * - High food cost on some items (shaking beef, seafood)
 * - Several underperforming menu items with bad margins
 * - Inconsistent portions and service complaints
 * - Heavy delivery share eating into margins
 * - Some menu items barely selling
 * - Mixed review sentiment (service issues, wait times)
 */

import type { OnboardingData, MetricEntry } from "@/types";
import type {
  MenuItemInput,
  ReviewInput,
  BusinessMetricInput,
} from "@/lib/validators/schemas";

// ─── Step 0: Restaurant Info ───

export const demoRestaurant: OnboardingData["restaurant"] = {
  name: "Noodle Story (For Demo Only)",
  cuisine_type: "Chinese",
  location: "6315 Delmar Blvd, University City, MO 63130",
  latitude: 38.6599,
  longitude: -90.3015,
  service_model: "dine_in,takeout,delivery",
  seats: 45,
  hours:
    "Mon: 11:00AM-9:30PM; Tue: 11:00AM-9:30PM; Wed: 11:00AM-9:30PM; Thu: 11:00AM-10:00PM; Fri: 11:00AM-10:30PM; Sat: 11:30AM-10:30PM; Sun: 11:30AM-9:00PM",
};

// ─── Step 1: Menu Data ───

export const demoMenuItems: MenuItemInput[] = [
  // Noodle Soups — core items
  { item_name: "Beef Noodle Soup (红烧牛肉面)", category: "Noodle Soups", price: 15.95 },
  { item_name: "Spicy Dan Dan Noodles (担担面)", category: "Noodle Soups", price: 13.95 },
  { item_name: "Wonton Noodle Soup (馄饨面)", category: "Noodle Soups", price: 13.95 },
  { item_name: "Tomato Egg Noodle Soup (番茄蛋面)", category: "Noodle Soups", price: 12.95 },

  // Stir-Fried Noodles & Rice
  { item_name: "Pad See Ew (Soy Sauce Noodles)", category: "Stir-Fried", price: 14.95 },
  { item_name: "Yangzhou Fried Rice (扬州炒饭)", category: "Stir-Fried", price: 13.95 },
  { item_name: "Kung Pao Chicken Rice (宫保鸡丁饭)", category: "Stir-Fried", price: 14.95 },
  { item_name: "Mapo Tofu Rice (麻婆豆腐饭)", category: "Stir-Fried", price: 12.95 },

  // Premium Items — high food cost problem
  { item_name: "Cumin Lamb Noodles (孜然羊肉面)", category: "Premium", price: 17.95 },
  { item_name: "Seafood Lo Mein (海鲜捞面)", category: "Premium", price: 18.95 },

  // Appetizers
  { item_name: "Pork Dumplings (猪肉水饺, 10pc)", category: "Appetizers", price: 9.95 },
  { item_name: "Scallion Pancakes (葱油饼)", category: "Appetizers", price: 6.95 },
  { item_name: "Cucumber Salad (拍黄瓜)", category: "Appetizers", price: 5.95 },
  { item_name: "Salt & Pepper Squid (椒盐鱿鱼)", category: "Appetizers", price: 10.95 },
  { item_name: "Seaweed Salad (凉拌海带)", category: "Appetizers", price: 5.95 },

  // Drinks
  { item_name: "Jasmine Tea (茉莉花茶)", category: "Drinks", price: 3.50 },
  { item_name: "Tsingtao Beer", category: "Drinks", price: 5.95 },
  { item_name: "Bubble Milk Tea (珍珠奶茶)", category: "Drinks", price: 5.95 },

  // Dessert — barely sells
  { item_name: "Sesame Balls (芝麻球, 3pc)", category: "Desserts", price: 5.95 },
  { item_name: "Mango Pudding (芒果布丁)", category: "Desserts", price: 4.95 },
];

// ─── Step 2: Cost & Revenue (Daily MetricEntries for ~1 month) ───

function makeEntryId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Approximate daily base quantity by category */
const categoryBaseQty: Record<string, number> = {
  "Noodle Soups": 18,   // core sellers
  "Stir-Fried": 12,
  "Premium": 5,          // expensive, lower volume
  "Appetizers": 10,
  "Drinks": 14,
  "Desserts": 3,         // barely sells
};

/** Build item quantities map from demo menu items with daily variance */
function buildDailyQuantities(dayOfWeek: number): Record<string, number> {
  const q: Record<string, number> = {};
  // Weekend multiplier
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  const mult = isWeekend ? 1.3 : 1.0;

  for (const item of demoMenuItems) {
    const base = categoryBaseQty[item.category ?? ""] ?? 8;
    const daily = Math.round(base * mult * (0.7 + Math.random() * 0.6));
    if (daily > 0) q[item.item_name] = daily;
  }
  return q;
}

/** Generate daily food cost from quantities (~30-40% of revenue as food cost) */
function estimateDailyFoodCost(quantities: Record<string, number>): number {
  let revenue = 0;
  for (const [name, qty] of Object.entries(quantities)) {
    const item = demoMenuItems.find((m) => m.item_name === name);
    if (item) {
      revenue += item.price * qty;
    }
  }
  // Food cost ~30-40% of revenue, with some daily noise
  const foodCostPct = 0.30 + Math.random() * 0.10;
  return Math.round(revenue * foodCostPct);
}

export function getDemoMetricEntries(): MetricEntry[] {
  const entries: MetricEntry[] = [];
  // Generate 30 days of daily entries: today - 29 days → today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dow = d.getDay();
    const quantities = buildDailyQuantities(dow);
    const foodCost = estimateDailyFoodCost(quantities);

    // Labor: ~$350-450/day weekday, ~$450-550 weekend
    const isWeekend = dow === 0 || dow === 5 || dow === 6;
    const laborCost = isWeekend
      ? Math.round(450 + Math.random() * 100)
      : Math.round(350 + Math.random() * 100);

    // Fixed cost: ~$120/day (rent, utilities, insurance spread daily)
    const fixedCost = Math.round(110 + Math.random() * 20);

    // Delivery share: 25-40%
    const deliveryShare = Math.round(25 + Math.random() * 15);

    entries.push({
      id: makeEntryId(),
      type: "daily",
      period_start: dateStr,
      period_end: dateStr,
      itemQuantities: quantities,
      food_cost: foodCost,
      labor_cost: laborCost,
      fixed_cost: fixedCost,
      delivery_share: deliveryShare,
    });
  }

  return entries;
}

/** Convert MetricEntry[] → BusinessMetricInput[] (mirrors cost-revenue-step logic) */
export function entriesToMetrics(entries: MetricEntry[]): BusinessMetricInput[] {
  return entries.map((entry) => {
    let revenue = 0;
    let totalQty = 0;
    for (const [name, qty] of Object.entries(entry.itemQuantities)) {
      if (qty <= 0) continue;
      const item = demoMenuItems.find((m) => m.item_name === name);
      if (item) {
        revenue += item.price * qty;
        totalQty += qty;
      }
    }
    return {
      period_start: entry.period_start,
      period_end: entry.period_end,
      revenue: revenue || null,
      orders: totalQty || null,
      avg_order_value:
        totalQty > 0 ? Math.round((revenue / totalQty) * 100) / 100 : null,
      food_cost: entry.food_cost,
      labor_cost: entry.labor_cost,
      fixed_cost: entry.fixed_cost,
      delivery_share: entry.delivery_share,
    };
  });
}

// ─── Step 3: Reviews ───
// 7 × 5-star, 3 × 2-star, 1 × 1-star
// Dates are relative to today so demo data always looks recent.

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getDemoReviews(): ReviewInput[] {
  return [
    // ──── 5-star reviews (7) ────
    {
      source: "google",
      review_text:
        "Best beef noodle soup in the Delmar Loop! The broth is rich and deeply flavored — you can tell it's been simmered for hours. Generous portions of tender beef. We come here every weekend.",
      rating: 5,
      review_date: daysAgo(3),
    },
    {
      source: "google",
      review_text:
        "The dan dan noodles here are legit — perfectly spicy with great sesame flavor. Scallion pancakes are crispy and fresh. This place is a hidden gem on Delmar.",
      rating: 5,
      review_date: daysAgo(7),
    },
    {
      source: "yelp",
      review_text:
        "Finally a real Chinese noodle shop near Wash U! The pork dumplings are hand-made and you can taste the difference. Jasmine tea is always fresh. Love this place.",
      rating: 5,
      review_date: daysAgo(12),
    },
    {
      source: "google",
      review_text:
        "Yangzhou fried rice is excellent — perfect wok hei flavor. The cucumber salad is refreshing and addictive. Prices are very reasonable for the quality. Fast service too.",
      rating: 5,
      review_date: daysAgo(18),
    },
    {
      source: "yelp",
      review_text:
        "Kung pao chicken rice plate is my go-to lunch. Great balance of spice and flavor. Staff is always friendly. The bubble milk tea is surprisingly good here too!",
      rating: 5,
      review_date: daysAgo(1),
    },
    {
      source: "google",
      review_text:
        "Took my parents here and they said the wonton noodle soup reminded them of home. High praise from Chinese immigrants! Authentic flavors that are hard to find in St. Louis.",
      rating: 5,
      review_date: daysAgo(10),
    },
    {
      source: "google",
      review_text:
        "Great casual spot for noodles. The mapo tofu rice is incredible — numbing and spicy just like Sichuan. Good portion sizes. Will definitely be back.",
      rating: 5,
      review_date: daysAgo(22),
    },

    // ──── 2-star reviews (3) ────
    {
      source: "yelp",
      review_text:
        "Ordered delivery and the noodle soup arrived completely cold with noodles stuck together in a soggy clump. For $16+ with delivery fee this was really disappointing. The packaging needs serious work — broth leaked all over the bag.",
      rating: 2,
      review_date: daysAgo(5),
    },
    {
      source: "google",
      review_text:
        "Waited 35 minutes for our food on a Wednesday night when the restaurant was half empty. When the beef noodle soup finally came, the portion was noticeably smaller than last time. Feeling like quality is slipping.",
      rating: 2,
      review_date: daysAgo(9),
    },
    {
      source: "doordash",
      review_text:
        "The seafood lo mein was basically all noodles with maybe 3 pieces of shrimp and a couple squid rings. $19 for what felt like a $10 dish. Not ordering this again. The cumin lamb was also way too salty.",
      rating: 2,
      review_date: daysAgo(2),
    },

    // ──── 1-star review (1) ────
    {
      source: "yelp",
      review_text:
        "Terrible experience. Server was rude and dismissive when we asked about allergens. Brought wrong dishes to our table twice. The salt and pepper squid was greasy and overcooked. Manager didn't seem to care when we complained. Won't be returning.",
      rating: 1,
      review_date: daysAgo(6),
    },
  ];
}

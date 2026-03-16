import Papa from "papaparse";
import {
  businessMetricSchema,
  menuItemSchema,
  reviewSchema,
} from "@/lib/validators/schemas";
import type { BusinessMetricInput, MenuItemInput, ReviewInput } from "@/lib/validators/schemas";

export interface ParseResult<T> {
  data: T[];
  errors: { row: number; message: string }[];
}

function parseCSV(file: File): Promise<Papa.ParseResult<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject,
    });
  });
}

export async function parseMetricsCSV(
  file: File
): Promise<ParseResult<BusinessMetricInput>> {
  const result = await parseCSV(file);
  const data: BusinessMetricInput[] = [];
  const errors: { row: number; message: string }[] = [];

  result.data.forEach((row, i) => {
    const parsed = businessMetricSchema.safeParse({
      period_start: row.period_start || row.start_date || row["Period Start"],
      period_end: row.period_end || row.end_date || row["Period End"],
      revenue: row.revenue || row.Revenue,
      orders: row.orders || row.Orders,
      avg_order_value: row.avg_order_value || row.aov || row["Avg Order Value"],
      food_cost: row.food_cost || row["Food Cost"],
      labor_cost: row.labor_cost || row["Labor Cost"],
      fixed_cost: row.fixed_cost || row["Fixed Cost"],
      delivery_share: row.delivery_share || row["Delivery Share"],
    });
    if (parsed.success) {
      data.push(parsed.data);
    } else {
      errors.push({
        row: i + 1,
        message: parsed.error.issues.map((e) => e.message).join(", "),
      });
    }
  });

  return { data, errors };
}

export async function parseMenuCSV(
  file: File
): Promise<ParseResult<MenuItemInput>> {
  const result = await parseCSV(file);
  const data: MenuItemInput[] = [];
  const errors: { row: number; message: string }[] = [];

  result.data.forEach((row, i) => {
    const parsed = menuItemSchema.safeParse({
      item_name: row.item_name || row.name || row["Item Name"],
      category: row.category || row.Category,
      price: row.price || row.Price,
      estimated_cost: row.estimated_cost || row.cost || row["Est. Cost"],
      quantity_sold: row.quantity_sold || row.qty || row["Qty Sold"],
    });
    if (parsed.success) {
      data.push(parsed.data);
    } else {
      errors.push({
        row: i + 1,
        message: parsed.error.issues.map((e) => e.message).join(", "),
      });
    }
  });

  return { data, errors };
}

export async function parseReviewsCSV(
  file: File
): Promise<ParseResult<ReviewInput>> {
  const result = await parseCSV(file);
  const data: ReviewInput[] = [];
  const errors: { row: number; message: string }[] = [];

  result.data.forEach((row, i) => {
    const parsed = reviewSchema.safeParse({
      source: row.source || row.Source || row.platform,
      review_text: row.review_text || row.text || row.Review || row.review,
      rating: row.rating || row.Rating,
      review_date: row.review_date || row.date || row.Date,
    });
    if (parsed.success) {
      data.push(parsed.data);
    } else {
      errors.push({
        row: i + 1,
        message: parsed.error.issues.map((e) => e.message).join(", "),
      });
    }
  });

  return { data, errors };
}

export const CSV_TEMPLATES = {
  metrics:
    "period_start,period_end,revenue,orders,avg_order_value,food_cost,labor_cost,fixed_cost,delivery_share\n2024-01-01,2024-01-31,50000,1200,41.67,15000,12000,5000,25",
  menu: "item_name,category,price,estimated_cost,quantity_sold\nPad Thai,Entree,14.99,4.50,320",
  reviews:
    "source,review_text,rating,review_date\ngoogle,Great food and atmosphere!,5,2024-01-15",
};

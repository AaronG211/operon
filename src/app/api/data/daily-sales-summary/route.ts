import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");

  if (!restaurantId || !start || !end) {
    return NextResponse.json(
      { error: "Missing restaurantId, start, or end" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ownership check
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("daily_sales")
    .select("sale_date, quantity, revenue")
    .eq("restaurant_id", restaurantId)
    .gte("sale_date", start)
    .lte("sale_date", end);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const totalOrders = rows.reduce(
    (sum: number, r: { quantity: number }) => sum + (r.quantity ?? 0),
    0
  );
  const totalRevenue = rows.reduce(
    (sum: number, r: { revenue: number | null }) => sum + (r.revenue ?? 0),
    0
  );
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return NextResponse.json({
    orders: totalOrders,
    revenue: Math.round(totalRevenue * 100) / 100,
    avg_order_value: Math.round(avgOrderValue * 100) / 100,
    days_with_data: new Set(rows.map((r: { sale_date: string }) => r.sale_date)).size,
  });
}

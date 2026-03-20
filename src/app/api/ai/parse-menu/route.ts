import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a menu data extraction expert. Extract ALL menu items from the provided image or PDF of a restaurant menu.

For each item, extract:
- item_name: The name of the dish (required)
- category: The category/section it belongs to (e.g. "Appetizers", "Entrees", "Desserts", "Drinks"). If no clear category, use ""
- price: The price as a number (required). If there are multiple sizes/prices, use the standard/regular price
- estimated_cost: Leave as null (we cannot determine cost from a menu)
- quantity_sold: Leave as null (we cannot determine sales from a menu)

Rules:
- Extract EVERY menu item you can see, do not skip any
- If a price is not visible for an item, estimate based on similar items or use 0
- Clean up item names: capitalize properly, remove extra whitespace
- For combo/set menus, treat each as a single item
- Ignore section headers, descriptions, and decorative text — only extract actual orderable items

Return a JSON array of objects. Example:
[
  {"item_name": "Pad Thai", "category": "Noodles", "price": 14.99, "estimated_cost": null, "quantity_sold": null},
  {"item_name": "Tom Yum Soup", "category": "Soups", "price": 8.99, "estimated_cost": null, "quantity_sold": null}
]

Return ONLY the JSON array, no other text.`;

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload a JPG, PNG, WebP, HEIC, or PDF file.",
        },
        { status: 400 }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64,
              },
            },
            {
              text: "Extract all menu items from this menu image/document. Return as a JSON array.",
            },
          ],
        },
      ],
      systemInstruction: {
        role: "model",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temp for more accurate extraction
      },
    });

    const text = result.response.text();
    const items = JSON.parse(text);

    // Validate and clean up the response
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    const cleaned = items.map((item: Record<string, unknown>) => ({
      item_name: String(item.item_name || "").trim(),
      category: String(item.category || "").trim(),
      price: typeof item.price === "number" ? item.price : parseFloat(String(item.price)) || 0,
      estimated_cost: null,
      quantity_sold: null,
    })).filter((item: { item_name: string }) => item.item_name.length > 0);

    return NextResponse.json({ items: cleaned });
  } catch (err) {
    console.error("Menu parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse menu. Please try again or use manual entry." },
      { status: 500 }
    );
  }
}

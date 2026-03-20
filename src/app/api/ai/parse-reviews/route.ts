import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a review data extraction expert. Extract ALL customer reviews visible in the provided screenshot/image.

For each review, extract:
- source: The platform the review is from (e.g. "google", "yelp", "doordash", "ubereats", "tripadvisor", "grubhub", "other"). Infer from the UI design, logos, or text clues. If unclear, use "other"
- review_text: The full text of the review. Copy it exactly as written
- rating: The star rating as a number 1-5. If shown as stars, count them. If no rating visible, use null
- review_date: The date of the review in YYYY-MM-DD format if visible. If only relative (e.g. "2 months ago"), estimate from today's date (2026-03-17). If no date visible, use ""

Rules:
- Extract EVERY review visible in the image — do not skip any
- Preserve the original review text exactly, including typos and emoji
- If a review is partially cut off, extract what is visible and add "..." at the end
- If you see reviewer names, do NOT include them in the output
- For ratings shown as stars (★), count filled stars for the number
- Multiple screenshots may show the same platform — extract all unique reviews

Return a JSON array. Example:
[
  {"source": "google", "review_text": "Amazing pad thai! Best in the city.", "rating": 5, "review_date": "2025-12-15"},
  {"source": "yelp", "review_text": "Food was cold when it arrived...", "rating": 2, "review_date": "2026-01-03"}
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
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "application/pdf",
    ];

    // Build multi-image parts for Gemini
    const imageParts: { inlineData: { mimeType: string; data: string } }[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}. Use JPG, PNG, WebP, HEIC, or PDF.` },
          { status: 400 }
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum 10MB per file.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      imageParts.push({
        inlineData: { mimeType: file.type, data: base64 },
      });
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            {
              text: `Extract all customer reviews from ${files.length > 1 ? "these screenshots" : "this screenshot"}. Return as a JSON array.`,
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
        temperature: 0.2,
      },
    });

    const text = result.response.text();
    const items = JSON.parse(text);

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    const cleaned = items
      .map((item: Record<string, unknown>) => ({
        source: String(item.source || "other").toLowerCase().trim(),
        review_text: String(item.review_text || "").trim(),
        rating:
          typeof item.rating === "number" && item.rating >= 1 && item.rating <= 5
            ? item.rating
            : null,
        review_date: String(item.review_date || "").trim(),
      }))
      .filter((r: { review_text: string }) => r.review_text.length > 0);

    return NextResponse.json({ reviews: cleaned });
  } catch (err) {
    console.error("Review parse error:", err);
    return NextResponse.json(
      { error: "Failed to extract reviews. Please try again or enter manually." },
      { status: 500 }
    );
  }
}

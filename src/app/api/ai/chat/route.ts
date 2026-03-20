import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateStream } from "@/lib/ai/gemini";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import type { Restaurant, Report, Recommendation } from "@/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId, message } = await request.json();

    if (!restaurantId || !message) {
      return NextResponse.json(
        { error: "restaurantId and message are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: ownedRestaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", restaurantId)
      .eq("owner_id", user.id)
      .single();

    if (!ownedRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const admin = createAdminClient();

    // Fetch context
    const [{ data: restaurant }, { data: reports }, { data: chatHistory }] =
      await Promise.all([
      admin.from("restaurants").select("*").eq("id", restaurantId).single(),
      admin
        .from("reports")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("report_type", "health_check")
        .order("created_at", { ascending: false })
        .limit(1),
      admin
        .from("chat_messages")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: true })
        .limit(20),
      ]);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const latestReport = (reports?.[0] as Report) ?? null;
    const { data: recommendations } = latestReport
      ? await admin
          .from("recommendations")
          .select("*")
          .eq("report_id", latestReport.id)
          .order("created_at", { ascending: false })
      : { data: [] as Recommendation[] };

    const systemPrompt = buildChatSystemPrompt(
      restaurant as Restaurant,
      latestReport,
      (recommendations ?? []) as Recommendation[]
    );

    // Build conversation history
    const history = (chatHistory ?? []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      content: msg.content,
    }));
    history.push({ role: "user" as const, content: message });

    // Save user message
    await admin.from("chat_messages").insert({
      restaurant_id: restaurantId,
      role: "user",
      content: message,
    });

    // Generate streaming response
    const stream = await generateStream(systemPrompt, history);

    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }

          // Save assistant message after streaming completes
          await admin.from("chat_messages").insert({
            restaurant_id: restaurantId,
            role: "assistant",
            content: fullResponse,
          });

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Chat failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}

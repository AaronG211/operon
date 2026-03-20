"use client";

import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageSquare, Sparkles, Zap, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "Why did my profit drop?",
  "Which menu items should I promote?",
  "Are my prices too low?",
  "What is the biggest issue in my reviews?",
  "Should I shorten my menu?",
  "Where should I focus this month?",
];

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [latestHealthCheckDate, setLatestHealthCheckDate] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const { current: restaurant, loading: restaurantLoading } = useRestaurant();

  const restaurantId = restaurant?.id ?? null;
  const seededQuestion = searchParams.get("q") ?? "";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadChatContext = useCallback(async () => {
    if (!restaurantId) {
      setAnalysisReady(false);
      setLatestHealthCheckDate(null);
      setMessages([]);
      setInitializing(false);
      return;
    }

    const [{ data: reports }, { data: history }] = await Promise.all([
      supabase
        .from("reports")
        .select("id, created_at")
        .eq("restaurant_id", restaurantId)
        .eq("report_type", "health_check")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("chat_messages")
        .select("role, content")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: true }),
    ]);

    const latestReport = reports?.[0];
    setAnalysisReady(Boolean(latestReport));
    setLatestHealthCheckDate(latestReport?.created_at ?? null);

    if (latestReport && history?.length) {
      setMessages(history as Message[]);
    } else {
      setMessages([]);
    }

    setInitializing(false);
  }, [restaurantId, supabase]);

  useEffect(() => {
    if (restaurantLoading) return;

    const timeoutId = window.setTimeout(() => {
      void loadChatContext();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadChatContext, restaurantLoading]);

  useEffect(() => {
    if (seededQuestion) {
      setInput(seededQuestion);
    }
  }, [seededQuestion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function sendMessage(text: string) {
    if (!text.trim() || !restaurantId || loading || !analysisReady) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          message: text.trim(),
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }

    setLoading(false);
  }

  if (restaurantLoading || initializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Set up your restaurant first to use the AI chat.
        </p>
      </div>
    );
  }

  if (!analysisReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-xl rounded-xl border bg-card p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="text-2xl font-bold">Generate a Health Check First</h2>
          <p className="mt-3 text-muted-foreground">
            Chat works best after Operon has analyzed your latest data. Run a
            health check first, then come back to ask follow-up questions.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href={`/dashboard?restaurant=${restaurantId}`}>
              <Button>Go to Dashboard</Button>
            </Link>
            <Link href="/recommendations">
              <Button variant="outline">Open Recommendations</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <h1 className="text-3xl font-bold">AI Consultant</h1>
        <p className="text-muted-foreground">
          Ask questions grounded in your latest health check
        </p>
        {latestHealthCheckDate && (
          <p className="mt-1 text-xs text-muted-foreground">
            Using analysis from{" "}
            {new Date(latestHealthCheckDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Chat container */}
      <div className="flex flex-1 flex-col min-h-0 rounded-lg border bg-card">
        {/* Scrollable messages area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="mb-6 text-muted-foreground">
                Start a conversation about your restaurant
              </p>
              <div className="grid gap-2 md:grid-cols-2 max-w-lg">
                {suggestedQuestions.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    className="h-auto whitespace-normal text-left text-sm"
                    onClick={() => sendMessage(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {msg.role === "assistant" ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                      <Zap className="h-4 w-4 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      msg.content ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        /* Loading animation while Operon is thinking */
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
                        </div>
                      )
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking indicator when loading but no empty assistant message yet */}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                    <Zap className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed input area at bottom */}
        <div className="shrink-0 border-t bg-card p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your restaurant..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart3,
  MessageSquare,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Upload,
  Sparkles,
  FileText,
  Star,
  DollarSign,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Truck,
  Radar,
} from "lucide-react";
import { AnimateOnScroll } from "@/components/landing/animate-on-scroll";
import { LandingNav } from "@/components/landing/landing-nav";

export default function LandingPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-white font-[Geist,Inter,'Helvetica_Neue',Arial,sans-serif] dark:bg-slate-950">
      {/* ─── 1. Scroll-aware Navigation ─── */}
      <LandingNav />

      {/* ─── 2. Hero Section (ChatSpark style) ─── */}
      <section className="relative bg-white pt-32 pb-20 md:pt-40 md:pb-28 dark:bg-slate-950">
        <div className="relative container mx-auto px-4 text-center md:px-8">
          <h1 className="hero-title mx-auto max-w-4xl text-5xl leading-[1.08] font-extrabold tracking-[-0.02em] text-slate-900 md:text-6xl lg:text-[4.5rem] dark:text-white">
            Meet Operon.
            <br />
            Your AI Restaurant
            <br />
            Consultant. On Demand.
          </h1>
          <p className="hero-subtitle mx-auto mt-8 max-w-xl text-lg text-slate-500 md:text-xl dark:text-slate-400">
            Upload your data, get business health checks, and receive
            profit-driving recommendations. Instantly.
          </p>
          <div className="hero-cta mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-emerald-600 px-10 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30"
              >
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Product Screenshot with gradient wash background (ChatSpark style) */}
          <div className="hero-mockup relative mx-auto mt-20 max-w-5xl">
            {/* Gradient wash behind the screenshot — all sides */}
            <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-200 via-sky-100 to-violet-200 opacity-80 blur-md dark:from-emerald-900/40 dark:via-sky-900/30 dark:to-violet-900/40" />
            <div className="float-glow pointer-events-none absolute -inset-16 -z-20 rounded-[2.5rem] bg-gradient-to-br from-emerald-300/30 via-sky-200/30 to-violet-300/30 blur-3xl" />

            <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-slate-200/60 bg-slate-100/80 px-4 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/80">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="mx-auto text-xs text-slate-400">
                  app.operon.ai/dashboard
                </div>
              </div>
              {/* Dashboard content */}
              <div className="p-5 md:p-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-medium text-slate-500">
                      Health Score
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      78
                      <span className="text-sm font-normal text-slate-400">
                        /100
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                      ↑ Needs attention
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-medium text-slate-500">
                      Avg Daily Revenue
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      $2,847
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                      ↑ 12% vs last week
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-medium text-slate-500">
                      Action Items
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      6
                    </p>
                    <p className="mt-1 text-xs text-amber-600">
                      2 high priority
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="mb-3 text-xs font-medium text-slate-500">
                      Top Recommendations
                    </p>
                    {[
                      "Raise pricing on Truffle Fries (+$2)",
                      "Promote weekday lunch combos",
                      "Address slow service complaints",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="mb-3 text-xs font-medium text-slate-500">
                      AI Chat
                    </p>
                    <div className="space-y-2">
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        What&apos;s causing my food cost to rise?
                      </div>
                      <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                        Your beef items have a 42% food cost ratio — consider
                        renegotiating supplier pricing or adjusting portions...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Social Proof Metrics ─── */}
      <section className="bg-slate-900 py-16 md:py-20 dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: "15 min", label: "Average time to first insight" },
              {
                value: "10+",
                label: "AI-powered analysis features",
              },
              { value: "6+", label: "Actionable items per report" },
              { value: "24/7", label: "AI consultant availability" },
            ].map((stat, i) => (
              <AnimateOnScroll
                key={stat.label}
                animation="fade-up"
                delay={i * 100}
              >
                <p className="text-3xl font-bold text-white md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Platform Features — Left-Right Layout ─── */}
      <section id="features" className="scroll-mt-20 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <AnimateOnScroll animation="fade-up" className="mb-20 text-center">
            <Badge className="mb-4 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400">
              Core Features
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              Everything You Need to Run a{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Smarter Restaurant
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Operon analyzes your data and delivers insights that used to
              require an expensive consultant.
            </p>
          </AnimateOnScroll>

          {/* Feature 1: Health Check — Text Left, Visual Right */}
          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <AnimateOnScroll animation="fade-right">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Business Health Check
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Get a complete diagnosis of revenue trends, margin health, menu
                performance, and customer sentiment — all generated from your
                data in minutes.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Revenue & margin trend analysis",
                  "Menu star items & underperformers",
                  "Customer sentiment breakdown",
                  "Risk identification & alerts",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-left" delay={150}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="space-y-3">
                  <div className="flex items-end gap-3">
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">
                      78
                    </div>
                    <div className="pb-1 text-sm text-slate-400">/100</div>
                    <Badge className="mb-1 ml-auto bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                      Needs Attention
                    </Badge>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Revenue",
                        status: "Rising",
                        color: "text-emerald-600",
                      },
                      {
                        label: "Margins",
                        status: "Stable",
                        color: "text-amber-600",
                      },
                      {
                        label: "Menu",
                        status: "Mixed",
                        color: "text-amber-600",
                      },
                      {
                        label: "Sentiment",
                        status: "Positive",
                        color: "text-emerald-600",
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-lg border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-900"
                      >
                        <p className="text-xs text-slate-500">{m.label}</p>
                        <p className={`text-sm font-semibold ${m.color}`}>
                          {m.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Feature 2: Recommendations — Visual Left, Text Right */}
          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <AnimateOnScroll
              animation="fade-right"
              className="order-2 md:order-1"
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="space-y-3">
                  {[
                    {
                      title: "Raise pricing on Truffle Fries",
                      priority: "High",
                      category: "Quick Win",
                    },
                    {
                      title: "Promote weekday lunch combos",
                      priority: "High",
                      category: "Strategic",
                    },
                    {
                      title: "Address slow service complaints",
                      priority: "Medium",
                      category: "Operational",
                    },
                  ].map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-emerald-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-900"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {rec.title}
                        </p>
                        <p className="text-xs text-slate-500">{rec.category}</p>
                      </div>
                      <Badge
                        className={
                          rec.priority === "High"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        }
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fade-left"
              delay={150}
              className="order-1 md:order-2"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Prioritized Recommendations
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Receive specific, actionable recommendations ranked by impact,
                urgency, and effort. Know exactly what to fix first and why.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Ranked by impact & ease of execution",
                  "Quick wins, operational, and strategic categories",
                  "Track status: not started → in progress → done",
                  "Ask AI how to execute any recommendation",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>

          {/* Feature 3: AI Chat — Text Left, Visual Right */}
          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <AnimateOnScroll animation="fade-right">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                AI Consultant Chat
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Ask follow-up questions in plain English. Get answers grounded in
                your actual numbers, not generic restaurant advice.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Answers based on your actual data",
                  "Plain English — no technical setup",
                  "Generate weekly action plans",
                  "Available 24/7, never calls in sick",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-left" delay={150}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="space-y-3">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-2.5 text-sm text-white">
                    What&apos;s causing my food cost to spike this week?
                  </div>
                  <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Based on your data, your beef items have a 42% food cost
                    ratio — up from 35% last week. I&apos;d recommend checking
                    supplier pricing on ribeye and ground beef.
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-2.5 text-sm text-white">
                    Give me 3 ways to lower it this week
                  </div>
                  <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    1. Reduce Truffle Burger portion by 1oz ($0.85
                    savings/plate)
                    <br />
                    2. Run a chicken special to shift demand
                    <br />
                    3. Negotiate bulk pricing with your beef supplier
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Feature 4: Supply Chain — Visual Left, Text Right */}
          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <AnimateOnScroll
              animation="fade-right"
              className="order-2 md:order-1"
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-3 text-xs font-medium text-slate-500">
                  Supplier Recommendations for Beef (Ribeye)
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: "Valley Fresh Farms",
                      price: "$12.40/lb",
                      distance: "18 mi",
                      save: "Save $1.80/lb",
                      best: true,
                    },
                    {
                      name: "Metro Wholesale",
                      price: "$13.10/lb",
                      distance: "6 mi",
                      save: "Save $1.10/lb",
                      best: false,
                    },
                    {
                      name: "Current: US Foods",
                      price: "$14.20/lb",
                      distance: "24 mi",
                      save: "",
                      best: false,
                    },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className={`flex items-center justify-between rounded-xl border p-4 ${
                        s.best
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-semibold ${s.best ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}
                          >
                            {s.name}
                          </p>
                          {s.best && (
                            <Badge className="bg-emerald-600 text-[10px] text-white">
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {s.price} · {s.distance} away
                        </p>
                      </div>
                      {s.save && (
                        <span className="text-xs font-semibold text-emerald-600">
                          {s.save}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                    💡 Switching to Valley Fresh Farms could save ~$320/week on
                    beef alone, based on your current order volume.
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fade-left"
              delay={150}
              className="order-1 md:order-2"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Supply Chain Intelligence
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Operon recommends better suppliers based on your ingredient
                needs, order volume, and location — so you stop overpaying
                without lifting a finger.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "AI-matched supplier recommendations",
                  "Price comparison across local vendors",
                  "Estimated savings per week calculated automatically",
                  "Alerts when a better deal becomes available",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>

          {/* Feature 5: Competitor Analysis — Text Left, Visual Right */}
          <div className="grid items-center gap-12 md:grid-cols-2">
            <AnimateOnScroll animation="fade-right">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <Radar className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Competitor Intelligence
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                See how you stack up against nearby restaurants. Operon analyzes
                competitor pricing, reviews, and positioning to find your
                strategic advantages and blind spots.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Menu pricing comparison vs competitors",
                  "Review sentiment benchmarking",
                  "Identify gaps in the local market",
                  "Positioning & differentiation insights",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-left" delay={150}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="space-y-3">
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    Your Position vs 4 Nearby Competitors
                  </p>
                  {[
                    {
                      name: "Your Restaurant",
                      avgPrice: "$16.50",
                      rating: "4.3",
                      highlight: true,
                    },
                    {
                      name: "Bella Cucina",
                      avgPrice: "$18.00",
                      rating: "4.5",
                      highlight: false,
                    },
                    {
                      name: "The Grill House",
                      avgPrice: "$15.80",
                      rating: "4.1",
                      highlight: false,
                    },
                    {
                      name: "Sakura Sushi",
                      avgPrice: "$22.00",
                      rating: "4.6",
                      highlight: false,
                    },
                  ].map((comp) => (
                    <div
                      key={comp.name}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                        comp.highlight
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {comp.highlight && (
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                        <div>
                          <p
                            className={`text-sm font-semibold ${comp.highlight ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}
                          >
                            {comp.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Avg entrée: {comp.avgPrice}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {comp.rating}
                      </div>
                    </div>
                  ))}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                    💡 Your pricing is 8% below the area average — there&apos;s
                    room to raise prices on 4 popular items without losing
                    demand.
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ─── 5. How It Works — Dark Section ─── */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-slate-900 py-20 md:py-28"
      >
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          <AnimateOnScroll animation="fade-up" className="mb-16 text-center">
            <Badge className="mb-4 rounded-full border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-400">
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              From Raw Data to Clear Action in{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                3 Steps
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              No complex setup. No integrations. Just the information you already
              have.
            </p>
          </AnimateOnScroll>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: 1,
                icon: Upload,
                title: "Upload Your Data",
                description:
                  "Add your menu, customer reviews, and cost/revenue data. Paste, type, or use our one-click demo to see it in action.",
              },
              {
                step: 2,
                icon: Sparkles,
                title: "AI Analyzes Everything",
                description:
                  "Operon cross-references your menu pricing, cost structure, customer feedback, and revenue trends to find what matters.",
              },
              {
                step: 3,
                icon: TrendingUp,
                title: "Get Your Playbook",
                description:
                  "Receive a health report, ranked recommendations, risk alerts, and an AI chat that can answer any question about your business.",
              },
            ].map((item, i) => (
              <AnimateOnScroll
                key={item.step}
                animation="scale-up"
                delay={i * 150}
              >
                <div className="group relative h-full rounded-2xl border border-slate-800 bg-slate-800/50 p-8 transition-all duration-300 hover:border-emerald-800/50 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/20">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 transition-colors duration-300 group-hover:border-emerald-800">
                      <item.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Data Types ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          <AnimateOnScroll animation="fade-up" className="mb-16 text-center">
            <Badge className="mb-4 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400">
              Data Sources
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              Feed Operon the Data You Already Have
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              No special setup. No integrations. Just the information sitting in
              your spreadsheets and review pages.
            </p>
          </AnimateOnScroll>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: FileText,
                title: "Menu & Pricing",
                description:
                  "Your full menu with item names, prices, and categories.",
              },
              {
                icon: Star,
                title: "Customer Reviews",
                description:
                  "Reviews from Google, Yelp, or anywhere — paste them right in.",
              },
              {
                icon: DollarSign,
                title: "Cost & Revenue",
                description:
                  "Daily sales, food costs, labor costs — whatever you track.",
              },
              {
                icon: MapPin,
                title: "Restaurant Profile",
                description:
                  "Location, cuisine type, hours, service model, and seating.",
              },
            ].map((item, i) => (
              <AnimateOnScroll
                key={item.title}
                animation="fade-up"
                delay={i * 100}
              >
                <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                    <item.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. More Features — Dark Section ─── */}
      <section className="bg-slate-900 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          <AnimateOnScroll animation="fade-up" className="mb-16 text-center">
            <Badge className="mb-4 rounded-full border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-400">
              Ongoing Value
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              More Than a One-Time Report
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Operon keeps working after your first analysis.
            </p>
          </AnimateOnScroll>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Risk Identification",
                description:
                  "Spot margin squeeze, underperforming items, and recurring complaints before they escalate.",
              },
              {
                icon: Calendar,
                title: "Weekly Summaries",
                description:
                  "Get a concise weekly snapshot: trends, biggest issue, biggest opportunity, and 3 actions to take.",
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                description:
                  "Mark recommendations as in-progress or completed. Re-upload data to measure improvement over time.",
              },
            ].map((feature, i) => (
              <AnimateOnScroll
                key={feature.title}
                animation="fade-up"
                delay={i * 120}
              >
                <div className="group rounded-2xl border border-slate-800 bg-slate-800/50 p-8 text-center transition-all duration-300 hover:border-emerald-800/50 hover:-translate-y-1">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 transition-colors duration-300 group-hover:border-emerald-800">
                    <feature.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FAQ ─── */}
      <section id="faq" className="scroll-mt-20 py-20 md:py-28">
        <div className="container mx-auto max-w-3xl px-4 md:px-8">
          <AnimateOnScroll animation="fade-up" className="mb-12 text-center">
            <Badge className="mb-4 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400">
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              Frequently Asked Questions
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100}>
            <Accordion className="w-full">
              <AccordionItem value="data-needed">
                <AccordionTrigger>
                  What data do I need to get started?
                </AccordionTrigger>
                <AccordionContent>
                  At minimum, your menu with prices. For a complete analysis, add
                  customer reviews and daily cost/revenue data. You can always
                  add more later — Operon&apos;s analysis improves as you
                  provide more information.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="how-long">
                <AccordionTrigger>
                  How long does the analysis take?
                </AccordionTrigger>
                <AccordionContent>
                  Your first health report generates in about 2-3 minutes. The
                  AI consultant chat is available immediately after, so you can
                  start asking questions right away.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="security">
                <AccordionTrigger>
                  Is my restaurant data secure?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. Your data is encrypted in transit and at rest. We never
                  share your information with third parties. Each
                  restaurant&apos;s data is fully isolated.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="update-data">
                <AccordionTrigger>
                  Can I update my data and get a new report?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. Upload new data anytime from the Data Workspace to
                  get an updated health check. You&apos;ll see how your metrics
                  have changed week over week.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="restaurant-types">
                <AccordionTrigger>
                  What kind of restaurants does Operon work for?
                </AccordionTrigger>
                <AccordionContent>
                  Operon works for any food service business — from
                  single-location cafes to multi-unit restaurant groups. If you
                  have a menu and customers, Operon can help you find hidden
                  profit opportunities.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── 9. Final CTA ─── */}
      <section className="relative overflow-hidden bg-slate-900 py-20 md:py-28">
        {/* Gradient accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-teal-900/20" />
        <div className="relative container mx-auto max-w-2xl px-4 text-center md:px-8">
          <AnimateOnScroll animation="blur-in">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Stop Guessing.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Start Growing.
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Join restaurant operators who use AI to understand what&apos;s
              hurting profit and what to do about it.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="mt-8 h-12 rounded-xl bg-emerald-600 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-slate-500">
              Free to start &middot; No credit card required
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── 10. Footer ─── */}
      <footer className="border-t border-slate-200 bg-white py-12 md:py-16 dark:border-slate-800 dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Operon
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                AI-powered restaurant consulting.
                <br />
                Smarter decisions, better margins.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Account
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    href="/login"
                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800">
            &copy; {new Date().getFullYear()} Operon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

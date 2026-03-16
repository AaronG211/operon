import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  MessageSquare,
  Target,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Operon</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight">
          Your AI Business Consultant for Running a Smarter Restaurant
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Upload your business data. Get an AI-powered health check, actionable
          recommendations, and an always-on consultant that knows your numbers.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Analyze My Restaurant
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold">
          What Operon Does For You
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <BarChart3 className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Business Health Check</CardTitle>
              <CardDescription>
                Get a complete diagnosis of your revenue, margins, menu
                performance, and customer sentiment — all from your data.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Target className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Prioritized Recommendations</CardTitle>
              <CardDescription>
                Receive 5-10 specific, actionable recommendations ranked by
                impact, urgency, and effort. Know exactly what to fix first.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <MessageSquare className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>AI Consultant Chat</CardTitle>
              <CardDescription>
                Ask follow-up questions about your business. Get answers
                grounded in your actual data, not generic advice.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Track What Works</CardTitle>
              <CardDescription>
                Mark recommendations as in-progress or completed. Upload new
                data to see what improved and what needs attention.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Risk Identification</CardTitle>
              <CardDescription>
                Spot margin squeeze, underperforming items, and recurring
                customer complaints before they become big problems.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Weekly Summaries</CardTitle>
              <CardDescription>
                Get a concise weekly snapshot: trends, biggest issue, biggest
                opportunity, and 3 actions to take this week.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">
            Stop guessing. Start growing.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join restaurant owners who use AI to understand what&apos;s hurting
            profit and what to do next.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-8 text-lg px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Operon. AI-powered restaurant
          consulting.
        </div>
      </footer>
    </div>
  );
}

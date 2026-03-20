import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecommendationsTab } from "@/components/report/recommendations-tab";
import {
  getHealthLabel,
  getHealthScore,
  getPrimaryIssue,
  getPrimaryOpportunity,
  getTopRecommendations,
} from "@/lib/restaurant-insights";

export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Activity,
  Flame,
  Sparkles,
} from "lucide-react";
import type { Recommendation, Report } from "@/types";

function StatusIcon({ status }: { status: string }) {
  if (status === "rising" || status === "healthy" || status === "positive")
    return <TrendingUp className="h-5 w-5 text-green-600" />;
  if (status === "declining" || status === "critical" || status === "negative")
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  return <Minus className="h-5 w-5 text-yellow-600" />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant =
    severity === "high"
      ? "destructive"
      : severity === "medium"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant as "destructive" | "secondary" | "outline"}>
      {severity}
    </Badge>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (!report) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  const typedReport = report as unknown as Report;
  const { summary, risks, opportunities } = typedReport;
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("report_id", typedReport.id)
    .order("created_at", { ascending: true });

  const typedRecommendations = (recommendations ?? []) as Recommendation[];
  const healthScore = getHealthScore(typedReport);
  const healthLabel = getHealthLabel(healthScore);
  const topActions = getTopRecommendations(typedRecommendations, 3);
  const primaryIssue = getPrimaryIssue(typedReport);
  const primaryOpportunity = getPrimaryOpportunity(
    typedReport,
    typedRecommendations
  );

  /* Health score color */
  const scoreColor =
    healthScore >= 80
      ? "#059669"
      : healthScore >= 60
        ? "#d97706"
        : healthScore >= 40
          ? "#ea580c"
          : "#dc2626";
  const scoreColorClass =
    healthScore >= 80
      ? "text-emerald-600"
      : healthScore >= 60
        ? "text-amber-600"
        : healthScore >= 40
          ? "text-orange-600"
          : "text-red-600";
  const scoreBgClass =
    healthScore >= 80
      ? "bg-emerald-50 dark:bg-emerald-950/30"
      : healthScore >= 60
        ? "bg-amber-50 dark:bg-amber-950/30"
        : healthScore >= 40
          ? "bg-orange-50 dark:bg-orange-950/30"
          : "bg-red-50 dark:bg-red-950/30";
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* ── Header banner ── */}
      <div className="rounded-2xl border bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Health Check Report
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              Generated on{" "}
              {new Date(typedReport.created_at).toLocaleDateString()}
            </h1>
          </div>
          <Link href="/chat?q=Turn%20this%20report%20into%20a%20weekly%20operating%20plan">
            <Button className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
              <MessageSquare className="h-4 w-4" />
              Ask AI About This Report
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Health Score with ring */}
        <Card className={`border-0 ${scoreBgClass}`}>
          <CardContent className="flex items-center gap-5 pt-6">
            <div className="relative h-24 w-24 shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48" cy="48" r={radius}
                  fill="none" stroke="currentColor"
                  className="text-black/5 dark:text-white/10"
                  strokeWidth="7"
                />
                <circle
                  cx="48" cy="48" r={radius}
                  fill="none" stroke={scoreColor}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${scoreColorClass}`}>
                  {healthScore}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p className={`mt-0.5 text-lg font-semibold ${scoreColorClass}`}>
                {healthLabel}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">out of 100</p>
            </div>
          </CardContent>
        </Card>

        {/* Biggest Issue */}
        <Card className="border-0 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
              <Flame className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Biggest Issue</p>
              <p className="mt-1 text-sm font-semibold leading-snug">{primaryIssue}</p>
            </div>
          </CardContent>
        </Card>

        {/* Biggest Opportunity */}
        <Card className="border-0 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Biggest Opportunity</p>
              <p className="mt-1 text-sm font-semibold leading-snug">{primaryOpportunity}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Priorities */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Priorities</CardTitle>
          <CardDescription>
            The first things to tackle from this report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {topActions.map((action, index) => (
              <div key={action.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {index + 1}. {action.title}
                  </p>
                  <Badge
                    variant={
                      action.priority === "high" ? "destructive" : "secondary"
                    }
                  >
                    {action.priority}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {action.description}
                </p>
                {action.data_source && (
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Based on:{" "}
                    <span className="font-medium text-muted-foreground">
                      {action.data_source}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">Risks & Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-1.5">
            <ListChecks className="h-3.5 w-3.5" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="margin">Margins</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StatusIcon status={summary.revenue.status} />
                <div>
                  <CardTitle>Revenue Analysis</CardTitle>
                  <CardDescription>
                    Status: {summary.revenue.status}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{summary.revenue.analysis}</p>
              {summary.revenue.drivers.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Key Drivers</h4>
                  <ul className="list-disc space-y-1 pl-5">
                    {summary.revenue.drivers.map((d, i) => (
                      <li key={i} className="text-sm">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margin">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StatusIcon status={summary.margin.status} />
                <div>
                  <CardTitle>Margin Analysis</CardTitle>
                  <CardDescription>
                    Status: {summary.margin.status}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{summary.margin.analysis}</p>
              {summary.margin.concerns.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Concerns</h4>
                  <ul className="list-disc space-y-1 pl-5">
                    {summary.margin.concerns.map((c, i) => (
                      <li key={i} className="text-sm">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Star Items</CardTitle>
                <CardDescription>
                  High-profit, high-demand performers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.menu.stars.length > 0 ? (
                  <ul className="space-y-3">
                    {summary.menu.stars.map((item, i) => (
                      <li key={i}>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.reason}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No star items identified
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Underperformers</CardTitle>
                <CardDescription>Items that may need attention</CardDescription>
              </CardHeader>
              <CardContent>
                {summary.menu.underperformers.length > 0 ? (
                  <ul className="space-y-3">
                    {summary.menu.underperformers.map((item, i) => (
                      <li key={i}>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.reason}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No underperformers identified
                  </p>
                )}
              </CardContent>
            </Card>
            {summary.menu.pricing_opportunities.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Pricing Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-1 pl-5">
                    {summary.menu.pricing_opportunities.map((opp, i) => (
                      <li key={i} className="text-sm">
                        {opp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StatusIcon status={summary.sentiment.overall} />
                <div>
                  <CardTitle>Customer Sentiment</CardTitle>
                  <CardDescription>
                    Overall: {summary.sentiment.overall}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{summary.sentiment.analysis}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium text-green-600">
                    Positive Themes
                  </h4>
                  <ul className="list-disc space-y-1 pl-5">
                    {summary.sentiment.positives.map((p, i) => (
                      <li key={i} className="text-sm">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-red-600">
                    Negative Themes
                  </h4>
                  <ul className="list-disc space-y-1 pl-5">
                    {summary.sentiment.negatives.map((n, i) => (
                      <li key={i} className="text-sm">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Risks
              </h3>
              {risks.map((risk, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{risk.title}</CardTitle>
                      <SeverityBadge severity={risk.severity} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{risk.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Opportunities
              </h3>
              {opportunities.map((opp, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{opp.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{opp.description}</p>
                    <p className="mt-2 text-sm font-medium text-primary">
                      Impact: {opp.potential_impact}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsTab
            initialRecommendations={typedRecommendations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

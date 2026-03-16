import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import type { Report } from "@/types";

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
  return <Badge variant={variant as "destructive" | "secondary" | "outline"}>{severity}</Badge>;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Health Check Report</h1>
        <p className="text-muted-foreground">
          Generated on{" "}
          {new Date(typedReport.created_at).toLocaleDateString()}
        </p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="margin">Margins</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="risks">Risks & Opportunities</TabsTrigger>
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
                  <h4 className="font-medium mb-2">Key Drivers</h4>
                  <ul className="list-disc pl-5 space-y-1">
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
                  <h4 className="font-medium mb-2">Concerns</h4>
                  <ul className="list-disc pl-5 space-y-1">
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
                  <ul className="list-disc pl-5 space-y-1">
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
                  <h4 className="font-medium text-green-600 mb-2">
                    Positive Themes
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {summary.sentiment.positives.map((p, i) => (
                      <li key={i} className="text-sm">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">
                    Negative Themes
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
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
      </Tabs>
    </div>
  );
}

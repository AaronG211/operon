import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BusinessMetric } from "@/types";
import { getRevenueTrend } from "@/lib/restaurant-insights";

interface RevenueTrendCardProps {
  metrics: BusinessMetric[];
  title?: string;
  description?: string;
}

export function RevenueTrendCard({
  metrics,
  title = "Revenue Trend",
  description = "Recent periods, newest on the right",
}: RevenueTrendCardProps) {
  const trend = getRevenueTrend(metrics);
  const maxRevenue = Math.max(...trend.map((metric) => metric.revenue ?? 0), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {trend.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add metric periods to see a revenue trend.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex h-40 items-end gap-3">
              {trend.map((metric, index) => {
                const revenue = metric.revenue ?? 0;
                const height = Math.max(18, (revenue / maxRevenue) * 100);
                const isLatest = index === trend.length - 1;

                return (
                  <div key={metric.id} className="flex flex-1 flex-col items-center gap-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      ${Math.round(revenue).toLocaleString()}
                    </div>
                    <div className="flex h-full w-full items-end rounded-md bg-muted/50 px-1.5 pb-1.5">
                      <div
                        className={`w-full rounded-sm ${
                          isLatest ? "bg-primary" : "bg-primary/40"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="text-center text-[11px] text-muted-foreground">
                      {metric.period_start.slice(5)}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on up to the last 6 recorded periods.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

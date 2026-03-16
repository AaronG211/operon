"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CsvUpload } from "@/components/shared/csv-upload";
import { parseMetricsCSV, CSV_TEMPLATES } from "@/lib/csv/parse";
import { Plus, Trash2 } from "lucide-react";
import type { BusinessMetricInput } from "@/lib/validators/schemas";

interface Props {
  data: BusinessMetricInput[];
  onChange: (data: BusinessMetricInput[]) => void;
}

const emptyMetric: BusinessMetricInput = {
  period_start: "",
  period_end: "",
  revenue: null,
  orders: null,
  avg_order_value: null,
  food_cost: null,
  labor_cost: null,
  fixed_cost: null,
  delivery_share: null,
};

export function MetricsStep({ data, onChange }: Props) {
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  const handleCsvUpload = async (file: File) => {
    const result = await parseMetricsCSV(file);
    if (result.errors.length > 0) {
      setCsvErrors(
        result.errors.map((e) => `Row ${e.row}: ${e.message}`)
      );
    } else {
      setCsvErrors([]);
    }
    if (result.data.length > 0) {
      onChange(result.data);
    }
  };

  const addPeriod = () => onChange([...data, { ...emptyMetric }]);
  const removePeriod = (index: number) =>
    onChange(data.filter((_, i) => i !== index));
  const updatePeriod = (
    index: number,
    field: keyof BusinessMetricInput,
    value: string
  ) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]:
        field === "period_start" || field === "period_end"
          ? value
          : value === ""
            ? null
            : Number(value),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Business Metrics</h2>
        <p className="text-muted-foreground">
          Enter your weekly or monthly financial data. More periods = better
          analysis.
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="mt-4">
          <CsvUpload
            onFileSelect={handleCsvUpload}
            templateCsv={CSV_TEMPLATES.metrics}
            templateName="metrics"
          />
          {csvErrors.length > 0 && (
            <div className="mt-3 space-y-1">
              {csvErrors.map((err, i) => (
                <p key={i} className="text-sm text-destructive">
                  {err}
                </p>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-4 space-y-6">
          {data.map((metric, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">Period {index + 1}</h3>
                {data.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePeriod(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date *</Label>
                  <Input
                    type="date"
                    value={metric.period_start}
                    onChange={(e) =>
                      updatePeriod(index, "period_start", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date *</Label>
                  <Input
                    type="date"
                    value={metric.period_end}
                    onChange={(e) =>
                      updatePeriod(index, "period_end", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Revenue ($)</Label>
                  <Input
                    type="number"
                    value={metric.revenue ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "revenue", e.target.value)
                    }
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Orders</Label>
                  <Input
                    type="number"
                    value={metric.orders ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "orders", e.target.value)
                    }
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Avg Order Value ($)</Label>
                  <Input
                    type="number"
                    value={metric.avg_order_value ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "avg_order_value", e.target.value)
                    }
                    placeholder="41.67"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Food Cost ($)</Label>
                  <Input
                    type="number"
                    value={metric.food_cost ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "food_cost", e.target.value)
                    }
                    placeholder="15000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Labor Cost ($)</Label>
                  <Input
                    type="number"
                    value={metric.labor_cost ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "labor_cost", e.target.value)
                    }
                    placeholder="12000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fixed Cost ($)</Label>
                  <Input
                    type="number"
                    value={metric.fixed_cost ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "fixed_cost", e.target.value)
                    }
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Delivery Share (%)</Label>
                  <Input
                    type="number"
                    value={metric.delivery_share ?? ""}
                    onChange={(e) =>
                      updatePeriod(index, "delivery_share", e.target.value)
                    }
                    placeholder="25"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addPeriod} className="gap-2">
            <Plus className="h-4 w-4" /> Add Period
          </Button>
        </TabsContent>
      </Tabs>

      {data.length > 0 && data[0].period_start && (
        <p className="text-sm text-muted-foreground">
          {data.length} period(s) entered
        </p>
      )}
    </div>
  );
}

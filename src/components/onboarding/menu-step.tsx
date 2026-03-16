"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CsvUpload } from "@/components/shared/csv-upload";
import { parseMenuCSV, CSV_TEMPLATES } from "@/lib/csv/parse";
import { Plus, Trash2 } from "lucide-react";
import type { MenuItemInput } from "@/lib/validators/schemas";

interface Props {
  data: MenuItemInput[];
  onChange: (data: MenuItemInput[]) => void;
}

const emptyItem: MenuItemInput = {
  item_name: "",
  category: "",
  price: 0,
  estimated_cost: null,
  quantity_sold: null,
};

export function MenuStep({ data, onChange }: Props) {
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  const handleCsvUpload = async (file: File) => {
    const result = await parseMenuCSV(file);
    if (result.errors.length > 0) {
      setCsvErrors(result.errors.map((e) => `Row ${e.row}: ${e.message}`));
    } else {
      setCsvErrors([]);
    }
    if (result.data.length > 0) onChange(result.data);
  };

  const addItem = () => onChange([...data, { ...emptyItem }]);
  const removeItem = (index: number) =>
    onChange(data.filter((_, i) => i !== index));
  const updateItem = (
    index: number,
    field: keyof MenuItemInput,
    value: string
  ) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]:
        field === "item_name" || field === "category"
          ? value
          : value === ""
            ? field === "price"
              ? 0
              : null
            : Number(value),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Menu Data</h2>
        <p className="text-muted-foreground">
          Enter your menu items with pricing and sales data for menu performance
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
            templateCsv={CSV_TEMPLATES.menu}
            templateName="menu"
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

        <TabsContent value="manual" className="mt-4 space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-end gap-2 rounded-lg border p-3"
            >
              <div className="flex-1 grid gap-2 md:grid-cols-5">
                <div className="space-y-1">
                  <Label className="text-xs">Item Name *</Label>
                  <Input
                    value={item.item_name}
                    onChange={(e) =>
                      updateItem(index, "item_name", e.target.value)
                    }
                    placeholder="Pad Thai"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Input
                    value={item.category ?? ""}
                    onChange={(e) =>
                      updateItem(index, "category", e.target.value)
                    }
                    placeholder="Entree"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price ($) *</Label>
                  <Input
                    type="number"
                    value={item.price || ""}
                    onChange={(e) =>
                      updateItem(index, "price", e.target.value)
                    }
                    placeholder="14.99"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Est. Cost ($)</Label>
                  <Input
                    type="number"
                    value={item.estimated_cost ?? ""}
                    onChange={(e) =>
                      updateItem(index, "estimated_cost", e.target.value)
                    }
                    placeholder="4.50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qty Sold</Label>
                  <Input
                    type="number"
                    value={item.quantity_sold ?? ""}
                    onChange={(e) =>
                      updateItem(index, "quantity_sold", e.target.value)
                    }
                    placeholder="320"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Menu Item
          </Button>
        </TabsContent>
      </Tabs>

      {data.length > 0 && data[0].item_name && (
        <p className="text-sm text-muted-foreground">
          {data.filter((d) => d.item_name).length} item(s) entered
        </p>
      )}
    </div>
  );
}

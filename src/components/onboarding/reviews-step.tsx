"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CsvUpload } from "@/components/shared/csv-upload";
import { parseReviewsCSV, CSV_TEMPLATES } from "@/lib/csv/parse";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { ReviewInput } from "@/lib/validators/schemas";

interface Props {
  data: ReviewInput[];
  onChange: (data: ReviewInput[]) => void;
}

const emptyReview: ReviewInput = {
  source: "google",
  review_text: "",
  rating: null,
  review_date: "",
};

export function ReviewsStep({ data, onChange }: Props) {
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState("");

  const handleCsvUpload = async (file: File) => {
    const result = await parseReviewsCSV(file);
    if (result.errors.length > 0) {
      setCsvErrors(result.errors.map((e) => `Row ${e.row}: ${e.message}`));
    } else {
      setCsvErrors([]);
    }
    if (result.data.length > 0) onChange(result.data);
  };

  const handleBulkPaste = () => {
    if (!bulkText.trim()) return;
    const reviews = bulkText
      .split("\n\n")
      .filter(Boolean)
      .map((text) => ({
        source: "google",
        review_text: text.trim(),
        rating: null,
        review_date: "",
      }));
    onChange([...data, ...reviews]);
    setBulkText("");
  };

  const addReview = () => onChange([...data, { ...emptyReview }]);
  const removeReview = (index: number) =>
    onChange(data.filter((_, i) => i !== index));
  const updateReview = (
    index: number,
    field: keyof ReviewInput,
    value: string
  ) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]: field === "rating" ? (value ? Number(value) : null) : value,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <p className="text-muted-foreground">
          Paste or upload reviews for customer sentiment analysis. The more
          reviews, the better the insights.
        </p>
      </div>

      <Tabs defaultValue="paste">
        <TabsList>
          <TabsTrigger value="paste">Paste Reviews</TabsTrigger>
          <TabsTrigger value="manual">Individual Entry</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>
              Paste multiple reviews (separate with blank lines)
            </Label>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Great food! The pad thai was amazing and service was quick.

The food was okay but we waited 45 minutes for our order. Very slow service at dinner time.

Best Asian fusion in town. Love the mango sticky rice!`}
              rows={8}
            />
            <Button onClick={handleBulkPaste} disabled={!bulkText.trim()}>
              Add Reviews
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-4 space-y-4">
          {data.map((review, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Review {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReview(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Source</Label>
                  <Select
                    value={review.source || "google"}
                    onValueChange={(v) => v && updateReview(index, "source", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="yelp">Yelp</SelectItem>
                      <SelectItem value="doordash">DoorDash</SelectItem>
                      <SelectItem value="ubereats">UberEats</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rating (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={review.rating ?? ""}
                    onChange={(e) =>
                      updateReview(index, "rating", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={review.review_date}
                    onChange={(e) =>
                      updateReview(index, "review_date", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Review Text *</Label>
                <Textarea
                  value={review.review_text}
                  onChange={(e) =>
                    updateReview(index, "review_text", e.target.value)
                  }
                  rows={2}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addReview} className="gap-2">
            <Plus className="h-4 w-4" /> Add Review
          </Button>
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <CsvUpload
            onFileSelect={handleCsvUpload}
            templateCsv={CSV_TEMPLATES.reviews}
            templateName="reviews"
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
      </Tabs>

      {data.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {data.filter((d) => d.review_text).length} review(s) entered
        </p>
      )}
    </div>
  );
}

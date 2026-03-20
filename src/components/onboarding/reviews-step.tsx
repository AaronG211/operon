"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          Enter your customer reviews. The more reviews, the better the
          insights.
        </p>
      </div>

      <div className="space-y-4">
        {data.map((review, index) => (
          <div key={index} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Review {index + 1}</span>
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
                  onValueChange={(v) =>
                    v && updateReview(index, "source", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="yelp">Yelp</SelectItem>
                    <SelectItem value="doordash">DoorDash</SelectItem>
                    <SelectItem value="ubereats">UberEats</SelectItem>
                    <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                    <SelectItem value="grubhub">Grubhub</SelectItem>
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
      </div>

      {data.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {data.filter((d) => d.review_text).length} review(s) entered
        </p>
      )}
    </div>
  );
}

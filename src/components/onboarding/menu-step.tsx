"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { MenuItemInput } from "@/lib/validators/schemas";

interface Props {
  data: MenuItemInput[];
  onChange: (data: MenuItemInput[]) => void;
}

const emptyItem: MenuItemInput = {
  item_name: "",
  category: "",
  price: 0,
};

export function MenuStep({ data, onChange }: Props) {
  // Photo/PDF upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processMenuFile = useCallback(
    async (file: File) => {
      // Validate
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/pdf",
      ];
      if (!allowed.includes(file.type)) {
        setUploadError(
          "Unsupported file type. Please upload JPG, PNG, WebP, HEIC, or PDF."
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File too large. Maximum 10MB.");
        return;
      }

      // Set preview
      setFileName(file.name);
      setUploadError(null);
      setUploadSuccess(null);

      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }

      // Upload and parse
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/ai/parse-menu", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();

        if (!res.ok) {
          setUploadError(json.error || "Failed to parse menu");
          return;
        }

        if (json.items && json.items.length > 0) {
          onChange(json.items);
          setUploadSuccess(
            `Extracted ${json.items.length} menu item${json.items.length > 1 ? "s" : ""}. You can review and edit them in the Manual Entry tab.`
          );
        } else {
          setUploadError(
            "No menu items could be extracted. Try a clearer photo or use manual entry."
          );
        }
      } catch {
        setUploadError("Network error. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processMenuFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processMenuFile(file);
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
            ? 0
            : Number(value),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Menu Data</h2>
        <p className="text-muted-foreground">
          Enter your menu items with pricing. Cost and sales data will be recorded
          in the next step.
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="photo" className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Photo / PDF
          </TabsTrigger>
        </TabsList>

        {/* ─── Photo / PDF Upload ─── */}
        <TabsContent value="photo" className="mt-4">
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8
                transition-colors cursor-pointer
                ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
                ${uploading ? "pointer-events-none opacity-60" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <div className="text-center">
                    <p className="font-medium">AI is reading your menu...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few seconds
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      Drop your menu photo or PDF here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse — JPG, PNG, WebP, HEIC, PDF up to 10MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Choose File
                  </Button>
                </>
              )}
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3" />
                  {fileName}
                </div>
                <div className="relative max-h-[300px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Menu preview"
                    className="w-full object-contain max-h-[300px]"
                  />
                </div>
              </div>
            )}

            {/* PDF file name (no preview) */}
            {fileName && !previewUrl && !uploading && (
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{fileName}</span>
              </div>
            )}

            {/* Success */}
            {uploadSuccess && (
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {uploadSuccess}
                </p>
              </div>
            )}

            {/* Error */}
            {uploadError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{uploadError}</p>
              </div>
            )}

            {/* How it works */}
            <div className="rounded-lg bg-muted/40 p-4 space-y-2">
              <p className="text-sm font-medium">How it works</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Upload a photo or PDF of your menu</li>
                <li>AI extracts item names, categories, and prices</li>
                <li>Review and edit extracted items in the Manual Entry tab</li>
                <li>Add cost and sales data manually for deeper analysis</li>
              </ol>
            </div>
          </div>
        </TabsContent>

        {/* ─── Manual Entry ─── */}
        <TabsContent value="manual" className="mt-4 space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-end gap-2 rounded-lg border p-3"
            >
              <div className="flex-1 grid gap-2 md:grid-cols-3">
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

"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X, Download } from "lucide-react";

interface CsvUploadProps {
  onFileSelect: (file: File) => void;
  templateCsv: string;
  templateName: string;
  accept?: string;
}

export function CsvUpload({
  onFileSelect,
  templateCsv,
  templateName,
  accept = ".csv",
}: CsvUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateName}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <Card
        className={`relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`csv-input-${templateName}`)?.click()}
      >
        <input
          id={`csv-input-${templateName}`}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
        {fileName ? (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
              }}
              className="ml-2 rounded-full p-1 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop a CSV file, or click to browse
            </p>
          </>
        )}
      </Card>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadTemplate}
        className="gap-2"
      >
        <Download className="h-3 w-3" />
        Download CSV Template
      </Button>
    </div>
  );
}

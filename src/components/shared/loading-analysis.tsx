"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, DollarSign, UtensilsCrossed, MessageSquare } from "lucide-react";

const stages = [
  { label: "Analyzing revenue trends...", icon: DollarSign },
  { label: "Evaluating cost structure...", icon: BarChart3 },
  { label: "Assessing menu performance...", icon: UtensilsCrossed },
  { label: "Processing customer sentiment...", icon: MessageSquare },
  { label: "Generating recommendations...", icon: BarChart3 },
];

export function LoadingAnalysis() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 8;
      });
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold">Analyzing Your Business</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI is reviewing your data to generate personalized insights
              </p>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="space-y-3">
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = i === currentStage;
                const isDone = i < currentStage;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg p-2 transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : isDone
                          ? "text-muted-foreground"
                          : "text-muted-foreground/40"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />
                    <span className="text-sm">{stage.label}</span>
                    {isDone && <span className="ml-auto text-xs">Done</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

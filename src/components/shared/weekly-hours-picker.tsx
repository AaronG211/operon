"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DaySchedule {
  open: boolean;
  start: string; // "HH:MM" 24h format
  end: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const DAYS: { key: keyof WeeklySchedule; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

function formatTime12(time24: string): string {
  if (time24 === "24:00") return "12:00 AM";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

function timeToPercent(time: string): number {
  if (time === "24:00") return 100;
  const [h, m] = time.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * 100;
}

function percentToTime(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  const totalMinutes = Math.round((clamped / 100) * 24 * 60);
  // Snap to 15-min increments
  const snapped = Math.round(totalMinutes / 15) * 15;
  if (snapped >= 24 * 60) return "24:00";
  const h = Math.floor(snapped / 60);
  const m = snapped % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { open: true, start: "09:00", end: "21:00" },
  tuesday: { open: true, start: "09:00", end: "21:00" },
  wednesday: { open: true, start: "09:00", end: "21:00" },
  thursday: { open: true, start: "09:00", end: "21:00" },
  friday: { open: true, start: "09:00", end: "21:00" },
  saturday: { open: true, start: "09:00", end: "21:00" },
  sunday: { open: true, start: "09:00", end: "21:00" },
};

export function parseHoursToSchedule(hours: string): WeeklySchedule {
  if (!hours) return DEFAULT_SCHEDULE;

  try {
    const parsed = JSON.parse(hours);
    if (parsed && typeof parsed === "object" && "monday" in parsed) {
      return parsed as WeeklySchedule;
    }
  } catch {
    // Not JSON, it's a legacy text string — return defaults
  }

  return DEFAULT_SCHEDULE;
}

export function scheduleToString(schedule: WeeklySchedule): string {
  return JSON.stringify(schedule);
}

export function scheduleToReadable(schedule: WeeklySchedule): string {
  const openDays = DAYS.filter((d) => schedule[d.key].open);
  if (openDays.length === 0) return "Hours not set";

  // Group consecutive days with same hours
  const groups: { days: string[]; start: string; end: string }[] = [];
  for (const d of openDays) {
    const s = schedule[d.key];
    const last = groups[groups.length - 1];
    if (last && last.start === s.start && last.end === s.end) {
      last.days.push(d.short);
    } else {
      groups.push({ days: [d.short], start: s.start, end: s.end });
    }
  }

  return groups
    .map((g) => {
      const dayRange =
        g.days.length > 2
          ? `${g.days[0]}-${g.days[g.days.length - 1]}`
          : g.days.join(", ");
      return `${dayRange} ${formatTime12(g.start)}-${formatTime12(g.end)}`;
    })
    .join(" | ");
}

interface WeeklyHoursPickerProps {
  value: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
}

// Minimum bar width in percent (1 hour)
const MIN_DURATION_PCT = (60 / (24 * 60)) * 100;

export function WeeklyHoursPicker({ value, onChange }: WeeklyHoursPickerProps) {
  const updateDay = useCallback(
    (day: keyof WeeklySchedule, updates: Partial<DaySchedule>) => {
      onChange({
        ...value,
        [day]: { ...value[day], ...updates },
      });
    },
    [value, onChange]
  );

  const toggleDay = useCallback(
    (day: keyof WeeklySchedule) => {
      updateDay(day, { open: !value[day].open });
    },
    [value, updateDay]
  );

  return (
    <div className="space-y-3">
      {/* Schedule grid */}
      <div className="rounded-lg border bg-card">
        {/* Time axis header */}
        <div className="flex items-center border-b px-2 py-1.5">
          <div className="w-20 shrink-0" />
          <div className="relative flex-1 flex justify-between text-[10px] text-muted-foreground px-0.5">
            <span>12AM</span>
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
            <span>12AM</span>
          </div>
          <div className="w-[180px] shrink-0" />
        </div>

        {DAYS.map((day, idx) => {
          const schedule = value[day.key];

          return (
            <div
              key={day.key}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 transition-colors",
                idx < DAYS.length - 1 && "border-b",
                schedule.open ? "bg-background" : "bg-muted/30"
              )}
            >
              {/* Day toggle */}
              <button
                type="button"
                onClick={() => toggleDay(day.key)}
                className={cn(
                  "w-20 shrink-0 text-left text-sm font-medium transition-colors rounded px-1.5 py-0.5",
                  schedule.open ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.short}</span>
              </button>

              {/* Draggable time bar */}
              {schedule.open ? (
                <DraggableTimeBar
                  start={schedule.start}
                  end={schedule.end}
                  onChangeStart={(t) => updateDay(day.key, { start: t })}
                  onChangeEnd={(t) => updateDay(day.key, { end: t })}
                  onMove={(s, e) => updateDay(day.key, { start: s, end: e })}
                />
              ) : (
                <div className="relative flex-1 h-8 rounded bg-muted/50 overflow-hidden">
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[10px] text-muted-foreground">
                      Closed
                    </span>
                  </div>
                </div>
              )}

              {/* Right side: time display or set hours button */}
              <div className="w-[180px] shrink-0 flex items-center gap-1.5">
                {schedule.open ? (
                  <>
                    <span className="text-xs font-medium tabular-nums">
                      {formatTime12(schedule.start)}
                    </span>
                    <span className="text-xs text-muted-foreground">—</span>
                    <span className="text-xs font-medium tabular-nums">
                      {formatTime12(schedule.end)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                      title="Set as closed"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDay(day.key)}
                    className="text-xs h-7"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Set Hours
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Readable summary */}
      {DAYS.some((d) => value[d.key].open) && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {scheduleToReadable(value)}
        </p>
      )}
    </div>
  );
}

// ─── Draggable Time Bar ─────────────────────────────────────────────────────

interface DraggableTimeBarProps {
  start: string;
  end: string;
  onChangeStart: (time: string) => void;
  onChangeEnd: (time: string) => void;
  onMove: (start: string, end: string) => void;
}

type DragTarget = "start" | "end" | "bar" | null;

function DraggableTimeBar({
  start,
  end,
  onChangeStart,
  onChangeEnd,
  onMove,
}: DraggableTimeBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    target: DragTarget;
    startX: number;
    startPct: number;
    endPct: number;
  } | null>(null);

  const startPct = timeToPercent(start);
  const endPct = timeToPercent(end);

  const getPercentFromEvent = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, target: DragTarget) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      dragRef.current = {
        target,
        startX: e.clientX,
        startPct,
        endPct,
      };
    },
    [startPct, endPct]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;

      const currentPct = getPercentFromEvent(e.clientX);
      const { target, startPct: origStart, endPct: origEnd } = dragRef.current;
      const origStartX = getPercentFromEvent(dragRef.current.startX);
      const delta = currentPct - origStartX;

      if (target === "start") {
        const newStart = Math.max(0, Math.min(origEnd - MIN_DURATION_PCT, origStart + delta));
        onChangeStart(percentToTime(newStart));
      } else if (target === "end") {
        const newEnd = Math.min(100, Math.max(origStart + MIN_DURATION_PCT, origEnd + delta));
        onChangeEnd(percentToTime(newEnd));
      } else if (target === "bar") {
        const duration = origEnd - origStart;
        let newStart = origStart + delta;
        let newEnd = origEnd + delta;

        // Clamp to bounds
        if (newStart < 0) {
          newStart = 0;
          newEnd = duration;
        }
        if (newEnd > 100) {
          newEnd = 100;
          newStart = 100 - duration;
        }

        onMove(percentToTime(newStart), percentToTime(newEnd));
      }
    },
    [getPercentFromEvent, onChangeStart, onChangeEnd, onMove]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      ref={trackRef}
      className="relative flex-1 h-8 rounded bg-muted/50 cursor-default select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Hour grid lines */}
      {[6, 12, 18].map((h) => (
        <div
          key={h}
          className="absolute top-0 bottom-0 w-px bg-border/40"
          style={{ left: `${(h / 24) * 100}%` }}
        />
      ))}

      {/* Active bar (draggable middle) */}
      <div
        className="absolute top-1 bottom-1 rounded bg-primary/80 cursor-grab active:cursor-grabbing transition-colors hover:bg-primary/90"
        style={{
          left: `${startPct}%`,
          width: `${Math.max(endPct - startPct, 1)}%`,
        }}
        onPointerDown={(e) => handlePointerDown(e, "bar")}
      />

      {/* Left handle (start time) */}
      <div
        className="absolute top-0 bottom-0 w-3 cursor-ew-resize z-10 group"
        style={{ left: `calc(${startPct}% - 4px)` }}
        onPointerDown={(e) => handlePointerDown(e, "start")}
      >
        <div className="absolute left-1 top-1.5 bottom-1.5 w-1 rounded-full bg-primary-foreground/80 group-hover:bg-white transition-colors" />
      </div>

      {/* Right handle (end time) */}
      <div
        className="absolute top-0 bottom-0 w-3 cursor-ew-resize z-10 group"
        style={{ left: `calc(${endPct}% - 8px)` }}
        onPointerDown={(e) => handlePointerDown(e, "end")}
      >
        <div className="absolute right-1 top-1.5 bottom-1.5 w-1 rounded-full bg-primary-foreground/80 group-hover:bg-white transition-colors" />
      </div>
    </div>
  );
}

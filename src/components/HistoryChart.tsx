"use client";

import { useState } from "react";
import type { HistoryDay } from "@/lib/api";

const SERIES = [
  { key: "youtube" as const, label: "YouTube Shorts", colorVar: "var(--series-yt)" },
  { key: "instagram" as const, label: "Insta Reels", colorVar: "var(--series-ig)" },
];

const CHART_HEIGHT = 180;

function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HistoryChart({ history }: { history: HistoryDay[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(1, ...history.map((d) => d.total));
  const labelEvery = Math.max(1, Math.ceil(history.length / 7));

  return (
    <div>
      {/* legend */}
      <div className="mb-4 flex items-center gap-5">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-xs text-secondary">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: s.colorVar }}
            />
            {s.label}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted">max {max}/day</span>
      </div>

      {/* bars */}
      <div
        className="relative flex items-end gap-1.5"
        style={{ height: CHART_HEIGHT }}
        onMouseLeave={() => setHovered(null)}
      >
        {history.map((day, i) => (
          <div
            key={day.date}
            className="group relative flex h-full flex-1 cursor-default flex-col items-stretch justify-end"
            onMouseEnter={() => setHovered(i)}
          >
            {/* hover hit area highlight */}
            <div
              className={`pointer-events-none absolute inset-x-0 inset-y-0 rounded-lg transition ${
                hovered === i ? "bg-white/5" : ""
              }`}
            />
            {/* stacked segments: instagram on top of youtube, 2px surface gap */}
            {day.instagram > 0 && (
              <div
                className="w-full"
                style={{
                  height: Math.max(4, (day.instagram / max) * (CHART_HEIGHT - 20)),
                  background: "var(--series-ig)",
                  borderRadius: "999px 999px 3px 3px",
                  marginBottom: day.youtube > 0 ? 3 : 0,
                }}
              />
            )}
            {day.youtube > 0 && (
              <div
                className="w-full"
                style={{
                  height: Math.max(4, (day.youtube / max) * (CHART_HEIGHT - 20)),
                  background: "var(--series-yt)",
                  borderRadius: day.instagram > 0 ? "3px" : "999px 999px 3px 3px",
                }}
              />
            )}
            {day.total === 0 && <div className="h-[3px] w-full rounded-full bg-surface-2" />}

            {/* tooltip */}
            {hovered === i && (
              <div className="pointer-events-none absolute -top-1 left-1/2 z-10 w-max -translate-x-1/2 -translate-y-full rounded-xl border border-borderline bg-surface-2 px-3 py-2 text-xs shadow-xl">
                <div className="mb-1 font-semibold text-primary">{shortDate(day.date)}</div>
                <div className="space-y-0.5 text-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: "var(--series-yt)" }} />
                    YouTube: {day.youtube}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: "var(--series-ig)" }} />
                    Instagram: {day.instagram}
                  </div>
                  <div className="pt-0.5 font-medium text-primary">Total: {day.total}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* x labels */}
      <div className="mt-2 flex gap-1.5">
        {history.map((day, i) => (
          <div key={day.date} className="flex-1 text-center text-[10px] text-muted">
            {i % labelEvery === 0 ? shortDate(day.date) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

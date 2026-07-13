"use client";

import { useEffect, useState } from "react";

const STAGES = [
  {
    left: "#f48fb1",
    right: "#f8bbd0",
    stroke: "#ad1457",
    label: "Fresh",
    count: "3",
  },
  {
    left: "#cbe08a",
    right: "#dcedaa",
    stroke: "#7a8f2e",
    label: "Suspicious",
    count: "12",
  },
  {
    left: "#a3b55e",
    right: "#b8c774",
    stroke: "#5a6b1f",
    label: "Composting",
    count: "28",
  },
  {
    left: "#8a7a5c",
    right: "#9c8d70",
    stroke: "#4e3b2a",
    label: "Terminal",
    count: "47",
  },
] as const;

export default function RottingBrain({ size = 220 }: { size?: number }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2200);
    return () => clearInterval(id);
  }, []);

  const s = STAGES[stage];

  return (
    <div className="landing-brain-wrap relative inline-flex flex-col items-center">
      <div
        className="landing-brain-glow absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            stage === 0
              ? "radial-gradient(circle, rgba(244,143,177,0.45), transparent 70%)"
              : stage === 3
                ? "radial-gradient(circle, rgba(78,59,42,0.5), transparent 70%)"
                : "radial-gradient(circle, rgba(163,181,94,0.4), transparent 70%)",
        }}
      />

      <div className="landing-float relative z-10">
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          aria-hidden
          className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)] transition-[filter] duration-700"
        >
          <path
            fill={s.left}
            stroke={s.stroke}
            strokeWidth="2"
            strokeLinejoin="round"
            className="transition-colors duration-700"
            d="M24 8c-5 0-8 3-9 6-4 1-7 4-7 8 0 2 .6 3.7 1.6 5C7 28.6 6 31 6 34c0 4 2.5 7 6 8.3.4 4.6 4 7.7 8.5 7.7 1.6 0 3.1-.4 4.4-1.2A8 8 0 0 0 32 52V12a8 8 0 0 0-8-4z"
          />
          <path
            fill={s.right}
            stroke={s.stroke}
            strokeWidth="2"
            strokeLinejoin="round"
            className="transition-colors duration-700"
            d="M40 8c5 0 8 3 9 6 4 1 7 4 7 8 0 2-.6 3.7-1.6 5C57 28.6 58 31 58 34c0 4-2.5 7-6 8.3-.4 4.6-4 7.7-8.5 7.7-1.6 0-3.1-.4-4.4-1.2A8 8 0 0 1 32 52V12a8 8 0 0 1 8-4z"
          />
          <path
            fill="none"
            stroke={s.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-colors duration-700"
            d="M24 16c-3 1-4 3-4 5m18-5c3 1 4 3 4 5M20 30c-2 1-3 3-3 5m30-5c2 1 3 3 3 5M26 42c-2 .5-3 2-3 4m18-4c2 .5 3 2 3 4"
          />
          {stage >= 1 && (
            <>
              <circle cx="22" cy="26" r={stage >= 2 ? 3 : 2.5} fill={s.stroke} opacity="0.55" />
              <circle cx="44" cy="21" r={stage >= 2 ? 2.5 : 2} fill={s.stroke} opacity="0.55" />
            </>
          )}
          {stage >= 2 && (
            <>
              <circle cx="38" cy="40" r="2" fill={s.stroke} opacity="0.6" />
              <path
                d="M20 18l3 6-2 6"
                fill="none"
                stroke={s.stroke}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
          {stage >= 3 && (
            <>
              <circle cx="26" cy="38" r="2" fill="#3e2f20" opacity="0.7" />
              <path
                d="M44 30l-3 5 2 5"
                fill="none"
                stroke="#3e2f20"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M27 51q1.5 5 0 8"
                fill="none"
                stroke="#4e3b2a"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        <div className="absolute -right-2 -top-1 flex h-11 min-w-11 items-center justify-center rounded-full border border-accent-2/40 bg-background/90 px-2.5 font-mono text-sm font-bold text-accent-2 shadow-lg backdrop-blur">
          {s.count}
        </div>
      </div>

      <p className="relative z-10 mt-6 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        Rot stage · <span className="text-accent-2">{s.label}</span>
      </p>
    </div>
  );
}

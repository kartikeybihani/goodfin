"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { SeriesPoint } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";

function buildPath(values: number[], width: number, height: number) {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-6, max - min);

  const xStep = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * xStep;
    const y = height - ((v - min) / span) * height;
    return { x, y };
  });

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  return d;
}

export function DealChart({
  series,
  height = 88,
  className,
  tone = "neutral",
  animate = true,
}: {
  series: SeriesPoint[];
  height?: number;
  className?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  animate?: boolean;
}) {
  const width = 320;
  const legendWidth = 72;
  const chartWidth = width - legendWidth;
  const uid = React.useId();
  const lineFadeId = `lineFade-${uid}`;
  const glowId = `softGlow-${uid}`;
  const values = React.useMemo(() => series.map((s) => s.value), [series]);
  const d = React.useMemo(
    () => buildPath(values, chartWidth, height),
    [values, chartWidth, height],
  );
  const last = values.at(-1);
  const prev = values.at(-2);
  const delta = last != null && prev != null ? last - prev : 0;

  const tones: Record<typeof tone, { stroke: string; glow: string }> = {
    neutral: {
      stroke: "rgba(255,255,255,0.70)",
      glow: "rgba(255,255,255,0.18)",
    },
    good: { stroke: "rgba(52,211,153,0.95)", glow: "rgba(52,211,153,0.20)" },
    warn: { stroke: "rgba(251,191,36,0.95)", glow: "rgba(251,191,36,0.18)" },
    bad: { stroke: "rgba(244,63,94,0.95)", glow: "rgba(244,63,94,0.18)" },
  };

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-label="valuation trend"
        role="img"
      >
        <defs>
          <linearGradient id={lineFadeId} x1="0" y1="0" x2="1" y2="0">
            <stop
              offset="0"
              stopColor={tones[tone].stroke}
              stopOpacity="0.45"
            />
            <stop offset="1" stopColor={tones[tone].stroke} stopOpacity="1" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g opacity="0.6">
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1="0"
              y1={height * t}
              x2={chartWidth}
              y2={height * t}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}
        </g>

        <motion.path
          d={d}
          fill="none"
          stroke={tones[tone].glow}
          strokeWidth="6"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          initial={animate ? { pathLength: 0 } : false}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${lineFadeId})`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>

      {last != null ? (
        <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-black/25 px-2 py-1 text-[11px] font-mono text-white/75">
            {last.toFixed(0)}B
          </span>
          <span
            className={cn(
              "text-[11px] font-medium",
              delta > 0
                ? "text-emerald-200"
                : delta < 0
                  ? "text-rose-200"
                  : "text-white/60",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

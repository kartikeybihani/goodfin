import * as React from "react";
import { cn } from "@/app/lib/utils";

export function Progress({
  value,
  className,
  tone = "neutral",
}: {
  value: number; // 0-100
  className?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const v = Math.max(0, Math.min(100, value));
  const tones: Record<typeof tone, string> = {
    neutral: "from-white/70 to-white/40",
    good: "from-emerald-300/90 to-emerald-400/50",
    warn: "from-amber-300/90 to-amber-400/50",
    bad: "from-rose-300/90 to-rose-400/50",
  };

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-white/8 border border-white/10",
        className,
      )}
      aria-label="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-[width] duration-500",
          tones[tone],
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}


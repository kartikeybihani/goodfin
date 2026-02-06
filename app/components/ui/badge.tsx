import * as React from "react";
import { cn } from "@/app/lib/utils";

type BadgeTone = "neutral" | "good" | "warn" | "bad";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-white/10 text-white/80 border-white/10",
    good: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
    warn: "bg-amber-400/10 text-amber-200 border-amber-400/20",
    bad: "bg-rose-400/10 text-rose-200 border-rose-400/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}


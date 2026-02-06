import * as React from "react";
import { cn } from "@/app/lib/utils";

type BadgeTone = "neutral" | "good" | "warn" | "bad";
type BadgeSize = "default" | "sm";

export function Badge({
  className,
  tone = "neutral",
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  size?: BadgeSize;
}) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-white/10 text-white/80 border-white/10",
    good: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
    warn: "bg-amber-400/10 text-amber-200 border-amber-400/20",
    bad: "bg-rose-400/10 text-rose-200 border-rose-400/20",
  };

  const sizeClasses: Record<BadgeSize, string> = {
    default: "px-2.5 py-1 text-[11px]",
    sm: "px-1.5 py-0.5 text-[9px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border font-medium tracking-tight",
        tones[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

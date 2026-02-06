import * as React from "react";
import { cn } from "@/app/lib/utils";

export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-white/[0.12] bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/75 font-mono",
        className,
      )}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/app/lib/utils";

export function Separator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent", className)}
      {...props}
    />
  );
}


import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { MarketInsight } from "@/app/lib/types";
import { cn, formatTimeAgo } from "@/app/lib/utils";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

function dirIcon(dir: MarketInsight["direction"]) {
  if (dir === "up") return TrendingUp;
  if (dir === "down") return TrendingDown;
  return Minus;
}

function dirTone(dir: MarketInsight["direction"]) {
  if (dir === "up") return "good";
  if (dir === "down") return "warn";
  return "neutral";
}

export function InsightsPanel({ insights }: { insights: MarketInsight[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white/65" />
          Goodfin Insights
        </CardTitle>
        <Badge tone="neutral">AI-generated feel</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((i) => {
            const Icon = dirIcon(i.direction);
            const tone = dirTone(i.direction) as "good" | "warn" | "neutral";
            return (
              <div
                key={i.id}
                className="rounded-xl border border-white/10 bg-black/[0.18] px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          tone === "good"
                            ? "text-emerald-200"
                            : tone === "warn"
                              ? "text-amber-200"
                              : "text-white/55",
                        )}
                      />
                      <div className="truncate text-[13px] font-medium text-white/85">
                        {i.text}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-white/55">
                      <span>confidence</span>
                      <span className="font-mono text-white/70">
                        {(i.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-white/25">•</span>
                      <span className="font-mono">{formatTimeAgo(i.updatedAt)}</span>
                    </div>
                  </div>
                  <Badge tone={tone} className="shrink-0">
                    {i.direction === "up"
                      ? "Upside"
                      : i.direction === "down"
                        ? "Compression"
                        : "Stable"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { Newspaper } from "lucide-react";
import type { NewsItem } from "@/app/lib/types";
import { formatTimeAgo } from "@/app/lib/utils";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

function sentimentTone(s: NewsItem["sentiment"]) {
  if (s === "positive") return "good" as const;
  if (s === "negative") return "bad" as const;
  return "neutral" as const;
}

export function NewsFeed({ items }: { items: NewsItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-white/65" />
          Mini News Feed
        </CardTitle>
        <Badge tone="neutral">Private markets</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-white/10 bg-black/[0.18] px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-white/85">
                    {n.headline}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                    <span className="text-white/70">{n.source}</span>
                    <span className="text-white/25">•</span>
                    <span className="font-mono">{formatTimeAgo(n.publishedAt)}</span>
                    {n.tags.slice(0, 2).map((t) => (
                      <Badge key={t} tone="neutral" className="py-0.5">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge tone={sentimentTone(n.sentiment)} className="shrink-0">
                  {n.sentiment}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

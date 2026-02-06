"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Command,
  Lock,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type {
  Company,
  InvestorActivitySnapshot,
  MarketInsight,
  NewsItem,
} from "@/app/lib/types";
import { formatCompactNumber, formatPct } from "@/app/lib/utils";
import { DealCard } from "@/app/components/DealCard";
import { InsightsPanel } from "@/app/components/InsightsPanel";
import { NewsFeed } from "@/app/components/NewsFeed";
import { AIChatPanel } from "@/app/components/AIChatPanel";
import { AccreditedPreview } from "@/app/components/AccreditedPreview";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Kbd } from "@/app/components/ui/kbd";
import { Progress } from "@/app/components/ui/progress";
import { Separator } from "@/app/components/ui/separator";

export function DashboardCards({
  companies,
  investorActivity,
  insights,
  news,
}: {
  companies: Company[];
  investorActivity: InvestorActivitySnapshot;
  insights: MarketInsight[];
  news: NewsItem[];
}) {
  const [conciergeOpen, setConciergeOpen] = React.useState(false);
  const byId = React.useMemo(() => {
    const m = new Map(companies.map((c) => [c.id, c] as const));
    return m;
  }, [companies]);
  const top = ["spacex", "anthropic", "stripe"]
    .map((id) => byId.get(id))
    .filter(Boolean) as Company[];

  return (
    <div className="mx-auto w-full max-w-[1220px] px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="relative grid h-9 w-9 place-items-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
              <span className="relative text-[12px] font-semibold tracking-tight text-white/85">
                GF
              </span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold tracking-tight text-white/85">
                Goodfin Private Markets Intelligence
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                <span className="font-mono">LIVE • secondary tape</span>
                <span className="text-white/25">•</span>
                <Badge tone="neutral">instant demo</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex h-10 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[13px] text-white/60 sm:w-[340px]">
            <div className="flex min-w-0 items-center gap-2">
              <Command className="h-4 w-4 text-white/45" />
              <span className="truncate">Search deals, signals, investors…</span>
            </div>
            <Kbd>⌘K</Kbd>
          </div>
          <Button
            variant="secondary"
            onClick={() => setConciergeOpen(true)}
            className="shadow-[0_10px_30px_-18px_rgba(99,102,241,0.45)]"
          >
            <Sparkles className="h-4 w-4" />
            AI Concierge
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white/65" />
                Trending in Secondary
              </CardTitle>
              <Badge tone="neutral">30-day signal</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {top.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.4 }}
                    className="md:col-span-1"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] text-white/55">Signal</div>
                      <Badge tone="neutral" className="py-0.5">
                        {c.id === "spacex"
                          ? `${formatPct(c.trend30d)} last 30 days`
                          : c.id === "anthropic"
                            ? "Demand 3× supply"
                            : "Discount narrowing"}
                      </Badge>
                    </div>
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="mt-3">
                      <DealCard company={c} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InsightsPanel insights={insights} />
            <NewsFeed items={news} />
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-white/65" />
                Investor Activity
              </CardTitle>
              <Badge tone="neutral">weekly</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-white/55">Investors viewed OpenAI</div>
                  <div className="text-[12px] font-mono text-white/80">
                    {investorActivity.viewsThisWeek.toLocaleString("en-US")}
                  </div>
                </div>
                <div className="mt-2 text-[12px] text-white/70">
                  {investorActivity.viewsThisWeek.toLocaleString("en-US")} investors viewed OpenAI this week
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-white/55">Top sectors</div>
                  <Badge tone="neutral">rotations</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {investorActivity.topSectors.map((s) => (
                    <Badge key={s} tone="neutral" className="py-0.5">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-white/55">Avg deal size</div>
                  <div className="text-[12px] font-mono text-emerald-200">
                    {formatPct(investorActivity.avgDealSizeTrendPct, 0)}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={72} tone="good" />
                </div>
              </div>

              <Separator />

              <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] text-white/55">Most-viewed</div>
                  <Badge tone="neutral">this week</Badge>
                </div>
                <div className="mt-2 space-y-2">
                  {investorActivity.topCompaniesByViews.map((x) => (
                    <div key={x.id} className="flex items-center justify-between gap-3">
                      <div className="truncate text-[12px] text-white/80">{x.name}</div>
                      <div className="text-[12px] font-mono text-white/65">
                        {formatCompactNumber(x.views)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <AccreditedPreview
            onOpenConcierge={() => setConciergeOpen(true)}
            footer={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-white/55">
                  <Lock className="h-3.5 w-3.5" />
                  Available after accreditation
                </div>
                <Button variant="outline" size="sm" disabled>
                  Request Access
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <AIChatPanel
        open={conciergeOpen}
        onOpenChange={setConciergeOpen}
        contextCompany={undefined}
      />
    </div>
  );
}

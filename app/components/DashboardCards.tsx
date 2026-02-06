"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Command,
  Lock,
  Newspaper,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
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
    <div className="flex min-h-dvh w-full overflow-x-hidden">
      <div className="mx-auto w-full min-w-0 flex-1 max-w-[1480px] px-3 py-5 md:px-5 md:py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
              <Image
                src="/goodfinGoIcon.png"
                alt="Goodfin"
                width={40}
                height={40}
                className="object-contain p-1.5"
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-white/90 md:text-base">
                Goodfin Private Markets Intelligence
              </h1>
              <p className="mt-0.5 flex items-center gap-2 text-[11px] text-white/50">
                <span className="font-mono">LIVE</span>
                <span className="text-white/20">·</span>
                <span>secondary tape</span>
                <Badge tone="neutral" className="ml-1 py-0 text-[10px]">
                  demo
                </Badge>
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="flex h-9 items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[13px] text-white/55 sm:w-[300px]">
              <div className="flex min-w-0 items-center gap-2">
                <Command className="h-3.5 w-3.5 text-white/40" />
                <span className="truncate">
                  Search deals, signals, investors…
                </span>
              </div>
              <Kbd>⌘K</Kbd>
            </div>
            <Button variant="secondary" size="sm" className="h-9" disabled>
              <Newspaper className="h-3.5 w-3.5 text-white/70" />
              News
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConciergeOpen(true)}
              className="h-9 border-amber-500/20 bg-amber-500/5 text-white shadow-[0_8px_24px_-12px_rgba(251,146,60,0.3)] hover:bg-amber-500/10 hover:border-amber-500/30"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300/90" />
              AI Concierge
            </Button>
          </div>
        </header>

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
              <CardContent className="min-w-0">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {top.map((c, idx) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.4 }}
                      className="min-w-0 md:col-span-1"
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
                    <div className="text-[11px] text-white/55">
                      Investors viewed OpenAI
                    </div>
                    <div className="text-[12px] font-mono text-white/80">
                      {investorActivity.viewsThisWeek.toLocaleString("en-US")}
                    </div>
                  </div>
                  <div className="mt-2 text-[12px] text-white/70">
                    {investorActivity.viewsThisWeek.toLocaleString("en-US")}{" "}
                    investors viewed OpenAI this week
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
                    <div className="text-[11px] text-white/55">
                      Avg deal size
                    </div>
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
                      <div
                        key={x.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="truncate text-[12px] text-white/80">
                          {x.name}
                        </div>
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
      </div>

      <AIChatPanel
        open={conciergeOpen}
        onOpenChange={setConciergeOpen}
        contextCompany={undefined}
        inline
      />
    </div>
  );
}

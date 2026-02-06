"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Lock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { Company } from "@/app/lib/types";
import { cn, formatCompactNumber, formatPct } from "@/app/lib/utils";
import { DealChart } from "@/app/components/DealChart";
import { AIChatPanel } from "@/app/components/AIChatPanel";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const take = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return take.join("");
}

export function DealDetailView({ company }: { company: Company }) {
  const [conciergeOpen, setConciergeOpen] = React.useState(false);
  const tone =
    company.trend30d > 0
      ? "good"
      : company.trend30d < 0
        ? "bad"
        : "neutral";

  return (
    <div className="mx-auto w-full max-w-[1220px] px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] text-white/60 hover:text-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <div className="mt-3 flex items-start gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
              <span className="relative text-[13px] font-semibold tracking-tight text-white/90">
                {initials(company.shortName)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-white/90">
                  {company.name}
                </h1>
                <Badge tone="neutral">{company.sector}</Badge>
                <Badge tone="neutral">{company.stage}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-white/55">
                <span className="font-mono">{company.valuationRange}</span>
                <span className="text-white/25">•</span>
                <span>{formatCompactNumber(company.watchersThisWeek)} investors watched this week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setConciergeOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Concierge
          </Button>
          <Button variant="outline" disabled>
            Start allocation
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white/65" />
                Valuation Trend
              </CardTitle>
              <Badge tone={tone}>{formatPct(company.trend30d)} 30d</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <DealChart
                  series={company.valuationSeries}
                  height={220}
                  tone={tone}
                  className="h-[220px]"
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                  <div className="text-[11px] text-white/55">Secondary price range</div>
                  <div className="mt-1 text-[13px] font-semibold text-white/85">
                    {company.secondaryRange}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                  <div className="text-[11px] text-white/55">Implied valuation</div>
                  <div className="mt-1 text-[13px] font-semibold text-white/85">
                    {company.valuationRange}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                  <div className="text-[11px] text-white/55">Discount to last round</div>
                  <div
                    className={cn(
                      "mt-1 text-[13px] font-semibold",
                      (company.discountToLastRoundPct ?? 0) <= 0
                        ? "text-emerald-200"
                        : "text-amber-200",
                    )}
                  >
                    {company.discountToLastRoundPct != null
                      ? `${company.discountToLastRoundPct.toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white/65" />
                  AI Summary
                </CardTitle>
                <Badge tone="neutral">3–5 lines</Badge>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3 text-[13px] leading-relaxed text-white/80">
                  {company.aiSummary}
                </div>
                <div className="mt-3 space-y-2">
                  {company.thesisBullets.slice(0, 3).map((t) => (
                    <div
                      key={t}
                      className="rounded-xl border border-white/10 bg-black/[0.18] px-3 py-2 text-[12px] text-white/75"
                    >
                      • {t}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-white/65" />
                  Risk Summary
                </CardTitle>
                <Badge tone="neutral">compressed</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {company.risks.slice(0, 4).map((r) => (
                    <div
                      key={r}
                      className="rounded-xl border border-white/10 bg-black/[0.18] px-3 py-2 text-[12px] text-white/75"
                    >
                      • {r}
                    </div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="mt-3 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.16),transparent_60%)] p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] font-semibold text-white/85">Risk posture</div>
                    <Badge tone="warn">monitor</Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-white/55">
                    Tight terms + information rights matter more than entry price on longer lockups.
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[13px]">Investor Demand</CardTitle>
              <Badge tone={company.demandIndex >= 85 ? "good" : company.demandIndex >= 70 ? "warn" : "neutral"}>
                {company.demandIndex}/100
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                <div className="flex items-center justify-between text-[11px] text-white/55">
                  <span>Demand</span>
                  <span className="font-mono text-white/70">{company.demandIndex}</span>
                </div>
                <div className="mt-2">
                  <Progress
                    value={company.demandIndex}
                    tone={company.demandIndex >= 85 ? "good" : company.demandIndex >= 70 ? "warn" : "neutral"}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
                <div className="flex items-center justify-between text-[11px] text-white/55">
                  <span>Supply</span>
                  <span className="font-mono text-white/70">{company.supplyIndex}</span>
                </div>
                <div className="mt-2">
                  <Progress
                    value={company.supplyIndex}
                    tone={company.supplyIndex >= 60 ? "warn" : "neutral"}
                  />
                </div>
              </div>
              <div className="text-[11px] text-white/50">
                Interprets the secondary tape: inquiries, clears, dispersion, and time-to-fill.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[13px]">Allocation (demo)</CardTitle>
              <Badge tone="neutral">disabled</Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-white/10 bg-black/[0.18] p-3">
                <div className="text-[11px] text-white/55">Target ticket</div>
                <div className="mt-1 text-[20px] font-semibold tracking-tight text-white/90">
                  $50,000
                </div>
                <div className="mt-2 text-[11px] text-white/55">
                  Suggested: split into 2–3 tranches to reduce price dispersion.
                </div>
                <div className="mt-3">
                  <Button className="w-full" disabled>
                    <Lock className="h-4 w-4" />
                    Allocate (accredited)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AIChatPanel
        open={conciergeOpen}
        onOpenChange={setConciergeOpen}
        contextCompany={company}
      />
    </div>
  );
}

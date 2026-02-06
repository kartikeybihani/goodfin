"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Company } from "@/app/lib/types";
import { cn, formatPct } from "@/app/lib/utils";
import { DealChart } from "@/app/components/DealChart";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const take = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return take.join("");
}

export function DealCard({ company }: { company: Company }) {
  const tone =
    company.trend30d > 0
      ? "good"
      : company.trend30d < 0
        ? "bad"
        : "neutral";

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }}>
      <Link href={`/deal/${company.id}`} className="group block">
        <Card className="overflow-hidden transition-colors group-hover:bg-white/[0.06]">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                <span className="relative text-[12px] font-semibold tracking-tight text-white/85">
                  {initials(company.shortName)}
                </span>
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <span className="truncate">{company.shortName}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/40 transition group-hover:text-white/70" />
                </CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge className="py-0.5" tone="neutral">
                    {company.sector}
                  </Badge>
                  <Badge className="py-0.5" tone="neutral">
                    {company.stage}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div
                className={cn(
                  "text-sm font-semibold tracking-tight",
                  company.trend30d > 0
                    ? "text-emerald-200"
                    : company.trend30d < 0
                      ? "text-rose-200"
                      : "text-white/70",
                )}
              >
                {formatPct(company.trend30d)}
              </div>
              <div className="text-[11px] text-white/55">30d secondary</div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-[11px] text-white/55">Secondary range</div>
                <div className="mt-1 text-[13px] font-semibold tracking-tight text-white/85">
                  {company.secondaryRange}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2 text-[11px] text-white/55">
                  <span>Demand</span>
                  <span className="font-mono text-white/70">{company.demandIndex}/100</span>
                </div>
                <div className="mt-2">
                  <Progress
                    value={company.demandIndex}
                    tone={company.demandIndex >= 85 ? "good" : company.demandIndex >= 70 ? "warn" : "neutral"}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-white/55">Valuation trend (indicative)</div>
                <Badge tone={tone} className="py-0.5">
                  <Sparkles className="h-3 w-3" />
                  Signal
                </Badge>
              </div>
              <div className="mt-2 h-[84px]">
                <DealChart
                  series={company.valuationSeries}
                  height={84}
                  tone={tone}
                  className="h-[84px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

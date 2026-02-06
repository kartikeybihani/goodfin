"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Landmark, Lock, ShieldCheck, Sparkles } from "lucide-react";

import { cn } from "@/app/lib/utils";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

export function AccreditedPreview({
  onOpenConcierge,
  footer,
  className,
}: {
  onOpenConcierge?: () => void;
  footer?: React.ReactNode;
  className?: string;
}) {
  const locked = (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(16,185,129,0.14),transparent_60%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="relative grid grid-cols-1 gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.12] bg-white/[0.06]">
            <FileText className="h-4 w-4 text-white/70" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-white/85">Deal documents</div>
            <div className="mt-1 text-[11px] text-white/55 blur-[3px]">
              Transfer agreement • KYC packet • cap table excerpt • broker memo
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.12] bg-white/[0.06]">
            <Landmark className="h-4 w-4 text-white/70" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-white/85">Wire instructions</div>
            <div className="mt-1 text-[11px] text-white/55 blur-[3px]">
              Beneficiary • Bank address • SWIFT • Reference format
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.12] bg-white/[0.06]">
            <ShieldCheck className="h-4 w-4 text-white/70" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-white/85">Subscription forms</div>
            <div className="mt-1 text-[11px] text-white/55 blur-[3px]">
              Accredited attestation • suitability • investor questionnaire
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/4 px-3 py-2">
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <Lock className="h-3.5 w-3.5" />
            Locked preview
          </div>
          <Badge tone="neutral">future experience</Badge>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-white/65" />
          Accredited Preview
        </CardTitle>
        <Badge tone="neutral">locked</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {locked}
        </motion.div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/[0.18] p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-white/85">
              <Sparkles className="h-4 w-4 text-white/65" />
              Make the mental movie
            </div>
            <div className="mt-1 text-[11px] text-white/55">
              See the workflow: docs → wires → allocation. Everything instant, always contextual.
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenConcierge}
            className="shrink-0"
          >
            Ask Concierge
          </Button>
        </div>

        {footer ?? null}
      </CardContent>
    </Card>
  );
}

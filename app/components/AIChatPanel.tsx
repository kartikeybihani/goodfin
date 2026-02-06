"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

import type { Company, ConciergeIntent, ConciergeMessage } from "@/app/lib/types";
import { runConcierge } from "@/app/lib/ai";
import { cn } from "@/app/lib/utils";
import { companies } from "@/app/lib/mock";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";

function uid() {
  return Math.random().toString(16).slice(2);
}

function intentFromText(text: string): ConciergeIntent {
  const t = text.toLowerCase();
  if (t.includes("risk")) return "risks";
  if (t.includes("compare") || t.includes("vs")) return "compare";
  if (t.includes("allocate") || t.includes("ticket") || t.includes("$"))
    return "allocate";
  return "summarize";
}

function parseAmount(text: string) {
  const m = text.match(/\$\s*([0-9,]+)\s*(k|m)?/i);
  if (!m) return undefined;
  const raw = Number(m[1].replaceAll(",", ""));
  if (!Number.isFinite(raw)) return undefined;
  const suffix = (m[2] ?? "").toLowerCase();
  if (suffix === "k") return raw * 1000;
  if (suffix === "m") return raw * 1_000_000;
  return raw;
}

function pickCompare(company?: Company) {
  if (!company) return companies.find((c) => c.id === "stripe");
  if (company.id === "stripe") return companies.find((c) => c.id === "openai");
  return companies.find((c) => c.id === "stripe");
}

export function AIChatPanel({
  open,
  onOpenChange,
  contextCompany,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextCompany?: Company;
}) {
  const [messages, setMessages] = React.useState<ConciergeMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      content:
        "I’m your deal concierge. Keep it tactical: summary, key risks, allocation posture, or a quick comparison.",
      ts: Date.now(),
    },
  ]);
  const [draft, setDraft] = React.useState("");

  const push = React.useCallback((m: Omit<ConciergeMessage, "id" | "ts">) => {
    setMessages((prev) => [...prev, { ...m, id: uid(), ts: Date.now() }]);
  }, []);

  const reply = React.useCallback(
    (intent: ConciergeIntent, text?: string) => {
      const amount = text ? parseAmount(text) : undefined;
      const compareTo = intent === "compare" ? pickCompare(contextCompany) : undefined;
      const out = runConcierge({
        company: contextCompany,
        intent,
        amountUsd: amount,
        compareTo,
      });
      push({ role: "assistant", content: out });
    },
    [contextCompany, push],
  );

  function onQuick(text: string) {
    push({ role: "user", content: text });
    reply(intentFromText(text), text);
  }

  function onSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    push({ role: "user", content: text });
    reply(intentFromText(text), text);
  }

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 h-dvh w-full max-w-[520px] border-l border-white/10 bg-[#0B0E12]/90 backdrop-blur-2xl"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            aria-label="AI Concierge"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/[0.12] bg-white/[0.06]">
                      <Bot className="h-4 w-4 text-white/80" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold tracking-tight text-white/90">
                        AI Concierge
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                        <Badge tone="neutral">short answers</Badge>
                        <Badge tone="neutral">contextual</Badge>
                        {contextCompany ? (
                          <Badge tone="neutral">{contextCompany.shortName}</Badge>
                        ) : (
                          <Badge tone="neutral">no deal selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="px-4 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onQuick("Summarize this deal")}
                  >
                    <Sparkles className="h-4 w-4" />
                    Summarize
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onQuick("Key risks?")}
                  >
                    <ChevronRight className="h-4 w-4" />
                    Key risks
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onQuick("Should I allocate $50k?")}
                  >
                    <Check className="h-4 w-4" />
                    Allocate $50k
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onQuick("Compare to Stripe")}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Compare
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex-1 overflow-auto px-4 pb-4">
                <div className="space-y-3">
                  {messages.map((m) => (
                    <Card
                      key={m.id}
                      className={cn(
                        "rounded-2xl border-white/10 bg-white/[0.03]",
                        m.role === "user" && "bg-white/[0.06]",
                      )}
                    >
                      <div className="px-3 py-2.5">
                        <div className="mb-1 flex items-center justify-between">
                          <div
                            className={cn(
                              "text-[11px] font-medium",
                              m.role === "assistant" ? "text-white/70" : "text-white/80",
                            )}
                          >
                            {m.role === "assistant" ? "Concierge" : "You"}
                          </div>
                        </div>
                        <div className="whitespace-pre-line text-[13px] leading-relaxed text-white/85">
                          {m.content}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSend();
                    }}
                    placeholder="Ask: key risks, pricing dispersion, terms…"
                    className="h-9 flex-1 bg-transparent px-2 text-[13px] text-white/85 placeholder:text-white/35 focus:outline-none"
                  />
                  <Button size="sm" variant="primary" onClick={onSend}>
                    Send
                  </Button>
                </div>
                <div className="mt-2 text-[11px] text-white/45">
                  Demo only. Responses are instant and use mock data.
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

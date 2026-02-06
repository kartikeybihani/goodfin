"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleDollarSign, FileText, Lock, TrendingUp } from "lucide-react";

import type { ConciergeMessage } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";

const LOADING_MESSAGES = [
  "Looking over deal flows…",
  "Checking secondary tape…",
  "Scanning allocation signals…",
  "Reviewing key terms…",
  "Cross-referencing comparable deals…",
  "Pulling recent pricing data…",
  "Assessing risk factors…",
  "Checking investor activity…",
  "Reviewing cap table context…",
  "Scanning market insights…",
  "Gathering deal summary…",
  "Checking valuation trends…",
  "Reviewing liquidity signals…",
  "Pulling news and updates…",
  "Synthesizing recommendations…",
];

const spring = { type: "spring" as const, stiffness: 420, damping: 36 };

function renderWithBold(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let lastIdx = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    parts.push(text.slice(lastIdx, match.index));
    parts.push(<strong key={key++}>{match[1]}</strong>);
    lastIdx = match.index + match[0].length;
  }
  parts.push(text.slice(lastIdx));
  return parts;
}

type ChatUIProps = {
  messages: ConciergeMessage[];
  draft: string;
  setDraft: (v: string) => void;
  loading: boolean;
  onSend: () => void;
  onQuick: (text: string) => void;
  /** Use muted palette (less orange) for full-page chat */
  muted?: boolean;
};

export function ChatUI({
  messages,
  draft,
  setDraft,
  loading,
  onSend,
  onQuick,
  muted = false,
}: ChatUIProps) {
  const [loadingMessageIndex, setLoadingMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  const isPlaceholder = (m: ConciergeMessage) =>
    m.role === "assistant" && (m.content === "…" || m.content.trim() === "");

  const LoadingState = () => (
    <div className="space-y-2 py-0.5" aria-hidden>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              muted ? "bg-white/60" : "bg-amber-400/90",
            )}
            animate={{ y: [0, -5, 0], opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        key={loadingMessageIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-[11px] text-white/50"
      >
        {LOADING_MESSAGES[loadingMessageIndex]}
      </motion.p>
    </div>
  );

  const quickBtn = (icon: React.ReactNode, label: string, prompt: string) => (
    <Button
      key={label}
      size="sm"
      variant="secondary"
      className={cn(
        "group h-10 gap-2 rounded-xl font-medium transition-all duration-200 text-white/90",
        muted
          ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
          : "border-amber-500/15 bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/10 hover:shadow-[0_0_20px_-4px_rgba(251,146,60,0.2)]",
      )}
      onClick={() => onQuick(prompt)}
    >
      <span
        className={cn(
          "shrink-0",
          muted
            ? "text-white/60"
            : "text-amber-400/90 group-hover:text-amber-300",
        )}
      >
        {icon}
      </span>
      {label}
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pt-4">
        <div className="grid grid-cols-2 gap-2.5">
          {quickBtn(
            <FileText className="h-4 w-4" />,
            "Summarize deal",
            "Summarize this deal",
          )}
          {quickBtn(
            <Lock className="h-4 w-4" />,
            "Ask & lockup",
            "What’s the ask and lockup?",
          )}
          {quickBtn(
            <CircleDollarSign className="h-4 w-4" />,
            "Allocate $100k",
            "Should I allocate $100k?",
          )}
          {quickBtn(
            <TrendingUp className="h-4 w-4" />,
            "Valuation trend",
            "What’s the valuation trend?",
          )}
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-auto px-4 pb-4">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...spring, opacity: { duration: 0.25 } }}
                className={cn(
                  "origin-bottom flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <Card
                  className={cn(
                    "max-w-[85%] overflow-hidden rounded-2xl",
                    muted
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-amber-500/10 bg-amber-950/10",
                    m.role === "user" &&
                      (muted
                        ? "bg-white/[0.06] border-white/15 rounded-br-md"
                        : "bg-amber-500/10 border-amber-500/20 rounded-br-md"),
                    !(m.role === "user") && "rounded-bl-md",
                    isPlaceholder(m) &&
                      (muted
                        ? "border-white/15"
                        : "relative border-amber-500/20"),
                  )}
                >
                  {isPlaceholder(m) && !muted && (
                    <motion.div
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
                      animate={{ x: "200%" }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      aria-hidden
                    />
                  )}
                  <div className="relative z-10 px-3 py-2.5">
                    <div className="mb-1 flex items-center justify-between">
                      <div
                        className={cn(
                          "text-[11px] font-medium",
                          m.role === "assistant"
                            ? "text-white/70"
                            : "text-white/80",
                        )}
                      >
                        {m.role === "assistant" ? "Concierge" : "You"}
                      </div>
                    </div>
                    <div className="min-h-[1.25rem] whitespace-pre-line text-[13px] leading-relaxed text-white/85">
                      {isPlaceholder(m) ? (
                        <LoadingState />
                      ) : (
                        <motion.span
                          key={m.content.slice(0, 80)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="block"
                        >
                          {m.role === "assistant"
                            ? renderWithBold(m.content)
                            : m.content}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 border-t p-4",
          muted ? "border-white/10" : "border-amber-500/15",
        )}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
            placeholder="Ask: key risks, pricing dispersion, terms…"
            disabled={loading}
            className="h-9 flex-1 bg-transparent px-2 text-[13px] text-white/85 placeholder:text-white/35 focus:outline-none disabled:opacity-60"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={onSend}
            disabled={loading}
            className={cn(
              "disabled:opacity-60",
              muted
                ? "bg-white/90 text-black hover:bg-white"
                : "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-[0_4px_14px_-2px_rgba(251,146,60,0.4)]",
            )}
          >
            {loading ? "…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

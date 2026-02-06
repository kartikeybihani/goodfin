"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Sparkles, X } from "lucide-react";

import type { Company, ConciergeMessage } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";

function uid() {
  return Math.random().toString(16).slice(2);
}

async function fetchConciergeReply(
  message: string,
  contextCompany: Company | undefined
): Promise<{ content: string }> {
  const requestId = `ui_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const res = await fetch("/api/concierge", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-concierge-request-id": requestId },
    body: JSON.stringify({
      message,
      contextCompany: contextCompany ?? null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? "Concierge request failed");
  }
  return res.json();
}

const CONCIERGE_DEFAULT_PCT = 0.33;
const CONCIERGE_MIN = 380;
const CONCIERGE_MAX_PCT = 0.4;

export function AIChatPanel({
  open,
  onOpenChange,
  contextCompany,
  inline = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextCompany?: Company;
  /** When true, render as a side column (no overlay); parent should use flex layout. */
  inline?: boolean;
}) {
  const [panelWidth, setPanelWidth] = React.useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth * CONCIERGE_DEFAULT_PCT
      : 440,
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, w: 0 });
  const resizeHandleRef = React.useRef<HTMLDivElement>(null);
  const pointerIdRef = React.useRef<number | null>(null);

  const maxWidthPx =
    typeof window !== "undefined" ? window.innerWidth * CONCIERGE_MAX_PCT : 600;
  const clampedWidth = Math.min(
    Math.max(panelWidth, CONCIERGE_MIN),
    maxWidthPx,
  );

  React.useEffect(() => {
    if (open) {
      setPanelWidth((w) => {
        const target = window.innerWidth * CONCIERGE_DEFAULT_PCT;
        return Math.min(
          Math.max(target, CONCIERGE_MIN),
          window.innerWidth * CONCIERGE_MAX_PCT,
        );
      });
    }
  }, [open]);

  React.useEffect(() => {
    if (!inline || !open) return;
    const onResize = () =>
      setPanelWidth((w) => Math.min(w, window.innerWidth * CONCIERGE_MAX_PCT));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [inline, open]);

  React.useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      const dx = dragStart.current.x - e.clientX;
      const next = dragStart.current.w + dx;
      const max = window.innerWidth * CONCIERGE_MAX_PCT;
      setPanelWidth(Math.min(Math.max(next, CONCIERGE_MIN), max));
    };
    const onUp = () => {
      const id = pointerIdRef.current;
      if (id !== null && resizeHandleRef.current) {
        try {
          resizeHandleRef.current.releasePointerCapture(id);
        } catch (_) {}
        pointerIdRef.current = null;
      }
      setIsDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging]);

  const handleResizeStart = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragStart.current = { x: e.clientX, w: clampedWidth };
      pointerIdRef.current = e.pointerId;
      resizeHandleRef.current?.setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [clampedWidth],
  );

  const [messages, setMessages] = React.useState<ConciergeMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      content:
        "I’m your deal concierge. Ask anything: summary, key risks, allocation posture, or a quick comparison.",
      ts: Date.now(),
    },
  ]);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const push = React.useCallback((m: Omit<ConciergeMessage, "id" | "ts">) => {
    setMessages((prev) => [...prev, { ...m, id: uid(), ts: Date.now() }]);
  }, []);

  const setLastAssistantContent = React.useCallback((content: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant") next[next.length - 1] = { ...last, content };
      return next;
    });
  }, []);

  const sendToConcierge = React.useCallback(
    async (text: string) => {
      push({ role: "user", content: text });
      push({ role: "assistant", content: "…" });
      setLoading(true);
      try {
        const { content } = await fetchConciergeReply(text, contextCompany);
        setLastAssistantContent(content);
      } catch (e) {
        setLastAssistantContent(
          `Sorry, something went wrong: ${e instanceof Error ? e.message : String(e)}`
        );
      } finally {
        setLoading(false);
      }
    },
    [contextCompany, push, setLastAssistantContent]
  );

  function onQuick(text: string) {
    if (loading) return;
    sendToConcierge(text);
  }

  function onSend() {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft("");
    sendToConcierge(text);
  }

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const spring = { type: "spring" as const, stiffness: 420, damping: 36 };

  /** Loading dots for assistant "thinking" state */
  const LoadingDots = () => (
    <div className="flex items-center gap-1 py-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-amber-400/90"
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
  );

  const isPlaceholder = (m: ConciergeMessage) =>
    m.role === "assistant" && (m.content === "…" || m.content.trim() === "");

  const asideContent = (
    <motion.aside
      key="concierge-panel"
      className={cn(
        "relative h-dvh shrink-0 max-w-[40vw] overflow-hidden border-l border-amber-500/20 bg-gradient-to-b from-[#0f0d0a] via-[#120f0b] to-[#0B0E12] backdrop-blur-2xl shadow-[-8px_0_32px_-8px_rgba(251,146,60,0.12)]",
        inline ? "min-w-0" : "fixed right-0 top-0 z-50",
      )}
      style={!inline ? { width: clampedWidth } : undefined}
      initial={inline ? { width: 0, opacity: 0 } : { x: 24, opacity: 0 }}
      animate={
        inline ? { width: clampedWidth, opacity: 1 } : { x: 0, opacity: 1 }
      }
      exit={inline ? { width: 0, opacity: 0 } : { x: 24, opacity: 0 }}
      transition={spring}
      aria-label="AI Concierge"
    >
      <div
        ref={resizeHandleRef}
        role="separator"
        aria-label="Resize panel"
        onPointerDown={handleResizeStart}
        className="absolute left-0 top-0 z-10 h-full w-2 cursor-col-resize touch-none hover:bg-amber-500/20 active:bg-amber-500/25"
        style={{ marginLeft: -4, paddingLeft: 4 }}
      />
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-amber-500/15 px-4 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/15 to-amber-600/5">
                <Image
                  src="/goodfinGoIcon.png"
                  alt="Goodfin Go"
                  width={36}
                  height={36}
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold tracking-tight text-white/90">
                  AI Concierge
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:text-white hover:bg-amber-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="border-amber-500/15 hover:bg-amber-500/10 hover:border-amber-500/25 text-white/90"
              onClick={() => onQuick("Summarize this deal")}
            >
              <Sparkles className="h-4 w-4 text-amber-300/80" />
              Summarize
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="border-amber-500/15 hover:bg-amber-500/10 hover:border-amber-500/25 text-white/90"
              onClick={() => onQuick("Key risks?")}
            >
              <ChevronRight className="h-4 w-4 text-amber-300/80" />
              Key risks
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="border-amber-500/15 hover:bg-amber-500/10 hover:border-amber-500/25 text-white/90"
              onClick={() => onQuick("Should I allocate $50k?")}
            >
              <Check className="h-4 w-4 text-amber-300/80" />
              Allocate $50k
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="border-amber-500/15 hover:bg-amber-500/10 hover:border-amber-500/25 text-white/90"
              onClick={() => onQuick("Compare to Stripe")}
            >
              <ArrowRight className="h-4 w-4 text-amber-300/80" />
              Compare
            </Button>
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    ...spring,
                    opacity: { duration: 0.25 },
                  }}
                  className="origin-bottom"
                >
                  <Card
                    className={cn(
                      "rounded-2xl border-amber-500/10 bg-amber-950/10 overflow-hidden",
                      m.role === "user" && "bg-amber-500/5 border-amber-500/15",
                      isPlaceholder(m) && "relative border-amber-500/20",
                    )}
                  >
                    {isPlaceholder(m) && (
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
                          <LoadingDots />
                        ) : (
                          <motion.span
                            key={m.content.slice(0, 80)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="block"
                          >
                            {m.content}
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

        <div className="border-t border-amber-500/15 p-4">
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
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-[0_4px_14px_-2px_rgba(251,146,60,0.4)] disabled:opacity-60"
            >
              {loading ? "…" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </motion.aside>
  );

  if (!open && !inline) return null;

  if (inline) {
    return (
      <AnimatePresence initial={false}>{open && asideContent}</AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
      />
      {asideContent}
    </AnimatePresence>
  );
}

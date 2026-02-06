"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";

import type { Company } from "@/app/lib/types";
import { useConciergeChat } from "@/app/lib/useConciergeChat";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ChatUI } from "@/app/components/ChatUI";

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

  const chat = useConciergeChat(contextCompany);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const spring = { type: "spring" as const, stiffness: 420, damping: 36 };

  const expandHref = contextCompany
    ? `/chat?dealId=${contextCompany.id}`
    : "/chat";

  const asideContent = (
    <motion.aside
      key="concierge-panel"
      className={cn(
        "relative h-dvh shrink-0 max-w-[40vw] overflow-hidden border-l border-white/10 bg-gradient-to-b from-[#0f0d0a] via-[#120f0b] to-[#0B0E12] backdrop-blur-2xl shadow-[-8px_0_32px_-8px_rgba(0,0,0,0.3)]",
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
        className="absolute left-0 top-0 z-10 h-full w-2 cursor-col-resize touch-none hover:bg-white/10 active:bg-white/15"
        style={{ marginLeft: -4, paddingLeft: 4 }}
      />
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04]">
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
          <div className="flex items-center gap-1">
            <Link
              href={expandHref}
              title="Expand to full page"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <Maximize2 className="h-4 w-4 shrink-0" />
              <span>Expand</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ChatUI
          messages={chat.messages}
          draft={chat.draft}
          setDraft={chat.setDraft}
          loading={chat.loading}
          onSend={chat.onSend}
          onQuick={chat.onQuick}
          muted
        />
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

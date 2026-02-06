"use client";

import * as React from "react";
import type { Company, ConciergeMessage } from "./types";

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
    headers: {
      "Content-Type": "application/json",
      "x-concierge-request-id": requestId,
    },
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

const DEFAULT_MESSAGE: ConciergeMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I'm your deal concierge. Ask anything: summary, key risks, allocation posture, or a quick comparison.",
  ts: Date.now(),
};

export function useConciergeChat(contextCompany?: Company) {
  const [messages, setMessages] = React.useState<ConciergeMessage[]>([
    { ...DEFAULT_MESSAGE, id: uid(), ts: Date.now() },
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
      if (last?.role === "assistant")
        next[next.length - 1] = { ...last, content };
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

  const onQuick = React.useCallback(
    (text: string) => {
      if (loading) return;
      sendToConcierge(text);
    },
    [loading, sendToConcierge]
  );

  const onSend = React.useCallback(() => {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft("");
    sendToConcierge(text);
  }, [draft, loading, sendToConcierge]);

  return { messages, draft, setDraft, loading, onSend, onQuick };
}

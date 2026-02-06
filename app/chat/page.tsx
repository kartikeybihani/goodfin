"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import type { Company } from "@/app/lib/types";
import { getCompanyById } from "@/app/lib/mock";
import { useConciergeChat } from "@/app/lib/useConciergeChat";
import { ChatUI } from "@/app/components/ChatUI";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const dealId = searchParams.get("dealId");
  const contextCompany = React.useMemo<Company | undefined>(() => {
    if (!dealId) return undefined;
    return getCompanyById(dealId) ?? undefined;
  }, [dealId]);

  const chat = useConciergeChat(contextCompany);

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="shrink-0 border-b border-white/10 bg-[#0B0E12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href={dealId ? `/deal/${dealId}` : "/"}
            className="inline-flex items-center gap-2 text-[12px] text-white/60 hover:text-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            {dealId ? "Back to deal" : "Dashboard"}
          </Link>
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
            <span className="text-[13px] font-semibold tracking-tight text-white/90">
              AI Concierge
            </span>
          </div>
          <div className="w-20" aria-hidden />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
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
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-white/50">
          Loading…
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

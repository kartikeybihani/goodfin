import { NextResponse } from "next/server";
import { braveSearch, type BraveSearchResult } from "@/app/lib/brave";
import { chat } from "@/app/lib/openrouter";
import type { Company, ConciergeQueryTier } from "@/app/lib/types";

const REQUEST_ID_HEADER = "x-concierge-request-id";

function parseTier(raw: string): ConciergeQueryTier {
  const t = raw.toLowerCase().trim();
  if (t.includes("industry")) return "industry";
  if (t.includes("detail")) return "detail";
  return "simple";
}

/** Layer 1: classify user query as simple | industry | detail */
async function classify(
  userMessage: string,
  requestId: string
): Promise<ConciergeQueryTier> {
  const prompt = `You are a classifier for a private market deal concierge. Classify the user's question into exactly one tier:

- simple: quick factual questions, definitions, yes/no, or very short answers (e.g. "What is secondary?", "Summarize this deal").
- industry: sector or market-level questions (e.g. "How is AI valuation trending?", "Compare to Stripe").
- detail: deep analysis, multi-factor reasoning, allocation or risk deep-dives (e.g. "Should I allocate $50k?", "Key risks and mitigations").

Reply with exactly one word: simple, industry, or detail.

User question: ${userMessage}`;

  const out = await chat(
    [{ role: "user", content: prompt }],
    { requestId, max_tokens: 16, temperature: 0 }
  );
  return parseTier(out);
}

function formatWebResults(results: BraveSearchResult[]): string {
  if (results.length === 0) return "";
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\n${r.url}\n${r.snippet}`
    )
    .join("\n\n");
}

/** Layer 2: answer using the classification tier and optional web search results. */
async function answer(
  userMessage: string,
  tier: ConciergeQueryTier,
  contextCompany: Company | null,
  webResults: BraveSearchResult[],
  requestId: string
): Promise<string> {
  const context = contextCompany
    ? `Current deal context: ${contextCompany.shortName} (${contextCompany.sector}), demand ${contextCompany.demandIndex}/100, supply ${contextCompany.supplyIndex}/100.`
    : "No specific deal selected; answer in general terms.";

  const webBlock = formatWebResults(webResults);
  const system = `You are a concise deal concierge for private market secondary deals. Classification for this question: ${tier}. ${context}
Use the following web search results to ground your answer in current data when relevant. If no results are provided or they don't apply, answer from general knowledge.
Answer in 2–4 short sentences. Be tactical.${webBlock ? `\n\n--- Web search results ---\n${webBlock}\n---` : ""}`;

  const userContent = webBlock
    ? `${userMessage}\n\n[Use the web results above where they help.]`
    : userMessage;

  return chat(
    [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    { requestId, max_tokens: 512, temperature: 0.3 }
  );
}

export async function POST(req: Request) {
  const requestId =
    req.headers.get(REQUEST_ID_HEADER) ??
    `concierge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const logMeta = (msg: string, meta?: Record<string, unknown>) =>
    console.log(
      "[concierge]",
      JSON.stringify({ requestId, message: msg, ...meta })
    );

  try {
    const body = (await req.json()) as {
      message?: string;
      messages?: Array<{ role: string; content: string }>;
      contextCompany?: Company | null;
    };

    const message =
      body.message ??
      body.messages?.filter((m) => m.role === "user").pop()?.content;
    const contextCompany = body.contextCompany ?? null;

    if (!message || typeof message !== "string") {
      logMeta("concierge.bad_request", { reason: "missing message" });
      return NextResponse.json(
        { error: "Missing or invalid message" },
        { status: 400 }
      );
    }

    const t0 = Date.now();
    const tier = await classify(message, requestId);
    const classifyMs = Date.now() - t0;
    logMeta("concierge.classify.done", { tier, classifyMs });

    const searchQuery = contextCompany
      ? `${contextCompany.shortName} ${message}`.trim()
      : message;
    const tSearch = Date.now();
    const webResults = await braveSearch(searchQuery, { timeoutMs: 8000 });
    const searchMs = Date.now() - tSearch;
    logMeta("concierge.search.done", { searchMs, resultCount: webResults.length });

    const t1 = Date.now();
    const content = await answer(
      message,
      tier,
      contextCompany,
      webResults,
      requestId
    );
    const answerMs = Date.now() - t1;
    logMeta("concierge.answer.done", { answerMs, totalMs: Date.now() - t0 });

    return NextResponse.json({
      content,
      classification: { tier },
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("[concierge]", JSON.stringify({ requestId, error: err }));
    return NextResponse.json(
      { error: err || "Concierge request failed" },
      { status: 500 }
    );
  }
}

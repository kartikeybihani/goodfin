import { NextResponse } from "next/server";
import { braveSearch, type BraveSearchResult } from "@/app/lib/brave";
import { log as logPretty } from "@/app/lib/log";
import { chat } from "@/app/lib/openrouter";
import type { Company, ConciergeQueryTier } from "@/app/lib/types";

const REQUEST_ID_HEADER = "x-concierge-request-id";

// --- Classification prompt: router only, no text generation ---
const CLASSIFY_PROMPT = `You are a strict query classifier for a private markets AI concierge.

Your ONLY job is to classify the user question into exactly ONE tier:

simple_fast
simple
industry
detail

Return ONLY the tier name.
No explanation.
No punctuation.
No extra words.

--------------------------------------------------
Definitions:

simple_fast
- general questions
- explain / tell me about / what is
- no numbers requested
- no analysis
- no decision
- answerable in 1-2 sentences
Examples:
"What is a secondary?"
"Tell me about SpaceX"
"Explain private markets"
"What does valuation mean?"

simple
- definitions
- factual lookups
- yes/no
- summaries
- short answers
- single-step questions
- anything answerable in under 2 sentences
Examples:
"Summarize this deal"
"SpaceX valuation?"
"Key risks in one line"
"Explain this quickly"

industry
- sector or market level trends
- comparisons across companies
- macro or thematic questions
- requires synthesis of multiple sources
- but NOT personalized advice
Examples:
"How is AI valuation trending?"
"Compare SpaceX vs Stripe"
"What sectors are hot this year?"
"Healthcare vs fintech outlook"
"Top private market trends"

detail
- deep analysis
- portfolio allocation
- multi-factor reasoning
- scenario modeling
- personalized or decision-making advice
- requires step-by-step thinking
Examples:
"Should I allocate $50k?"
"Build me a portfolio"
"Full risk breakdown and mitigations"
"How should I diversify $5M?"
"Analyze this deal deeply"

--------------------------------------------------

Rules:

If the question asks for:
- general explanation (no numbers/analysis/decision) → simple_fast
- quick fact → simple
- trends/comparisons → industry
- advice/decisions/deep analysis → detail

When unsure, choose the LOWER tier.

Return only one word:
simple_fast OR simple OR industry OR detail

User question:
`;

// --- Tier-specific answer prompts ---
const SIMPLE_FAST_PROMPT = `You are a fast private markets assistant.

Answer the question directly in 1-2 sentences.

Rules:
- max 2 sentences
- no analysis
- no hedging
- no numbers unless asked
- no decision-making
- just the answer

Be concise and factual.
`;

const SIMPLE_PROMPT = `You are a fast private markets assistant.

Answer the question directly and briefly.

Rules:
- max 2 sentences
- no analysis
- no hedging
- no essays
- just the answer

Be concise and factual.
`;

const INDUSTRY_PROMPT = `You are a private markets analyst.

Provide a short market-level answer.

Rules:
- 3–5 bullet points
- include trends or signals
- highlight what matters
- avoid long paragraphs
- do NOT give personal investment advice

Focus on synthesis and insights, not explanation.
`;

const DETAIL_PROMPT = `You are a private markets investment strategist.

Provide a structured, decision-ready answer.

Rules:
- use clear sections
- include reasoning
- include risks
- include tradeoffs
- keep concise but thoughtful
- avoid fluff

Format:

Summary
Key Factors
Risks
Suggested Approach
`;

const systemByTier: Record<ConciergeQueryTier, string> = {
  simple_fast: SIMPLE_FAST_PROMPT,
  simple: SIMPLE_PROMPT,
  industry: INDUSTRY_PROMPT,
  detail: DETAIL_PROMPT,
};

function parseTier(raw: string): ConciergeQueryTier {
  const t = raw.toLowerCase().trim();
  if (t.includes("simple_fast") || t.includes("simple-fast")) return "simple_fast";
  if (t.includes("industry")) return "industry";
  if (t.includes("detail")) return "detail";
  return "simple";
}

/** Layer 1: classify user query as simple | industry | detail. Router only, temp 0. */
async function classify(
  userMessage: string,
  requestId: string,
  onLog: (meta: Record<string, unknown>) => void
): Promise<ConciergeQueryTier> {
  onLog({ layer: "classification", userMessage });
  const rawOut = await chat(
    [{ role: "user", content: CLASSIFY_PROMPT + userMessage }],
    { requestId, max_tokens: 16, temperature: 0 }
  );
  const tier = parseTier(rawOut);
  onLog({ layer: "classification", rawResponse: rawOut, tier });
  return tier;
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

/** Layer 2: answer using tier-specific prompt + context + web results. */
async function answer(
  userMessage: string,
  tier: ConciergeQueryTier,
  contextCompany: Company | null,
  webResults: BraveSearchResult[],
  requestId: string,
  onLog: (meta: Record<string, unknown>) => void
): Promise<string> {
  const contextBlock = contextCompany
    ? `Current deal context: ${contextCompany.shortName} (${contextCompany.sector}), demand ${contextCompany.demandIndex}/100, supply ${contextCompany.supplyIndex}/100.`
    : "No specific deal selected; answer in general terms.";

  const webBlock = formatWebResults(webResults);
  const webSection = webBlock
    ? `\n\nUse the following web search results to ground your answer when relevant. If they don't apply, answer from general knowledge.\n\n--- Web search results ---\n${webBlock}\n---`
    : "";

  const system = systemByTier[tier] + "\n\n" + contextBlock + webSection;

  const userContent = webBlock
    ? `${userMessage}\n\n[Use the web results above where they help.]`
    : userMessage;

  // Hard cap tokens by tier
  const maxTokensByTier: Record<ConciergeQueryTier, number> = {
    simple_fast: 80,
    simple: 180,
    industry: 180,
    detail: 400,
  };
  const maxTokens = maxTokensByTier[tier];

  onLog({ layer: "main", userMessage, tier, contextCompany: contextCompany?.shortName ?? null, maxTokens });
  const content = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    { requestId, max_tokens: maxTokens, temperature: 0.3 }
  );
  onLog({
    layer: "main",
    responseLength: content.length,
    response: content.length > 500 ? content.slice(0, 500) + "…" : content,
  });
  return content;
}

export async function POST(req: Request) {
  const requestId =
    req.headers.get(REQUEST_ID_HEADER) ??
    `concierge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const logMeta = (msg: string, meta?: Record<string, unknown>) =>
    logPretty("concierge", msg, { requestId, ...meta });

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
  const tier = await classify(message, requestId, (meta) =>
    logMeta("concierge.classification", meta)
  );
  const classifyMs = Date.now() - t0;
  logMeta("concierge.classify.done", { tier, classifyMs });

  // Only search for industry + detail tiers
  let webResults: BraveSearchResult[] = [];
  if (tier !== "simple_fast") {
    const searchQuery = contextCompany
      ? `${contextCompany.shortName} ${message}`.trim()
      : message;
    logMeta("concierge.web_search.input", { searchQuery, tier });
    const tSearch = Date.now();
    const rawResults = await braveSearch(searchQuery, { timeoutMs: 8000 });
    // Limit web results: 2 for industry, 4 for detail
    const maxResults = tier === "industry" ? 2 : tier === "detail" ? 4 : 10;
    webResults = rawResults.slice(0, maxResults);
    const searchMs = Date.now() - tSearch;
    logMeta("concierge.web_search.done", {
      searchMs,
      resultCount: webResults.length,
      maxResults,
      results: webResults.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet.slice(0, 200) + (r.snippet.length > 200 ? "…" : ""),
      })),
    });
  } else {
    logMeta("concierge.web_search.skipped", { tier, reason: "simple_fast tier" });
  }

    const t1 = Date.now();
    const content = await answer(
      message,
      tier,
      contextCompany,
      webResults,
      requestId,
      (meta) => logMeta("concierge.main", meta)
    );
    const answerMs = Date.now() - t1;
    logMeta("concierge.answer.done", { answerMs, totalMs: Date.now() - t0 });

    return NextResponse.json({
      content,
      classification: { tier },
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    logPretty("concierge", "request failed", { requestId, error: err }, "error");
    return NextResponse.json(
      { error: err || "Concierge request failed" },
      { status: 500 }
    );
  }
}

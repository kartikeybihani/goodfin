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
- ONLY very small, high-level "how does it work?" questions
- Pattern: "How does [private market investing / finance / secondaries / this work] work?"
- No deal names, no numbers, no trends, no comparisons, no "what's going on"
- Just a short explainer of how something works in general
Examples (ONLY these belong in simple_fast):
"How does private market investing work?"
"How does finance work?"
"How do secondaries work?"
"What is a secondary?" (one-concept definition)
"What does valuation mean?"

If the question is about a specific deal, trends, comparisons, or market context → NOT simple_fast. Use simple or industry.

simple
- Factual lookups about ONE deal (this deal's valuation, risks, summary)
- Short answers that do NOT need market/trend data
- Definitions in context, yes/no, quick summaries
Examples:
"Summarize this deal"
"SpaceX valuation?"
"Key risks in one line"
"Tell me about SpaceX"
"Explain this quickly"

industry
- ANY question about trends, valuation trend, how things are moving, what's going on in the market
- Sector or market level trends, comparisons across companies
- Macro or thematic questions; requires synthesis or current market context (use web search)
Examples:
"What's the valuation trend?"
"How is valuation trending?"
"Compare SpaceX vs Stripe"
"What sectors are hot this year?"
"Top private market trends"
"How are secondaries doing?"

detail
- Deep analysis, portfolio allocation, multi-factor reasoning
- Personalized or decision-making advice; requires step-by-step thinking
Examples:
"Should I allocate $50k?"
"Build me a portfolio"
"Full risk breakdown and mitigations"
"Analyze this deal deeply"

--------------------------------------------------

Rules:

- simple_fast ONLY for "how does [X] work?" or single-concept definitions. Everything else → simple or higher.
- Deal-specific facts/summaries → simple
- Trends / comparisons / market-level → industry
- Advice / decisions / deep analysis → detail

When unsure between simple_fast and simple, choose simple. When unsure between simple and industry, choose industry.

Return only one word:
simple_fast OR simple OR industry OR detail

User question:
`;

// --- Tier-specific answer prompts ---
const SIMPLE_FAST_PROMPT = `You are a private markets assistant specializing in secondary markets, venture capital, and private equity deals.

IMPORTANT: This platform is ONLY for private markets investing (secondary transactions, VC/PE deals, private company shares). NEVER mention stocks, bonds, ETFs, public markets, or traditional asset allocation.

Answer the "how does it work?" or definition question in a short, clear explainer (up to 5 sentences). No analysis, no numbers unless asked, no decision-making—just a straightforward explanation for private markets only.

Rules:
- 3–5 sentences
- no hedging
- focus on private markets context only

Be clear and factual.
`;

const SIMPLE_PROMPT = `You are a fast private markets assistant specializing in secondary markets, venture capital, and private equity deals.

IMPORTANT: This platform is ONLY for private markets investing (secondary transactions, VC/PE deals, private company shares). NEVER mention stocks, bonds, ETFs, public markets, or traditional asset allocation.

Answer the question directly and briefly about private markets only.

Rules:
- max 7 sentences, little analysis is fine.
- no hedging
- no essays
- just the answer
- focus on private markets context only

Be concise and factual.
`;

const INDUSTRY_PROMPT = `You are a private markets analyst specializing in secondary markets, venture capital, and private equity.

IMPORTANT: This platform is ONLY for private markets investing (secondary transactions, VC/PE deals, private company shares). NEVER mention stocks, bonds, ETFs, public markets, or traditional asset allocation.

Provide a comprehensive, detailed market-level answer about private markets trends, sectors, and deal dynamics. Use the web search results to provide current, specific information.

Rules:
- Write in clear paragraphs (not just bullet points)
- Provide rich detail: specific deals, companies, valuations, trends, and market dynamics
- Synthesize information from multiple web sources when available
- Include concrete examples, numbers, and specific market signals
- Explain the "why" behind trends, not just what's happening
- Highlight what matters for private market investors
- Do NOT give personal investment advice
- Focus exclusively on private markets context
- If web results mention public markets, ignore those parts and focus only on private market information
- Aim for depth and insight, not surface-level summaries

Structure your answer with clear sections if helpful, but prioritize rich detail and comprehensive coverage.
`;

const DETAIL_PROMPT = `You are a private markets investment strategist specializing in secondary markets, venture capital, and private equity deals.

CRITICAL: This platform is EXCLUSIVELY for private markets investing. You MUST focus on:
- Secondary market transactions (buying/selling private company shares)
- Venture capital and private equity deals
- Private company valuations and deal terms
- Allocation to specific private companies/deals
- Private market dynamics, demand/supply, pricing

NEVER mention:
- Stocks, bonds, ETFs, mutual funds, or public markets
- Traditional asset allocation (stocks/bonds/cash splits)
- Public market investment strategies
- Robo-advisors or public market financial advisors

When discussing allocation, focus on:
- Which private deals/companies to consider
- Deal-specific factors (valuation, terms, demand/supply signals)
- Portfolio construction across private market opportunities
- Secondary market dynamics and timing

Provide a comprehensive, structured, decision-ready answer about private markets only. Use web search results to provide current, specific information.

Rules:
- Use clear sections with rich detail
- Include specific examples, numbers, valuations, and concrete market signals
- Synthesize information from multiple web sources when available
- Include deep reasoning specific to private markets
- Include comprehensive risks specific to private market investments
- Include detailed tradeoffs between different private deals
- Provide actionable insights, not surface-level summaries
- If web results mention public markets, ignore those parts completely
- NEVER suggest public market investments

Format:

Summary (2-3 sentences)
Key Factors (deal-specific, private market context with specific details, examples, and numbers)
Risks (comprehensive private market risks: illiquidity, valuation uncertainty, deal terms, market dynamics)
Suggested Approach (which private deals/companies to consider, allocation across private opportunities, timing considerations)
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
  const start = Date.now();
  const rawOut = await chat(
    [{ role: "user", content: CLASSIFY_PROMPT + userMessage }],
    { requestId, max_tokens: 400, temperature: 0 }
  );
  const tier = parseTier(rawOut);
  const elapsed = Date.now() - start;
  onLog({ tier, elapsedMs: elapsed });
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

function logWebResults(requestId: string, results: BraveSearchResult[]): void {
  const lines: string[] = [
    "",
    "[concierge] web_search_results",
    `  requestId: ${requestId}`,
    `  count: ${results.length}`,
    "",
    ...results.map((r, i) => {
      const n = i + 1;
      return [
        `  --- ${n}. ${r.title}`,
        `      ${r.url}`,
        `      ${r.snippet.replace(/\n/g, " ").slice(0, 120)}${r.snippet.length > 120 ? "…" : ""}`,
      ].join("\n");
    }),
    "",
  ];
  console.log(lines.join("\n"));
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
    ? `Current private market deal context: ${contextCompany.shortName} (${contextCompany.sector}), demand ${contextCompany.demandIndex}/100, supply ${contextCompany.supplyIndex}/100. This is a private markets secondary transaction opportunity.`
    : "No specific private market deal selected; answer in general private markets terms only.";

  const webBlock = formatWebResults(webResults);
  const webSection = webBlock
    ? `\n\nCRITICAL: Use the following web search results to provide current, specific information about private markets. 

IMPORTANT FILTERING RULES:
- ONLY use information about private markets: venture capital, private equity, secondary markets, private company deals, pre-IPO companies, unicorns, startup funding rounds
- COMPLETELY IGNORE any information about public markets: stocks, stock market, public companies, IPOs (unless discussing pre-IPO private companies), bonds, ETFs, public market indices
- If a result is primarily about public markets, skip it entirely
- Extract only private market insights from mixed results
- Prioritize results that specifically mention "private markets", "venture capital", "private equity", "secondary market", "startup funding", "unicorn"

Synthesize information from multiple sources when available. Provide specific details: company names, deal sizes, valuations, dates, investor names, market trends, and concrete examples.

--- Web search results ---
${webBlock}
---

Now provide a comprehensive answer using ONLY the private markets information from the results above.`
    : "";

  const system = systemByTier[tier] + "\n\n" + contextBlock + webSection;

  const userContent = webBlock
    ? `${userMessage}\n\n[Use the web results above where they help.]`
    : userMessage;

  // Hard cap tokens by tier
  const maxTokensByTier: Record<ConciergeQueryTier, number> = {
    simple_fast: 350,
    simple: 400,
    industry: 1000, // Increased for rich, detailed answers
    detail: 1200, // Increased for comprehensive analysis
  };
  const maxTokens = maxTokensByTier[tier];

  const start = Date.now();
  const content = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    { requestId, max_tokens: maxTokens, temperature: 0.3 }
  );
  const elapsed = Date.now() - start;
  onLog({ elapsedMs: elapsed });
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

  logMeta("user_message", { text: message });

  const t0 = Date.now();
  const tier = await classify(message, requestId, (meta) =>
    logMeta("classification", meta)
  );

  // Only search for industry + detail tiers (skip for simple_fast and simple)
  let webResults: BraveSearchResult[] = [];
  if (tier === "industry" || tier === "detail") {
    // Enhance search query to focus on private markets
    // Add "private markets" context unless already present
    const messageLower = message.toLowerCase();
    const hasPrivateMarketsContext = 
      messageLower.includes("private market") ||
      messageLower.includes("private equity") ||
      messageLower.includes("venture capital") ||
      messageLower.includes("vc") ||
      messageLower.includes("pe") ||
      messageLower.includes("secondary") ||
      messageLower.includes("pre-ipo") ||
      messageLower.includes("unicorn");
    
    let searchQuery = contextCompany
      ? `${contextCompany.shortName} ${message}`.trim()
      : message;
    
    // Add private markets context if not present
    if (!hasPrivateMarketsContext) {
      searchQuery = `${searchQuery} private markets venture capital private equity`;
    }
    
    const tSearch = Date.now();
    const rawResults = await braveSearch(searchQuery, { timeoutMs: 8000 });
    // Limit web results: 10 for industry (more results = richer answers), 15 for detail
    const maxResults = tier === "industry" ? 10 : 15;
    webResults = rawResults.slice(0, maxResults);
    const searchMs = Date.now() - tSearch;
    logMeta("web_search", {
      resultCount: webResults.length,
      elapsedMs: searchMs,
    });
    if (webResults.length > 0) {
      logWebResults(requestId, webResults);
    }
  }

    const content = await answer(
      message,
      tier,
      contextCompany,
      webResults,
      requestId,
      (meta) => logMeta("answer", meta)
    );
    const totalMs = Date.now() - t0;
    logMeta("total", { elapsedMs: totalMs });

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

import type {
  Company,
  InvestorActivitySnapshot,
  MarketInsight,
  NewsItem,
} from "./types";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function isoMonthsAgo(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}

export const companies: Company[] = [
  {
    id: "spacex",
    name: "SpaceX",
    shortName: "SpaceX",
    sector: "Aerospace & Defense",
    stage: "Pre-IPO",
    valuationRange: "$400B–$450B",
    secondaryRange: "$165–$182 / share",
    trend30d: 12.1,
    discountToLastRoundPct: -4.0,
    demandIndex: 87,
    supplyIndex: 31,
    watchersThisWeek: 2134,
    thesisBullets: [
      "Starlink subscriber growth remains the primary valuation driver",
      "Secondary liquidity tightening; blocks clearing faster than 90 days ago",
      "Defense tailwinds: satellite + launch capacity increasingly strategic",
    ],
    risks: [
      "Regulatory + geopolitical headline risk",
      "Launch cadence volatility; execution risk spikes around new vehicle cycles",
      "Secondary price dispersion widening across brokers",
    ],
    aiSummary:
      "Secondary prints imply improving clears and modest premium to the last indicated range. Demand is concentrated among late-stage growth funds and family offices seeking space + defense exposure.",
    valuationSeries: [
      { date: isoMonthsAgo(11), value: 356 },
      { date: isoMonthsAgo(10), value: 362 },
      { date: isoMonthsAgo(9), value: 368 },
      { date: isoMonthsAgo(8), value: 374 },
      { date: isoMonthsAgo(7), value: 382 },
      { date: isoMonthsAgo(6), value: 377 },
      { date: isoMonthsAgo(5), value: 385 },
      { date: isoMonthsAgo(4), value: 392 },
      { date: isoMonthsAgo(3), value: 401 },
      { date: isoMonthsAgo(2), value: 409 },
      { date: isoMonthsAgo(1), value: 418 },
      { date: isoDaysAgo(7), value: 429 },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    shortName: "Anthropic",
    sector: "AI Foundation Models",
    stage: "Late-stage",
    valuationRange: "$55B–$75B",
    secondaryRange: "$42–$48 / share",
    trend30d: 6.4,
    discountToLastRoundPct: 9.0,
    demandIndex: 92,
    supplyIndex: 18,
    watchersThisWeek: 1648,
    thesisBullets: [
      "Demand > supply (3.1x) across brokers; most blocks oversubscribed",
      "Enterprise seat expansion + usage-based ramps drive forward revenue sentiment",
      "Strategic buyer interest appears to anchor valuation expectations",
    ],
    risks: [
      "Model commoditization pressure; pricing power uncertain",
      "Compute supply constraints can cap near-term growth",
      "Safety / governance scrutiny may delay go-to-market motion",
    ],
    aiSummary:
      "Market is pricing scarcity. Best clears are for clean paper with short lockups; dispersion widens for longer restrictions. Investors prefer structured allocations over open-market blocks.",
    valuationSeries: [
      { date: isoMonthsAgo(11), value: 38 },
      { date: isoMonthsAgo(10), value: 41 },
      { date: isoMonthsAgo(9), value: 44 },
      { date: isoMonthsAgo(8), value: 47 },
      { date: isoMonthsAgo(7), value: 51 },
      { date: isoMonthsAgo(6), value: 49 },
      { date: isoMonthsAgo(5), value: 53 },
      { date: isoMonthsAgo(4), value: 57 },
      { date: isoMonthsAgo(3), value: 60 },
      { date: isoMonthsAgo(2), value: 62 },
      { date: isoMonthsAgo(1), value: 65 },
      { date: isoDaysAgo(7), value: 68 },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    shortName: "Stripe",
    sector: "Fintech Infrastructure",
    stage: "Pre-IPO",
    valuationRange: "$70B–$95B",
    secondaryRange: "$56–$61 / share",
    trend30d: 3.2,
    discountToLastRoundPct: 14.5,
    demandIndex: 81,
    supplyIndex: 42,
    watchersThisWeek: 1896,
    thesisBullets: [
      "Secondary discount narrowing as blocks clear closer to the top of range",
      "Durable SMB payments + enterprise expansion narrative returns",
      "Late-stage investors leaning in as rate path stabilizes",
    ],
    risks: [
      "Macro sensitivity via merchant volumes",
      "Competitive pressure in embedded payments and orchestration",
      "IPO timing uncertainty; long-duration hold risk",
    ],
    aiSummary:
      "Pricing shows a steadier bid/ask than last quarter. Large blocks need modest discounts, but smaller allocations clear quickly. Investor interest skews toward hedge funds and crossover.",
    valuationSeries: [
      { date: isoMonthsAgo(11), value: 58 },
      { date: isoMonthsAgo(10), value: 56 },
      { date: isoMonthsAgo(9), value: 54 },
      { date: isoMonthsAgo(8), value: 53 },
      { date: isoMonthsAgo(7), value: 55 },
      { date: isoMonthsAgo(6), value: 57 },
      { date: isoMonthsAgo(5), value: 60 },
      { date: isoMonthsAgo(4), value: 62 },
      { date: isoMonthsAgo(3), value: 63 },
      { date: isoMonthsAgo(2), value: 65 },
      { date: isoMonthsAgo(1), value: 66 },
      { date: isoDaysAgo(7), value: 68 },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    shortName: "OpenAI",
    sector: "AI Applications",
    stage: "Late-stage",
    valuationRange: "$90B–$135B",
    secondaryRange: "$78–$86 / share",
    trend30d: 4.8,
    discountToLastRoundPct: 7.5,
    demandIndex: 90,
    supplyIndex: 22,
    watchersThisWeek: 2134,
    thesisBullets: [
      "Best-in-class demand concentration; strong crossover interest",
      "Revenue visibility improved via enterprise contracts",
      "Secondary route preferred over primary access for most allocators",
    ],
    risks: [
      "Governance complexity; structural changes can reprice risk",
      "Compute costs and margin uncertainty",
      "Regulatory regimes may constrain distribution",
    ],
    aiSummary:
      "Active secondary with tight spreads on high-quality paper. Investors are paying for momentum but will demand downside protection for longer lockups.",
    valuationSeries: [
      { date: isoMonthsAgo(11), value: 62 },
      { date: isoMonthsAgo(10), value: 63 },
      { date: isoMonthsAgo(9), value: 66 },
      { date: isoMonthsAgo(8), value: 68 },
      { date: isoMonthsAgo(7), value: 71 },
      { date: isoMonthsAgo(6), value: 69 },
      { date: isoMonthsAgo(5), value: 74 },
      { date: isoMonthsAgo(4), value: 78 },
      { date: isoMonthsAgo(3), value: 83 },
      { date: isoMonthsAgo(2), value: 88 },
      { date: isoMonthsAgo(1), value: 92 },
      { date: isoDaysAgo(7), value: 96 },
    ],
  },
  {
    id: "anduril",
    name: "Anduril",
    shortName: "Anduril",
    sector: "Defense Tech",
    stage: "Growth",
    valuationRange: "$24B–$33B",
    secondaryRange: "$21–$24 / share",
    trend30d: 8.7,
    discountToLastRoundPct: 11.0,
    demandIndex: 84,
    supplyIndex: 36,
    watchersThisWeek: 1128,
    thesisBullets: [
      "Defense tech demand accelerating; allocators shifting from pure SaaS to strategic categories",
      "Repeat procurement signals strengthen multi-year revenue confidence",
      "Secondary buyers prefer shorter lockups, strong information rights",
    ],
    risks: [
      "Contract timing risk; lumpy revenue recognition",
      "Supply chain constraints for hardware programs",
      "Policy shifts can move procurement priorities",
    ],
    aiSummary:
      "Bid side is consistently present, but pricing remains sensitive to contract updates. Strongest interest is in diversified defense exposure with software-defined hardware.",
    valuationSeries: [
      { date: isoMonthsAgo(11), value: 17 },
      { date: isoMonthsAgo(10), value: 18 },
      { date: isoMonthsAgo(9), value: 19 },
      { date: isoMonthsAgo(8), value: 19 },
      { date: isoMonthsAgo(7), value: 20 },
      { date: isoMonthsAgo(6), value: 21 },
      { date: isoMonthsAgo(5), value: 21 },
      { date: isoMonthsAgo(4), value: 22 },
      { date: isoMonthsAgo(3), value: 23 },
      { date: isoMonthsAgo(2), value: 24 },
      { date: isoMonthsAgo(1), value: 25 },
      { date: isoDaysAgo(7), value: 26 },
    ],
  },
  {
    id: "databricks",
    name: "Databricks",
    shortName: "Databricks",
    sector: "AI Infrastructure",
    stage: "Pre-IPO",
    valuationRange: "$40B–$55B",
    secondaryRange: "$32–$36 / share",
    trend30d: 2.1,
    discountToLastRoundPct: 16.0,
    demandIndex: 73,
    supplyIndex: 49,
    watchersThisWeek: 980,
    thesisBullets: [
      "Data platform + AI tooling remains a core enterprise budget line",
      "Secondary supply consistent; larger blocks require price discovery",
      "Investors underwrite to expansion + durable retention",
    ],
    risks: [
      "Cloud vendor competition; pricing pressure",
      "Execution complexity from product surface area",
      "Multiple compression risk in infra category",
    ],
    aiSummary:
      "Healthy but more price-sensitive than frontier AI names. Best opportunity is capturing a tighter entry via blocks with clean documentation and standard transfer terms.",
    valuationSeries: [
      { date: isoMonthsAgo(11), value: 36 },
      { date: isoMonthsAgo(10), value: 35 },
      { date: isoMonthsAgo(9), value: 34 },
      { date: isoMonthsAgo(8), value: 34 },
      { date: isoMonthsAgo(7), value: 35 },
      { date: isoMonthsAgo(6), value: 35 },
      { date: isoMonthsAgo(5), value: 36 },
      { date: isoMonthsAgo(4), value: 37 },
      { date: isoMonthsAgo(3), value: 38 },
      { date: isoMonthsAgo(2), value: 39 },
      { date: isoMonthsAgo(1), value: 40 },
      { date: isoDaysAgo(7), value: 41 },
    ],
  },
];

export const investorActivity: InvestorActivitySnapshot = {
  viewsThisWeek: 2134,
  topSectors: ["AI infra", "biotech", "defense tech"],
  avgDealSizeTrendPct: 18,
  topCompaniesByViews: [
    { id: "openai", name: "OpenAI", views: 2134 },
    { id: "stripe", name: "Stripe", views: 1896 },
    { id: "spacex", name: "SpaceX", views: 1648 },
  ],
};

export const insights: MarketInsight[] = [
  {
    id: "mult-compress",
    text: "Late-stage AI multiples are compressing; quality paper still clears at a premium.",
    direction: "down",
    confidence: 0.74,
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "health-disc",
    text: "Healthcare secondaries are trading ~20% below last marked rounds; the best clears are in revenue-positive names.",
    direction: "down",
    confidence: 0.68,
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "defense",
    text: "Defense tech is seeing higher clears; buyers are prioritizing contract visibility and information rights.",
    direction: "up",
    confidence: 0.71,
    updatedAt: isoDaysAgo(0),
  },
  {
    id: "discount-narrow",
    text: "Fintech infrastructure discounts are narrowing as rate expectations stabilize and crossover returns.",
    direction: "up",
    confidence: 0.63,
    updatedAt: isoDaysAgo(3),
  },
];

export const news: NewsItem[] = [
  {
    id: "n1",
    headline: "Secondary desks report tighter spreads in top-tier AI names",
    source: "Goodfin Desk",
    publishedAt: isoDaysAgo(0),
    tags: ["secondary", "ai"],
    sentiment: "positive",
  },
  {
    id: "n2",
    headline: "Defense tech allocations up as allocators rotate from mega-cap public exposure",
    source: "Private Markets Brief",
    publishedAt: isoDaysAgo(1),
    tags: ["defense", "allocation"],
    sentiment: "positive",
  },
  {
    id: "n3",
    headline: "Healthcare blocks clear with wider dispersion; quality paper still commands bid",
    source: "Secondary Wire",
    publishedAt: isoDaysAgo(2),
    tags: ["healthcare", "pricing"],
    sentiment: "neutral",
  },
  {
    id: "n4",
    headline: "Family offices increasingly favor structured secondaries over open-market blocks",
    source: "Goodfin Insights",
    publishedAt: isoDaysAgo(3),
    tags: ["structure", "demand"],
    sentiment: "neutral",
  },
  {
    id: "n5",
    headline: "Late-stage growth funds lean into pre-IPO baskets; underwriting shifts to liquidity windows",
    source: "PM Rundown",
    publishedAt: isoDaysAgo(5),
    tags: ["pre-ipo", "liquidity"],
    sentiment: "negative",
  },
];

export function getCompanyById(id: string) {
  return companies.find((c) => c.id === id);
}

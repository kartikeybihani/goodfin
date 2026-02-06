export type TrendDirection = "up" | "down" | "flat";

export type MarketInsight = {
  id: string;
  text: string;
  direction: TrendDirection;
  confidence: number; // 0-1
  updatedAt: string; // ISO
};

export type NewsItem = {
  id: string;
  headline: string;
  source: string;
  publishedAt: string; // ISO
  tags: string[];
  sentiment: "positive" | "neutral" | "negative";
};

export type SeriesPoint = {
  date: string; // ISO
  value: number;
};

export type Company = {
  id: string;
  name: string;
  shortName: string;
  sector: string;
  stage: "Late-stage" | "Growth" | "Pre-IPO";
  valuationRange: string;
  secondaryRange: string;
  trend30d: number; // percent
  discountToLastRoundPct?: number; // percent
  demandIndex: number; // 0-100
  supplyIndex: number; // 0-100
  watchersThisWeek: number;
  thesisBullets: string[];
  risks: string[];
  aiSummary: string;
  valuationSeries: SeriesPoint[];
};

export type InvestorActivitySnapshot = {
  viewsThisWeek: number;
  topSectors: string[];
  avgDealSizeTrendPct: number;
  topCompaniesByViews: { id: string; name: string; views: number }[];
};

export type ConciergeIntent =
  | "summarize"
  | "risks"
  | "allocate"
  | "compare";

export type ConciergeMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};


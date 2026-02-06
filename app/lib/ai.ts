import type { Company, ConciergeIntent } from "./types";
import { formatPct } from "./utils";

type ConciergeInput = {
  company?: Company;
  intent: ConciergeIntent;
  compareTo?: Company;
  amountUsd?: number;
};

export function runConcierge(input: ConciergeInput) {
  const { company, intent, compareTo, amountUsd } = input;

  if (!company) {
    return "Pick a deal to get a tighter, deal-specific read. I can summarize, flag risks, and suggest an allocation posture in ~10 seconds.";
  }

  if (intent === "summarize") {
    return [
      `${company.shortName}: demand is ${company.demandIndex}/100 with supply ${company.supplyIndex}/100.`,
      `30d move: ${formatPct(company.trend30d)}; secondary range ${company.secondaryRange}.`,
      `What the tape says: ${company.aiSummary}`,
    ].join("\n");
  }

  if (intent === "risks") {
    const top = company.risks.slice(0, 3).map((r) => `• ${r}`);
    return [
      `Top risks for ${company.shortName}:`,
      ...top,
      "Mitigation: prioritize clean paper + strong information rights; avoid long lockups without downside protection.",
    ].join("\n");
  }

  if (intent === "allocate") {
    const amountLine = amountUsd
      ? `Sizing: for a $${amountUsd.toLocaleString("en-US")} ticket, prefer 2–3 tranches to average clears.`
      : "Sizing: prefer 2–3 tranches to average clears.";

    const posture =
      company.demandIndex >= 88
        ? "Allocation posture: scarcity name — pay for speed, but demand transfer-friendly terms."
        : company.demandIndex >= 78
          ? "Allocation posture: balanced — target mid-range pricing; insist on tighter documentation."
          : "Allocation posture: price-sensitive — wait for wider discount or better information rights.";

    const discountLine =
      company.discountToLastRoundPct == null
        ? "Entry guardrails: avoid paying above the top of range; discount vs last round is not provided in this demo."
        : `Entry guardrails: avoid paying above the top of range; watch discount vs last round (${company.discountToLastRoundPct.toFixed(1)}%).`;

    return [
      posture,
      amountLine,
      discountLine,
    ].join("\n");
  }

  if (intent === "compare") {
    if (!compareTo) {
      return "Pick a comparison deal and I’ll give you a 15-second side-by-side on demand, pricing dispersion, and risk.";
    }

    const demandDelta = company.demandIndex - compareTo.demandIndex;
    const supplyDelta = company.supplyIndex - compareTo.supplyIndex;
    return [
      `${company.shortName} vs ${compareTo.shortName}:`,
      `Demand: ${company.demandIndex} vs ${compareTo.demandIndex} (${demandDelta >= 0 ? "+" : ""}${demandDelta}).`,
      `Supply: ${company.supplyIndex} vs ${compareTo.supplyIndex} (${supplyDelta >= 0 ? "+" : ""}${supplyDelta}).`,
      `Tape: ${company.shortName} is ${company.trend30d >= compareTo.trend30d ? "stronger" : "weaker"} on 30d trend (${formatPct(company.trend30d)} vs ${formatPct(compareTo.trend30d)}).`,
      "Action: choose the higher-demand name for momentum; choose the higher-supply name for price negotiation leverage.",
    ].join("\n");
  }

  return "I can summarize, flag risks, suggest allocation posture, or compare deals.";
}

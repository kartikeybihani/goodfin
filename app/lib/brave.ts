/**
 * Brave Search API helper for Finny web research.
 * Provides fresh web data for financial queries that need current information.
 */

export type BraveSearchResult = {
  title: string;
  url: string;
  snippet: string;
  content: string;
};

export type BraveSearchOptions = {
  timeoutMs?: number;
  signal?: AbortSignal;
};

export async function braveSearch(
  query: string,
  options: BraveSearchOptions = {}
): Promise<BraveSearchResult[]> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    if (!process.env.BRAVE_API_KEY) {
      console.warn("[brave] No BRAVE_API_KEY, skipping web search");
      return [];
    }

    const timeoutMs =
      typeof options.timeoutMs === "number" ? options.timeoutMs : 10000;
    const controller = new AbortController();
    const externalSignal = options.signal;

    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else
        externalSignal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
    }
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "X-Subscription-Token": process.env.BRAVE_API_KEY,
          Accept: "application/json",
          "Accept-Encoding": "gzip",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      console.error("[brave] API request failed:", response.status, response.statusText);
      return [];
    }

    const data = (await response.json()) as {
      web?: { results?: Array<{ title?: string; url?: string; description?: string; snippet?: string }> };
    };
    const results: BraveSearchResult[] =
      data.web?.results?.slice(0, 5).map((result, index) => {
        const snippet =
          result.description ?? result.snippet ?? "No description available";
        return {
          title: result.title ?? `Result ${index + 1}`,
          url: result.url ?? "",
          snippet,
          content: snippet,
        };
      }) ?? [];

    return results;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[brave] Search aborted (timeout or cancel)");
      return [];
    }
    console.error("[brave] Search failed:", error instanceof Error ? error.message : String(error));
    return [];
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

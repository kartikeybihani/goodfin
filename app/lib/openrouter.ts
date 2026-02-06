/**
 * Open Router client for Llama 4 Scout 17B (16E) and compatible models.
 * Logs all requests with requestId and timing.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export type OpenRouterMessage = { role: "system" | "user" | "assistant"; content: string };

type ChatOptions = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  requestId?: string;
};

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

function log(level: "info" | "warn" | "error", requestId: string, message: string, meta?: Record<string, unknown>) {
  const payload = { requestId, ...meta };
  const line = `[concierge] ${level} ${JSON.stringify({ ...payload, message })}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export async function chat(
  messages: OpenRouterMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const requestId = options.requestId ?? `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const model = options.model ?? DEFAULT_MODEL;
  const start = Date.now();

  log("info", requestId, "openrouter.chat.start", { model, messageCount: messages.length });

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://goodfin.vercel.app",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 1024,
      }),
    });

    const elapsed = Date.now() - start;

    if (!res.ok) {
      const errText = await res.text();
      log("error", requestId, "openrouter.chat.http_error", {
        status: res.status,
        body: errText.slice(0, 500),
        elapsedMs: elapsed,
      });
      throw new Error(`Open Router: ${res.status} ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const content = data.choices?.[0]?.message?.content ?? "";
    log("info", requestId, "openrouter.chat.done", {
      elapsedMs: elapsed,
      usage: data.usage,
      finishReason: data.choices?.[0]?.finish_reason,
    });

    return content.trim();
  } catch (e) {
    const elapsed = Date.now() - start;
    log("error", requestId, "openrouter.chat.failed", {
      elapsedMs: elapsed,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}

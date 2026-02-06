/**
 * Pretty logging for AI/concierge layers. JSON is indented in development.
 */

const isDev = process.env.NODE_ENV === "development";

function formatPayload(obj: Record<string, unknown>): string {
  return isDev ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
}

export function log(
  label: string,
  message: string,
  meta?: Record<string, unknown>,
  level: "info" | "warn" | "error" = "info"
): void {
  const payload = { message, ...meta };
  const out = `\n[${label}] ${message}\n${formatPayload(payload)}`;
  if (level === "error") console.error(out);
  else if (level === "warn") console.warn(out);
  else console.log(out);
}

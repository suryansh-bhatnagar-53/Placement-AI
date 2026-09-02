// Server-only wrapper around the Lovable AI Gateway chat completions endpoint.
// Every AI feature in PlacementAI goes through this single function.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const DEFAULT_MODEL = "google/gemini-3.7-flash";

export class AiUnavailableError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AiUnavailableError";
    this.status = status;
  }
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chat(
  messages: ChatMessage[],
  options: { model?: string; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiUnavailableError("AI is not configured for this app.", 500);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      messages,
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      // keep raw body
    }
    if (res.status === 429) {
      throw new AiUnavailableError("The AI is busy right now. Please try again in a moment.", 429);
    }
    if (res.status === 402) {
      throw new AiUnavailableError(
        message || "AI credits are exhausted. Add credits to keep using AI features.",
        402,
      );
    }
    throw new AiUnavailableError(message || "The AI service failed.", res.status);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export type ChatResult = { content: string; finishReason: string };

/**
 * Same call as `chat`, but also returns the provider's `finish_reason` so callers can
 * detect `"length"` truncation and continue the generation.
 */
export async function chatWithFinish(
  messages: ChatMessage[],
  options: { model?: string; maxTokens?: number } = {},
): Promise<ChatResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiUnavailableError("AI is not configured for this app.", 500);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      messages,
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      // keep raw body
    }
    if (res.status === 429) {
      throw new AiUnavailableError("The AI is busy right now. Please try again in a moment.", 429);
    }
    if (res.status === 402) {
      throw new AiUnavailableError(
        message || "AI credits are exhausted. Add credits to keep using AI features.",
        402,
      );
    }
    throw new AiUnavailableError(message || "The AI service failed.", res.status);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  };
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    finishReason: data.choices?.[0]?.finish_reason ?? "stop",
  };
}

/** Strips markdown fences and parses the first JSON object found. Returns null on failure. */
export function parseJsonLoose<T>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

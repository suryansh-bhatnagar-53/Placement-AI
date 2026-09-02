// Guarantees the AI Guide never shows a mid-sentence reply.
// Pure logic — no network, no server imports — so it is directly unit-testable.

export const GUIDE_FALLBACK =
  "I'm having trouble forming a complete answer right now. Please try again.";

const TERMINAL = /[.!?"')\]`]$/;
/** Sentence enders followed by whitespace, or at end of text. */
const SENTENCE_END = /[.!?](?=["')\]]?(\s|$))/g;

export function endsComplete(text: string): boolean {
  const trimmed = text.trimEnd();
  if (!trimmed) return false;
  return TERMINAL.test(trimmed);
}

/** Cuts back to the last complete sentence. Returns "" when there is none. */
export function trimToLastSentence(text: string): string {
  const trimmed = text.trimEnd();
  if (!trimmed) return "";
  if (endsComplete(trimmed)) return trimmed;

  let lastEnd = -1;
  for (const match of trimmed.matchAll(SENTENCE_END)) {
    lastEnd = match.index + match[0].length;
  }
  if (lastEnd <= 0) return "";
  return trimmed.slice(0, lastEnd).trimEnd();
}

export type ModelCall = (
  continuationOf: string | null,
) => Promise<{ content: string; finishReason: string }>;

/**
 * Runs the model call, and if the provider stopped because of the token cap
 * (`finish_reason === "length"`), asks it to continue once. Whatever comes back
 * is trimmed to the last complete sentence; if nothing complete survives, the
 * fallback string is returned. Broken text never reaches the user.
 */
export async function generateCompleteReply(
  call: ModelCall,
  options: { maxContinuations?: number } = {},
): Promise<string> {
  const maxContinuations = options.maxContinuations ?? 1;

  let result = await call(null);
  let text = (result.content ?? "").trim();

  for (let i = 0; i < maxContinuations; i += 1) {
    if (result.finishReason !== "length" && endsComplete(text)) break;
    if (result.finishReason !== "length" && text) break;
    try {
      result = await call(text);
    } catch {
      break;
    }
    const next = (result.content ?? "").trim();
    if (!next) break;
    text = `${text}${text.endsWith(" ") || !text ? "" : " "}${next}`.trim();
  }

  if (endsComplete(text)) return text;
  const trimmed = trimToLastSentence(text);
  return trimmed || GUIDE_FALLBACK;
}

import { describe, expect, it, vi } from "vitest";
import {
  GUIDE_FALLBACK,
  endsComplete,
  generateCompleteReply,
  trimToLastSentence,
} from "./guide-completion";

describe("endsComplete", () => {
  it("accepts terminal punctuation", () => {
    expect(endsComplete("Practice arrays daily.")).toBe(true);
    expect(endsComplete('He said "start with Two Sum."')).toBe(true);
    expect(endsComplete("Ready? ")).toBe(true);
  });
  it("rejects mid-sentence text", () => {
    expect(endsComplete("You should focus on dynamic")).toBe(false);
    expect(endsComplete("")).toBe(false);
  });
});

describe("trimToLastSentence", () => {
  it("cuts back to the last complete sentence", () => {
    expect(trimToLastSentence("Start with arrays. Then move to graphs and")).toBe(
      "Start with arrays.",
    );
  });
  it("returns empty when no sentence completed", () => {
    expect(trimToLastSentence("Start with arrays and")).toBe("");
  });
});

describe("generateCompleteReply", () => {
  it("returns a clean reply untouched", async () => {
    const call = vi.fn().mockResolvedValue({ content: "Focus on DSA.", finishReason: "stop" });
    await expect(generateCompleteReply(call)).resolves.toBe("Focus on DSA.");
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("continues a length-truncated reply and returns a complete sentence", async () => {
    const call = vi
      .fn()
      .mockResolvedValueOnce({ content: "Revise arrays first. Then practise", finishReason: "length" })
      .mockResolvedValueOnce({ content: "two pointer problems daily.", finishReason: "stop" });
    await expect(generateCompleteReply(call)).resolves.toBe(
      "Revise arrays first. Then practise two pointer problems daily.",
    );
    expect(call).toHaveBeenCalledTimes(2);
  });

  it("trims back when the continuation is still truncated", async () => {
    const call = vi
      .fn()
      .mockResolvedValueOnce({ content: "Revise arrays first. Then", finishReason: "length" })
      .mockResolvedValueOnce({ content: "practise more of", finishReason: "length" });
    await expect(generateCompleteReply(call)).resolves.toBe("Revise arrays first.");
  });

  it("falls back when nothing complete survives", async () => {
    const call = vi
      .fn()
      .mockResolvedValueOnce({ content: "Revise arrays and", finishReason: "length" })
      .mockResolvedValueOnce({ content: "then", finishReason: "length" });
    await expect(generateCompleteReply(call)).resolves.toBe(GUIDE_FALLBACK);
  });

  it("falls back on an empty model reply", async () => {
    const call = vi.fn().mockResolvedValue({ content: "", finishReason: "stop" });
    await expect(generateCompleteReply(call)).resolves.toBe(GUIDE_FALLBACK);
  });

  it("uses what it has when the continuation call throws", async () => {
    const call = vi
      .fn()
      .mockResolvedValueOnce({ content: "Do mock interviews weekly. Also", finishReason: "length" })
      .mockRejectedValueOnce(new Error("gateway down"));
    await expect(generateCompleteReply(call)).resolves.toBe("Do mock interviews weekly.");
  });
});

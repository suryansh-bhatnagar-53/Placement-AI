import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { chat } from "./ai.server";
import { buildGuideContext, checkRateLimit, GUIDE_SYSTEM_PROMPT } from "./guide.server";

export const getGuideHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const clearGuideChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendGuideMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ message: z.string().trim().min(1).max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    checkRateLimit(context.userId);

    const contextBlock = await buildGuideContext(context.supabase, context.userId);

    await context.supabase
      .from("chat_messages")
      .insert({ user_id: context.userId, role: "user", content: data.message });

    const reply = await chat(
      [
        {
          role: "system" as const,
          content: `${GUIDE_SYSTEM_PROMPT}\n\nLearner context:\n${contextBlock.summary}`,
        },
        ...contextBlock.recentMessages,
        { role: "user" as const, content: data.message },
      ],
      { maxTokens: 500 },
    );

    const content = reply.trim() || "I could not produce an answer just now. Try rephrasing.";
    await context.supabase
      .from("chat_messages")
      .insert({ user_id: context.userId, role: "assistant", content });

    return { reply: content };
  });

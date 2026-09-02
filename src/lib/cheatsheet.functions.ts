import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { CHEAT_SHEETS } from "./cheatsheet-content";

/** Returns the static cheat sheet for a role plus the learner's weak topics. Zero LLM calls. */
export const getCheatSheet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ role: z.enum(["SE", "ML", "DA"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: gaps } = await context.supabase
      .from("skill_gaps")
      .select("topic, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    const weakTopics = [...new Set((gaps ?? []).map((g) => g.topic))];
    return { sheet: CHEAT_SHEETS[data.role], weak_topics: weakTopics };
  });

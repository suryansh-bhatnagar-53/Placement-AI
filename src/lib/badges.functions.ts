import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ARRANGES, MCQS, THINKING, TRAITS, scoreSubmission, type Trait } from "./badge-interview-content";

export const getMyBadges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_badges")
      .select("earned, curious_mind")
      .eq("user_id", context.userId)
      .maybeSingle();
    const earned = ((data?.earned as string[] | null) ?? []).filter((t): t is Trait =>
      (TRAITS as readonly string[]).includes(t),
    );
    return { earned, curious_mind: Boolean(data?.curious_mind) };
  });

const SubmitSchema = z.object({
  mcq: z.array(z.number().int().min(0).max(3).nullable()).length(MCQS.length),
  arrange: z.array(z.array(z.string().max(4)).max(6).nullable()).length(ARRANGES.length),
  thinking: z.array(z.string().max(4000)).length(THINKING.length),
});

export const submitBadgeInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SubmitSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Scoring happens on the server so badges can't be granted from the browser.
    const { scores, top, skipped } = scoreSubmission(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("user_badges")
      .select("earned, best_scores")
      .eq("user_id", context.userId)
      .maybeSingle();
    const earned = new Set(((row?.earned as string[] | null) ?? []) as string[]);
    const isNew = !earned.has(top);
    earned.add(top);
    const best = { ...((row?.best_scores as Record<string, number> | null) ?? {}) };
    for (const t of TRAITS) best[t] = Math.max(best[t] ?? 0, scores[t]);
    const earnedList = TRAITS.filter((t) => earned.has(t));
    const curious = earnedList.length === TRAITS.length;

    const { error } = await supabaseAdmin.from("user_badges").upsert({
      user_id: context.userId,
      earned: earnedList,
      best_scores: best,
      curious_mind: curious,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Could not save your badge. Please try again.");
    await supabaseAdmin.from("badge_attempts").insert({
      user_id: context.userId,
      scores,
      top_trait: top,
      newly_earned: isNew,
      skipped_count: skipped,
    });

    return { scores, top, isNew, earned: earnedList, curious_mind: curious };
  });

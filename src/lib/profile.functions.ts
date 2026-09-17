import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const OnboardingSchema = z.object({
  name: z.string().trim().min(1).max(80),
  target_role: z.enum(["SE", "ML", "DA"]),
  preferred_languages: z.array(z.enum(["C", "CPP", "PYTHON", "JAVA"])).min(1).max(4),
  gender: z.string().trim().max(40).optional(),
  college: z.string().trim().max(120).optional(),
  course: z.string().trim().max(120).optional(),
  year_of_study: z.string().trim().max(40).optional(),
  personality_answers: z.record(z.string(), z.string()).optional(),
  archetype: z.string().trim().max(60).optional(),
  stat_adaptability: z.number().int().min(0).max(100).optional(),
  stat_resilience: z.number().int().min(0).max(100).optional(),
  stat_focus: z.number().int().min(0).max(100).optional(),
});

const PROFILE_COLUMNS =
  "id, name, target_role, preferred_languages, gender, college, course, year_of_study, personality_answers, archetype, stat_adaptability, stat_resilience, stat_focus, onboarded_at";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OnboardingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("profiles")
      .update({
        name: data.name,
        target_role: data.target_role,
        preferred_languages: data.preferred_languages,
        gender: data.gender ?? null,
        college: data.college ?? null,
        course: data.course ?? null,
        year_of_study: data.year_of_study ?? null,
        personality_answers: data.personality_answers ?? {},
        archetype: data.archetype ?? "The Explorer",
        stat_adaptability: data.stat_adaptability ?? 50,
        stat_resilience: data.stat_resilience ?? 50,
        stat_focus: data.stat_focus ?? 50,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", context.userId)
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

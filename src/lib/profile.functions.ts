import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const OnboardingSchema = z.object({
  name: z.string().trim().min(1).max(80),
  target_role: z.enum(["SE", "ML", "DA"]),
  preferred_languages: z.array(z.enum(["C", "CPP", "PYTHON", "JAVA"])).min(1).max(4),
});

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, name, target_role, preferred_languages")
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
      })
      .eq("id", context.userId)
      .select("id, name, target_role, preferred_languages")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

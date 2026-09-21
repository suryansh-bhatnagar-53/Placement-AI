import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const list = (max: number) => z.array(z.string().trim().min(1).max(200)).max(max);

const ProjectSchema = z.object({
  name: text(120),
  url: text(300),
});

const LinkSchema = z.object({
  label: text(80),
  url: text(300),
});

const DetailsSchema = z
  .object({
    name: text(80).optional(),
    avatar_url: text(400).nullable().optional(),
    phone: text(30).optional(),
    country: text(80).optional(),
    state: text(80).optional(),
    city: text(80).optional(),
    college: text(120).optional(),
    degree: text(120).optional(),
    specialization: text(120).optional(),
    programming_languages: list(30).optional(),
    core_subjects: list(30).optional(),
    additional_skills: list(30).optional(),
    certificates: list(30).optional(),
    projects: z.array(ProjectSchema).max(20).optional(),
    linkedin_url: text(300).optional(),
    additional_links: z.array(LinkSchema).max(20).optional(),
  })
  .strict();

export type ProfileDetails = z.infer<typeof DetailsSchema>;

const COLUMNS =
  "id, name, avatar_url, phone, country, state, city, college, degree, specialization, programming_languages, core_subjects, additional_skills, certificates, projects, linkedin_url, additional_links";

export const getUserProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(COLUMNS)
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      profile: data,
      email: (context.claims as { email?: string } | null)?.email ?? "",
    };
  });

export const saveUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DetailsSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (Object.keys(data).length === 0) return { ok: true };
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  DEFAULT_ARCHETYPE,
  estimateGraduationYear,
  languageLabel,
} from "@/lib/identity-badge";

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
    graduation_year: text(10).optional(),
    target_role: z.enum(["SE", "ML", "DA"]).optional(),
    preferred_languages: z.array(z.enum(["C", "CPP", "PYTHON", "JAVA"])).max(4).optional(),
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
  "id, name, avatar_url, phone, country, state, city, college, degree, specialization, graduation_year, programming_languages, core_subjects, additional_skills, certificates, projects, linkedin_url, additional_links, target_role, preferred_languages, course, year_of_study, archetype, stat_adaptability, stat_resilience, stat_focus, onboarded_at";

const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Splits an onboarding "course" answer like "B.Tech, CSE" into degree + branch. */
function splitCourse(course: string | null): { degree: string; specialization: string } {
  if (!course) return { degree: "", specialization: "" };
  const parts = course.split(/[,|/–-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return { degree: course.trim(), specialization: "" };
  return { degree: parts[0] ?? "", specialization: parts.slice(1).join(", ") };
}

export const getUserProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(COLUMNS)
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const row = data as Record<string, unknown> | null;
    const email = (context.claims as { email?: string } | null)?.email ?? "";
    if (!row) return { profile: null, email, identity: null };

    const str = (key: string): string | null => {
      const v = row[key];
      return typeof v === "string" ? v : null;
    };
    const num = (key: string): number | null => {
      const v = row[key];
      return typeof v === "number" ? v : null;
    };

    // Pre-fill: values still empty in the profile fall back to what onboarding
    // already saved on the SAME row. Nothing is written until the user saves.
    const fromCourse = splitCourse(str("course"));
    const preferred = strList(row["preferred_languages"]);
    const existingLanguages = strList(row["programming_languages"]);

    const profile = {
      id: str("id") ?? "",
      name: str("name") ?? "",
      avatar_url: str("avatar_url"),
      phone: str("phone") ?? "",
      country: str("country") ?? "",
      state: str("state") ?? "",
      city: str("city") ?? "",
      college: str("college") ?? "",
      degree: str("degree") || fromCourse.degree,
      specialization: str("specialization") || fromCourse.specialization,
      graduation_year:
        str("graduation_year") ||
        estimateGraduationYear(str("year_of_study"), str("onboarded_at")),
      programming_languages:
        existingLanguages.length > 0 ? existingLanguages : preferred.map(languageLabel),
      core_subjects: strList(row["core_subjects"]),
      additional_skills: strList(row["additional_skills"]),
      certificates: strList(row["certificates"]),
      projects: Array.isArray(row["projects"])
        ? (row["projects"] as { name: string; url: string }[])
        : ([] as { name: string; url: string }[]),
      linkedin_url: str("linkedin_url") ?? "",
      additional_links: Array.isArray(row["additional_links"])
        ? (row["additional_links"] as { label: string; url: string }[])
        : ([] as { label: string; url: string }[]),
      target_role: str("target_role") ?? "",
      preferred_languages: preferred,
      course: str("course") ?? "",
      year_of_study: str("year_of_study") ?? "",
    };

    const answers = (row["personality_answers"] ?? {}) as Record<string, unknown>;
    // Skipped or unfinished onboarding keeps the default badge + neutral stats.
    const complete = Boolean(str("archetype")) && Object.keys(answers).length > 0;
    const identity = {
      archetype: complete ? (str("archetype") as string) : DEFAULT_ARCHETYPE,
      adaptability: complete ? (num("stat_adaptability") ?? 50) : 50,
      resilience: complete ? (num("stat_resilience") ?? 50) : 50,
      focus: complete ? (num("stat_focus") ?? 50) : 50,
      complete,
    };

    return { profile, email, identity };
  });

export const saveUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DetailsSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (Object.keys(data).length === 0) return { ok: true };
    const patch = data as Record<string, unknown>;
    const { error } = await context.supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

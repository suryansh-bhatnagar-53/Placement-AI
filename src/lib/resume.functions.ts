import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { analyzeResume } from "./ats.server";

const UploadSchema = z.object({
  file_name: z.string().trim().min(1).max(200),
  text: z.string(),
});

export const analyzeResumeText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.text.trim().length < 100) {
      throw new Error("Could not read PDF; ensure it's text-based, not a scanned image");
    }

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("target_role")
      .eq("id", context.userId)
      .maybeSingle();
    const role = profile?.target_role ?? "SE";

    const result = analyzeResume(data.text.slice(0, 40000), role);

    const { data: report, error } = await context.supabase
      .from("ats_reports")
      .insert({
        user_id: context.userId,
        file_name: data.file_name,
        ats_score: result.score,
        breakdown: result.breakdown,
        suggestions: result.suggestions,
      })
      .select("id, ats_score, breakdown, suggestions, file_name, created_at")
      .single();
    if (error) throw new Error(error.message);

    // Keep the newest performance snapshot in sync with the latest ATS score.
    const { data: snapshot } = await context.supabase
      .from("performance_snapshots")
      .select("id")
      .eq("user_id", context.userId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (snapshot) {
      await context.supabase
        .from("performance_snapshots")
        .update({ ats_last_score: result.score })
        .eq("id", snapshot.id);
    }

    return { ...report, matched_keywords: result.matchedKeywords, role };
  });

export const listResumeReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ats_reports")
      .select("id, file_name, ats_score, breakdown, suggestions, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

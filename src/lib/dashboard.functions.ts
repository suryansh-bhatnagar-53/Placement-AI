import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { topicAverages } from "./interview.server";

export const getDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const [profile, snapshot, sessionCount, ats] = await Promise.all([
      supabase
        .from("profiles")
        .select("name, target_role, preferred_languages")
        .eq("id", context.userId)
        .maybeSingle(),
      supabase
        .from("performance_snapshots")
        .select("readiness_score, interviews_taken, ats_last_score")
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("ats_reports")
        .select("ats_score")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      profile: profile.data,
      readiness: snapshot.data ? Number(snapshot.data.readiness_score) : null,
      interviews_taken: sessionCount.count ?? 0,
      ats_last: ats.data?.ats_score ?? null,
    };
  });

export const getPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const [snapshots, sessions, answers, ats] = await Promise.all([
      supabase
        .from("performance_snapshots")
        .select(
          "snapshot_date, readiness_score, interviews_taken, avg_technical, avg_communication, avg_completeness, avg_confidence, ats_last_score",
        )
        .order("snapshot_date", { ascending: true })
        .limit(50),
      supabase
        .from("sessions")
        .select("id, started_at, role, round_type, question_ids, overall_score, status")
        .order("started_at", { ascending: false })
        .limit(20),
      supabase.from("answers").select("question_id, technical_score"),
      supabase
        .from("ats_reports")
        .select("ats_score")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const answerRows = answers.data ?? [];
    const { data: bank } = await supabase
      .from("questions")
      .select("id, topic")
      .in("id", answerRows.length ? answerRows.map((a) => a.question_id) : [-1]);
    const topicById = new Map((bank ?? []).map((q) => [q.id, q.topic]));

    const stats = topicAverages(
      answerRows.map((a) => ({
        topic: topicById.get(a.question_id) ?? "basic",
        technical_score: a.technical_score === null ? null : Number(a.technical_score),
      })),
    );

    return {
      snapshots: (snapshots.data ?? []).map((s) => ({
        date: s.snapshot_date,
        readiness: Number(s.readiness_score),
        avg_technical: s.avg_technical === null ? null : Number(s.avg_technical),
        avg_communication: s.avg_communication === null ? null : Number(s.avg_communication),
        avg_completeness: s.avg_completeness === null ? null : Number(s.avg_completeness),
        avg_confidence: s.avg_confidence === null ? null : Number(s.avg_confidence),
      })),
      topic_averages: stats,
      ats_last: ats.data?.ats_score ?? null,
      interview_history: (sessions.data ?? []).map((s) => ({
        id: s.id,
        date: s.started_at,
        role: s.role,
        round_type: s.round_type,
        questions: ((s.question_ids as number[]) ?? []).length,
        score: s.overall_score === null ? null : Number(s.overall_score),
        status: s.status,
      })),
    };
  });

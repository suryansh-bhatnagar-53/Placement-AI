import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  buildRoadmapItems,
  computeOverallScore,
  pickQuestions,
  severityFor,
  TIMER_SECONDS,
  TOPIC_LABELS,
  topicAverages,
  type RoadmapItem,
} from "./interview.server";
import { judgeAnswer } from "./judging.server";

const StartSchema = z.object({
  role: z.enum(["SE", "ML", "DA"]),
  languages: z.array(z.enum(["C", "CPP", "PYTHON", "JAVA"])).min(1),
  round_type: z.enum(["coding", "writing"]),
});

const AnswerSchema = z.object({
  session_id: z.string().uuid(),
  position: z.number().int().min(0),
  answer: z.string(),
  time_taken_seconds: z.number().int().min(0).max(3600),
  timed_out: z.boolean(),
});

export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StartSchema.parse(input))
  .handler(async ({ data, context }) => {
    const questions = await pickQuestions(
      context.supabase,
      data.role,
      data.languages,
      data.round_type,
    );
    if (questions.length === 0) throw new Error("Question bank is empty.");

    const { data: session, error } = await context.supabase
      .from("sessions")
      .insert({
        user_id: context.userId,
        role: data.role,
        languages: data.languages,
        round_type: data.round_type,
        question_ids: questions.map((q) => q.id),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { session_id: session.id, question_count: questions.length };
  });

export const getSessionState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ session_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: session, error } = await context.supabase
      .from("sessions")
      .select("*")
      .eq("id", data.session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) throw new Error("Interview not found");

    const ids = (session.question_ids as number[]) ?? [];
    const { data: bank } = await context.supabase
      .from("questions")
      .select("id, text, type, difficulty, topic, language")
      .in("id", ids.length ? ids : [-1]);
    const byId = new Map((bank ?? []).map((q) => [q.id, q]));
    const questions = ids.map((id) => byId.get(id)).filter(Boolean);

    const { data: answers } = await context.supabase
      .from("answers")
      .select("position")
      .eq("session_id", session.id);

    return {
      session: {
        id: session.id,
        status: session.status,
        round_type: session.round_type,
        role: session.role,
      },
      questions,
      answered: (answers ?? []).map((a) => a.position),
      timer_seconds: TIMER_SECONDS,
    };
  });

export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnswerSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.answer.trim().length === 0 && !data.timed_out) {
      throw new Error("Answer cannot be empty");
    }

    const { data: session } = await context.supabase
      .from("sessions")
      .select("id, status, question_ids")
      .eq("id", data.session_id)
      .maybeSingle();
    if (!session) throw new Error("Interview not found");
    if (session.status !== "in_progress") throw new Error("This interview is already closed");

    const ids = (session.question_ids as number[]) ?? [];
    const questionId = ids[data.position];
    if (questionId === undefined) throw new Error("Question not found");

    const { data: question } = await context.supabase
      .from("questions")
      .select("id, text, sample_answer, topic, language")
      .eq("id", questionId)
      .single();
    if (!question) throw new Error("Question not found");

    const judgement = await judgeAnswer({
      question: question.text,
      sampleAnswer: question.sample_answer,
      answer: data.answer.trim() || "(no answer submitted)",
      timedOut: data.timed_out,
      language: question.language,
      topic: question.topic,
    });

    const { error } = await context.supabase.from("answers").upsert(
      {
        session_id: session.id,
        user_id: context.userId,
        question_id: question.id,
        position: data.position,
        user_text: data.answer,
        time_taken_seconds: data.time_taken_seconds,
        timed_out: data.timed_out,
        technical_score: judgement.technical_score,
        communication_score: judgement.communication_score,
        completeness_score: judgement.completeness_score,
        confidence_score: judgement.confidence_score,
        feedback: judgement.feedback,
        model_answer: question.sample_answer,
      },
      { onConflict: "session_id,position" },
    );
    if (error) throw new Error(error.message);

    return {
      is_last: data.position >= ids.length - 1,
      scores: {
        technical: judgement.technical_score,
        communication: judgement.communication_score,
        completeness: judgement.completeness_score,
        confidence: judgement.confidence_score,
      },
      feedback: judgement.feedback,
    };
  });

export const abortInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ session_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("sessions")
      .update({ status: "aborted", ended_at: new Date().toISOString() })
      .eq("id", data.session_id)
      .eq("status", "in_progress");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const finishInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ session_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { data: session } = await supabase
      .from("sessions")
      .select("id, role, status, overall_score")
      .eq("id", data.session_id)
      .maybeSingle();
    if (!session) throw new Error("Interview not found");

    const { data: answers } = await supabase
      .from("answers")
      .select("question_id, technical_score, communication_score, completeness_score, confidence_score")
      .eq("session_id", session.id);
    const rows = answers ?? [];
    const overall = computeOverallScore(rows);

    if (session.status === "completed") {
      return { session_id: session.id, overall_score: Number(session.overall_score ?? overall) };
    }

    await supabase
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString(), overall_score: overall })
      .eq("id", session.id);

    // Topic-level skill gaps
    const { data: bank } = await supabase
      .from("questions")
      .select("id, topic")
      .in("id", rows.length ? rows.map((r) => r.question_id) : [-1]);
    const topicById = new Map((bank ?? []).map((q) => [q.id, q.topic]));
    const stats = topicAverages(
      rows.map((r) => ({
        topic: topicById.get(r.question_id) ?? "basic",
        technical_score: r.technical_score,
      })),
    );

    const gaps = stats
      .map((s) => ({ ...s, severity: severityFor(s.avgTechnical) }))
      .filter((s): s is typeof s & { severity: "high" | "medium" | "low" } => s.severity !== null);

    if (gaps.length > 0) {
      await supabase.from("skill_gaps").insert(
        gaps.map((g) => ({
          user_id: context.userId,
          session_id: session.id,
          skill_name: `${TOPIC_LABELS[g.topic] ?? g.topic} fundamentals`,
          topic: g.topic,
          severity: g.severity,
          source: "interview",
        })),
      );
      const items = await buildRoadmapItems(supabase, gaps);
      await supabase.from("roadmaps").insert({
        user_id: context.userId,
        session_id: session.id,
        role: session.role,
        items,
      });
    }

    // Performance snapshot
    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("status", "completed");
    const { data: lastAts } = await supabase
      .from("ats_reports")
      .select("ats_score")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const scored = rows.filter((r) => r.technical_score !== null);
    const avg = (key: "technical_score" | "communication_score" | "completeness_score" | "confidence_score") =>
      scored.length
        ? Math.round((scored.reduce((s, r) => s + (r[key] ?? 0), 0) / scored.length) * 10) / 10
        : null;

    await supabase.from("performance_snapshots").insert({
      user_id: context.userId,
      readiness_score: overall,
      interviews_taken: count ?? 1,
      avg_technical: avg("technical_score"),
      avg_communication: avg("communication_score"),
      avg_completeness: avg("completeness_score"),
      avg_confidence: avg("confidence_score"),
      ats_last_score: lastAts?.ats_score ?? null,
      topics_covered: stats.map((s) => s.topic),
    });

    return { session_id: session.id, overall_score: overall };
  });

export const getReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ session_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", data.session_id)
      .maybeSingle();
    if (!session) throw new Error("Interview not found");

    const { data: answers } = await supabase
      .from("answers")
      .select("*")
      .eq("session_id", session.id)
      .order("position");
    const rows = answers ?? [];
    const { data: bank } = await supabase
      .from("questions")
      .select("id, text, topic, difficulty, type, language")
      .in("id", rows.length ? rows.map((r) => r.question_id) : [-1]);
    const byId = new Map((bank ?? []).map((q) => [q.id, q]));

    const { data: gaps } = await supabase
      .from("skill_gaps")
      .select("skill_name, topic, severity")
      .eq("session_id", session.id);
    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("items")
      .eq("session_id", session.id)
      .maybeSingle();

    return {
      session: {
        id: session.id,
        role: session.role,
        round_type: session.round_type,
        status: session.status,
        started_at: session.started_at,
        overall_score: session.overall_score === null ? 0 : Number(session.overall_score),
      },
      question_results: rows.map((r) => ({
        position: r.position,
        question: byId.get(r.question_id)?.text ?? "",
        topic: byId.get(r.question_id)?.topic ?? "",
        difficulty: byId.get(r.question_id)?.difficulty ?? "",
        user_text: r.user_text,
        timed_out: r.timed_out,
        time_taken_seconds: r.time_taken_seconds,
        technical: r.technical_score === null ? null : Number(r.technical_score),
        communication: r.communication_score === null ? null : Number(r.communication_score),
        completeness: r.completeness_score === null ? null : Number(r.completeness_score),
        confidence: r.confidence_score === null ? null : Number(r.confidence_score),
        feedback: r.feedback ?? "",
        model_answer: r.model_answer ?? "",
      })),
      gaps: gaps ?? [],
      roadmap_preview: ((roadmap?.items as RoadmapItem[] | null) ?? []).slice(0, 5),
    };
  });

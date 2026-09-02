import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { TOPIC_LABELS, topicAverages, type Sb } from "./interview.server";
import { ROADMAP_MAX_ITEMS, TOPIC_PLANS } from "./roadmap-config";

type Severity = "high" | "medium" | "low";
const SEVERITY_PRIORITY: Record<Severity, number> = { high: 1, medium: 2, low: 3 };

/** Ranks the learner's weakest topics from skill gaps first, then per-topic averages. */
async function rankWeakTopics(supabase: Sb): Promise<Array<{ topic: string; priority: number }>> {
  const [gaps, answers, bank] = await Promise.all([
    supabase
      .from("skill_gaps")
      .select("topic, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("answers").select("question_id, technical_score"),
    supabase.from("questions").select("id, topic"),
  ]);

  const topicById = new Map((bank.data ?? []).map((q) => [q.id, q.topic]));
  const stats = topicAverages(
    (answers.data ?? []).map((a) => ({
      topic: topicById.get(a.question_id) ?? "basic",
      technical_score: a.technical_score,
    })),
  );
  const avgByTopic = new Map(stats.map((s) => [s.topic, s.avgTechnical]));

  const ranked = new Map<string, number>();
  for (const gap of gaps.data ?? []) {
    if (ranked.has(gap.topic)) continue;
    ranked.set(gap.topic, SEVERITY_PRIORITY[(gap.severity as Severity) ?? "low"] ?? 3);
  }

  // Fill remaining slots with the weakest measured topics that are not already gaps.
  for (const stat of [...stats].sort((a, b) => a.avgTechnical - b.avgTechnical)) {
    if (ranked.size >= ROADMAP_MAX_ITEMS) break;
    if (ranked.has(stat.topic)) continue;
    ranked.set(stat.topic, stat.avgTechnical < 6 ? 4 : 5);
  }

  return [...ranked.entries()]
    .filter(([topic]) => TOPIC_PLANS[topic])
    .sort(
      (a, b) =>
        a[1] - b[1] || (avgByTopic.get(a[0]) ?? 10) - (avgByTopic.get(b[0]) ?? 10),
    )
    .slice(0, ROADMAP_MAX_ITEMS)
    .map(([topic, priority]) => ({ topic, priority }));
}

async function generateItems(supabase: Sb, userId: string, role: string) {
  const ranked = await rankWeakTopics(supabase);
  if (ranked.length === 0) return [];

  const rows = [];
  for (const { topic, priority } of ranked) {
    const plan = TOPIC_PLANS[topic];
    if (!plan) continue;
    const { data: questions } = await supabase
      .from("questions")
      .select("id")
      .eq("topic", topic)
      .order("id", { ascending: true })
      .limit(3);
    rows.push({
      user_id: userId,
      role,
      topic,
      title: plan.title,
      action: plan.action,
      priority,
      resources: plan.resources,
      practice_question_ids: (questions ?? []).map((q) => q.id),
      status: "pending",
    });
  }

  if (rows.length === 0) return [];
  const { data, error } = await supabase.from("roadmap_items").insert(rows).select();
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function hydrate(supabase: Sb, items: Array<Record<string, unknown>>) {
  const ids = [
    ...new Set(items.flatMap((i) => (i["practice_question_ids"] as number[] | null) ?? [])),
  ];
  const { data: questions } = ids.length
    ? await supabase.from("questions").select("id, text, topic").in("id", ids)
    : { data: [] as Array<{ id: number; text: string; topic: string }> };
  const byId = new Map((questions ?? []).map((q) => [q.id, q]));

  return items.map((item) => ({
    id: item["id"] as string,
    topic: item["topic"] as string,
    topic_label: TOPIC_LABELS[item["topic"] as string] ?? (item["topic"] as string),
    title: item["title"] as string,
    action: item["action"] as string,
    priority: item["priority"] as number,
    status: item["status"] as string,
    created_at: item["created_at"] as string,
    resources: (item["resources"] as Array<{ label: string; url: string }>) ?? [],
    practice_questions: (((item["practice_question_ids"] as number[] | null) ?? [])
      .map((id) => byId.get(id))
      .filter(Boolean) as Array<{ id: number; text: string }>).map((q) => ({
      id: q.id,
      text: q.text,
    })),
  }));
}

export const getRoadmap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const [{ data: existing, error }, profile, lastSession] = await Promise.all([
      supabase
        .from("roadmap_items")
        .select("*")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("target_role").eq("id", context.userId).maybeSingle(),
      supabase
        .from("sessions")
        .select("id, ended_at")
        .eq("status", "completed")
        .order("ended_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (error) throw new Error(error.message);

    let rows = existing ?? [];
    if (rows.length === 0) {
      rows = await generateItems(supabase, context.userId, profile.data?.target_role ?? "SE");
    }

    const generatedAt = rows[0]?.created_at ?? null;
    const staleResults = Boolean(
      generatedAt &&
        lastSession.data?.ended_at &&
        new Date(lastSession.data.ended_at) > new Date(generatedAt),
    );

    return {
      items: await hydrate(supabase, rows as Array<Record<string, unknown>>),
      stale_results: staleResults,
      has_completed_interview: Boolean(lastSession.data),
    };
  });

export const toggleRoadmapItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ item_id: z.string().uuid(), status: z.enum(["pending", "done"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("roadmap_items")
      .update({ status: data.status })
      .eq("id", data.item_id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const regenerateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const { error } = await supabase
      .from("roadmap_items")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_role")
      .eq("id", context.userId)
      .maybeSingle();
    const rows = await generateItems(supabase, context.userId, profile?.target_role ?? "SE");
    return { items: await hydrate(supabase, rows as Array<Record<string, unknown>>) };
  });

// Interview engine: question selection, score aggregation, gaps + roadmap.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SCORE_WEIGHTS } from "./judging.server";

export type Sb = SupabaseClient<Database>;
export type Role = "SE" | "ML" | "DA" | "PM" | "BA" | "CE";
export type RoundType = "coding" | "writing" | "case_study" | "behavioral" | "domain_quiz";

export const TIMER_SECONDS = 120;
/** Per-round timer in seconds; coding and writing keep the original 120 s. */
export const ROUND_TIMERS: Record<RoundType, number> = {
  coding: 120,
  writing: 120,
  case_study: 180,
  behavioral: 120,
  domain_quiz: 30,
};
export const ROUND_COUNTS: Record<RoundType, number> = {
  coding: 5,
  writing: 6,
  case_study: 3,
  behavioral: 5,
  domain_quiz: 10,
};
export const CODING_QUESTION_COUNT = 5;
export const WRITING_QUESTION_COUNT = 6;

export type BankQuestion = Database["public"]["Tables"]["questions"]["Row"];

/** Role bias: ML weights DSA + OS, DA weights DBMS heavily, SE stays balanced. */
const TOPIC_WEIGHTS: Record<Role, Record<string, number>> = {
  SE: { dsa: 3, os: 2, dbms: 1 },
  ML: { dsa: 3, os: 2, dbms: 1 },
  DA: { dbms: 4, dsa: 1, os: 1 },
  CE: { os: 3, dsa: 2, dbms: 1 },
  PM: { dbms: 2, dsa: 1, os: 1 },
  BA: { dbms: 3, dsa: 1, os: 1 },
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = a;
  }
  return copy;
}

export async function pickQuestions(
  supabase: Sb,
  role: Role,
  languages: string[],
  roundType: RoundType,
): Promise<BankQuestion[]> {
  if (roundType === "case_study" || roundType === "behavioral" || roundType === "domain_quiz") {
    const wantedNew = ROUND_COUNTS[roundType];
    const dbType = roundType === "domain_quiz" ? "mcq" : roundType;
    let query = supabase.from("questions").select("*").eq("type", dbType);
    query = roundType === "behavioral" ? query.eq("role", "all") : query.eq("role", role);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return shuffle((data ?? []) as BankQuestion[]).slice(0, wantedNew);
  }
  const wanted = roundType === "coding" ? CODING_QUESTION_COUNT : WRITING_QUESTION_COUNT;
  const type = roundType === "coding" ? "coding" : "theory";

  const { data: all, error } = await supabase.from("questions").select("*").eq("type", type);
  if (error) throw new Error(error.message);
  const pool = (all ?? []) as BankQuestion[];

  let picked: BankQuestion[] = [];

  if (roundType === "coding") {
    const langs = languages.length > 0 ? languages : ["PYTHON"];
    // ML leans on Python when it is among the selected languages.
    const ordered = role === "ML" && langs.includes("PYTHON") ? ["PYTHON", ...langs] : langs;
    const byLang = new Map<string, BankQuestion[]>();
    for (const lang of ordered) {
      if (!byLang.has(lang)) {
        byLang.set(
          lang,
          shuffle(pool.filter((q) => q.topic === "basic" && q.language === lang)),
        );
      }
    }
    // Round-robin across the selected languages so every choice is represented.
    let guard = 0;
    while (picked.length < wanted && guard < wanted * 10) {
      guard++;
      for (const lang of byLang.keys()) {
        const next = byLang.get(lang)!.shift();
        if (next && !picked.some((q) => q.id === next.id)) picked.push(next);
        if (picked.length >= wanted) break;
      }
      if ([...byLang.values()].every((list) => list.length === 0)) break;
    }
  } else {
    const weights = TOPIC_WEIGHTS[role];
    const buckets: Record<string, BankQuestion[]> = {
      dsa: shuffle(pool.filter((q) => q.topic === "dsa")),
      dbms: shuffle(pool.filter((q) => q.topic === "dbms")),
      os: shuffle(pool.filter((q) => q.topic === "os")),
    };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const [topic, weight] of Object.entries(weights)) {
      const take = Math.max(1, Math.round((weight / totalWeight) * wanted));
      picked.push(...buckets[topic]!.splice(0, take));
    }
    picked = shuffle(picked).slice(0, wanted);
    // top up from anything left if rounding under-filled the set
    const leftovers = shuffle(Object.values(buckets).flat());
    for (const q of leftovers) {
      if (picked.length >= wanted) break;
      if (!picked.some((p) => p.id === q.id)) picked.push(q);
    }
  }

  // FALLBACK: never return an empty or short session.
  if (picked.length < wanted) {
    for (const q of shuffle(pool)) {
      if (picked.length >= wanted) break;
      if (!picked.some((p) => p.id === q.id)) picked.push(q);
    }
  }

  return picked.slice(0, wanted);
}

export type ScoredAnswer = {
  technical_score: number | null;
  communication_score: number | null;
  completeness_score: number | null;
  confidence_score: number | null;
};

/** Overall session score, computed locally (never by the LLM). 0-100, 1 decimal. */
export function computeOverallScore(answers: ScoredAnswer[]): number {
  const scored = answers.filter((a) => a.technical_score !== null);
  if (scored.length === 0) return 0;
  const avg = (key: keyof ScoredAnswer) =>
    scored.reduce((sum, a) => sum + (a[key] ?? 0), 0) / scored.length;
  const value =
    (avg("technical_score") * SCORE_WEIGHTS.technical +
      avg("communication_score") * SCORE_WEIGHTS.communication +
      avg("completeness_score") * SCORE_WEIGHTS.completeness +
      avg("confidence_score") * SCORE_WEIGHTS.confidence) *
    10;
  return Math.round(value * 10) / 10;
}

export function gradeFor(score: number): "A" | "B" | "C" | "D" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export const TOPIC_LABELS: Record<string, string> = {
  basic: "Basic Coding",
  dsa: "Data Structures & Algorithms",
  dbms: "Database Management",
  os: "Operating Systems",
  ml: "ML Concepts",
  statistics: "Statistics",
  sql: "SQL",
  product: "Product Strategy",
  ux: "UX / User Research",
  agile: "Agile Methodologies",
  metrics: "Product Metrics",
  process: "Business Process Modeling",
  data_interp: "Data Interpretation",
  excel: "Excel / Analytics",
  requirements: "Requirements Gathering",
  cloud: "Cloud Architecture",
  networking: "Networking",
  devops: "DevOps",
  security: "Security Basics",
  behavioral: "Behavioral / HR",
};

const TOPIC_RESOURCES: Record<string, string[]> = {
  basic: [
    "GeeksforGeeks — Language fundamentals practice: https://www.geeksforgeeks.org/",
    "LeetCode Easy set: https://leetcode.com/problemset/",
  ],
  dsa: [
    "NeetCode roadmap: https://neetcode.io/roadmap",
    "GeeksforGeeks DSA self-paced topics: https://www.geeksforgeeks.org/data-structures/",
  ],
  dbms: [
    "PostgreSQL official tutorial: https://www.postgresql.org/docs/current/tutorial.html",
    "GeeksforGeeks DBMS: https://www.geeksforgeeks.org/dbms/",
  ],
  os: [
    "Operating System Concepts (Silberschatz) chapters 3-9",
    "GeeksforGeeks Operating Systems: https://www.geeksforgeeks.org/operating-systems/",
  ],
};

export type TopicStat = { topic: string; avgTechnical: number; count: number };

export function topicAverages(
  rows: Array<{ topic: string; technical_score: number | null }>,
): TopicStat[] {
  const map = new Map<string, { sum: number; count: number }>();
  for (const row of rows) {
    if (row.technical_score === null) continue;
    const entry = map.get(row.topic) ?? { sum: 0, count: 0 };
    entry.sum += row.technical_score;
    entry.count += 1;
    map.set(row.topic, entry);
  }
  return [...map.entries()].map(([topic, v]) => ({
    topic,
    avgTechnical: Math.round((v.sum / v.count) * 10) / 10,
    count: v.count,
  }));
}

export function severityFor(avgTechnical: number): "high" | "medium" | "low" | null {
  if (avgTechnical < 3) return "high";
  if (avgTechnical < 4) return "medium";
  if (avgTechnical < 5) return "low";
  return null;
}

export type RoadmapItem = {
  topic: string;
  label: string;
  priority: "high" | "medium" | "low";
  resources: string[];
  practice_questions: Array<{ id: number; text: string }>;
};

export async function buildRoadmapItems(
  supabase: Sb,
  gaps: Array<{ topic: string; severity: "high" | "medium" | "low" }>,
): Promise<RoadmapItem[]> {
  const order = { high: 0, medium: 1, low: 2 } as const;
  const sorted = [...gaps].sort((a, b) => order[a.severity] - order[b.severity]);
  const items: RoadmapItem[] = [];
  for (const gap of sorted) {
    const { data } = await supabase
      .from("questions")
      .select("id, text")
      .eq("topic", gap.topic)
      .limit(3);
    items.push({
      topic: gap.topic,
      label: TOPIC_LABELS[gap.topic] ?? gap.topic,
      priority: gap.severity,
      resources: TOPIC_RESOURCES[gap.topic] ?? [],
      practice_questions: (data ?? []).map((q) => ({ id: q.id, text: q.text })),
    });
  }
  return items;
}

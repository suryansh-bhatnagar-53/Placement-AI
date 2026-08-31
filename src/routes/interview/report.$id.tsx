import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ScoreRing } from "@/components/ScoreRing";
import { getReport } from "@/lib/interview.functions";

export const Route = createFileRoute("/interview/report/$id")({
  head: () => ({
    meta: [
      { title: "Interview report — PlacementAI" },
      {
        name: "description",
        content: "Per-question scores, feedback, model answers, skill gaps and your next steps.",
      },
      { property: "og:title", content: "Interview report — PlacementAI" },
      {
        property: "og:description",
        content: "Per-question scores, feedback, model answers, skill gaps and your next steps.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ReportPage />
    </AppShell>
  ),
});

const TOPIC_LABELS: Record<string, string> = {
  basic: "Basic Coding",
  dsa: "Data Structures & Algorithms",
  dbms: "Database Management",
  os: "Operating Systems",
};

type RoadmapItem = {
  topic: string;
  label: string;
  priority: string;
  resources: string[];
  practice_questions: Array<{ id: number; text: string }>;
};

function ReportPage() {
  const { id } = Route.useParams();
  const load = useServerFn(getReport);
  const { data, isLoading, error } = useQuery({
    queryKey: ["report", id],
    queryFn: () => load({ data: { session_id: id } }),
    retry: false,
  });

  if (isLoading) return <p className="text-muted-foreground">Loading report…</p>;
  if (error || !data) return <p className="text-destructive">This report could not be loaded.</p>;

  const roadmap = (data.roadmap_preview ?? []) as RoadmapItem[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-border bg-card p-6">
        <div>
          <h1 className="text-2xl font-semibold">Interview report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.session.round_type === "coding" ? "Coding round" : "Writing round"} ·{" "}
            {data.session.role} · {new Date(data.session.started_at).toLocaleString()}
          </p>
          <Link
            to="/interview/setup"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Take another interview
          </Link>
        </div>
        <ScoreRing score={data.session.overall_score} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Question by question</h2>
      <div className="mt-4 space-y-4">
        {data.question_results.map((result) => (
          <QuestionCard key={result.position} result={result} />
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold">Skill gaps</h2>
          {data.gaps.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No gaps flagged from this session — your technical scores were solid across topics.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.gaps.map((gap, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
                >
                  <span>{gap.skill_name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs uppercase ${
                      gap.severity === "high"
                        ? "bg-destructive/20 text-destructive"
                        : gap.severity === "medium"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {gap.severity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold">Roadmap preview</h2>
          {roadmap.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing to add to your roadmap from this session.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {roadmap.map((item) => (
                <li key={item.topic} className="rounded-lg border border-border bg-card p-4">
                  <p className="font-medium">
                    {item.label ?? TOPIC_LABELS[item.topic] ?? item.topic}{" "}
                    <span className="text-xs uppercase text-muted-foreground">
                      · {item.priority} priority
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {item.practice_questions.map((q) => (
                      <li key={q.id}>• {q.text}</li>
                    ))}
                  </ul>
                  <ul className="mt-2 space-y-1 text-xs text-accent">
                    {item.resources.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function QuestionCard({
  result,
}: {
  result: {
    position: number;
    question: string;
    topic: string;
    difficulty: string;
    user_text: string;
    timed_out: boolean;
    technical: number | null;
    communication: number | null;
    completeness: number | null;
    confidence: number | null;
    feedback: string;
    model_answer: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const scores = [
    { label: "Technical", value: result.technical },
    { label: "Communication", value: result.communication },
    { label: "Completeness", value: result.completeness },
    { label: "Confidence", value: result.confidence },
  ];

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-secondary px-2.5 py-1 uppercase tracking-wide">
          {TOPIC_LABELS[result.topic] ?? result.topic}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 uppercase tracking-wide">
          {result.difficulty}
        </span>
        {result.timed_out ? <span className="text-destructive">Timed out</span> : null}
      </div>
      <h3 className="mt-3 text-base font-medium">
        {result.position + 1}. {result.question}
      </h3>

      <p className="mt-3 whitespace-pre-wrap rounded-md bg-background p-3 font-mono text-xs text-muted-foreground">
        {result.user_text.trim().length > 0
          ? result.user_text.slice(0, 600)
          : "(no answer submitted)"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {scores.map((score) => (
          <div key={score.label} className="rounded-md border border-border px-3 py-2 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {score.label}
            </p>
            <p className="text-lg font-semibold">{score.value === null ? "—" : score.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed">{result.feedback}</p>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-sm text-primary hover:underline"
      >
        {open ? "Hide sample answer" : "Show sample answer"}
      </button>
      {open ? (
        <p className="mt-2 whitespace-pre-wrap rounded-md bg-background p-3 text-sm text-muted-foreground">
          {result.model_answer}
        </p>
      ) : null}
    </article>
  );
}

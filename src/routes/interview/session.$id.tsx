import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  abortInterview,
  finishInterview,
  getSessionState,
  submitAnswer,
} from "@/lib/interview.functions";

export const Route = createFileRoute("/interview/session/$id")({
  head: () => ({
    meta: [
      { title: "Mock interview in progress — PlacementAI" },
      { name: "description", content: "Answer each timed interview question and get AI scoring." },
      { property: "og:title", content: "Mock interview in progress — PlacementAI" },
      {
        property: "og:description",
        content: "Answer each timed interview question and get AI scoring.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <SessionPage />
    </AppShell>
  ),
});

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function SessionPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const loadState = useServerFn(getSessionState);
  const send = useServerFn(submitAnswer);
  const finish = useServerFn(finishInterview);
  const abort = useServerFn(abortInterview);

  const { data, isLoading, error } = useQuery({
    queryKey: ["session", id],
    queryFn: () => loadState({ data: { session_id: id } }),
    retry: false,
  });

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(120);
  const [busy, setBusy] = useState(false);
  const startedAt = useRef(Date.now());
  const submittingRef = useRef(false);

  const questions = data?.questions ?? [];
  const current = questions[index];
  const total = questions.length;

  useEffect(() => {
    if (!data) return;
    const answered = data.answered ?? [];
    const next = answered.length > 0 ? Math.max(...answered) + 1 : 0;
    setIndex(Math.min(next, Math.max(0, (data.questions?.length ?? 1) - 1)));
  }, [data]);

  useEffect(() => {
    setAnswer("");
    setRemaining(data?.timer_seconds ?? 120);
    startedAt.current = Date.now();
  }, [index, data?.timer_seconds]);

  const handleSubmit = useCallback(
    async (timedOut: boolean, text: string) => {
      if (submittingRef.current) return;
      if (!timedOut && text.trim().length === 0) {
        toast.error("Answer cannot be empty");
        return;
      }
      submittingRef.current = true;
      setBusy(true);
      try {
        const timeTaken = Math.min(
          3600,
          Math.round((Date.now() - startedAt.current) / 1000),
        );
        const result = await send({
          data: {
            session_id: id,
            position: index,
            answer: text,
            time_taken_seconds: timeTaken,
            timed_out: timedOut,
          },
        });
        if (result.is_last) {
          await finish({ data: { session_id: id } });
          navigate({ to: "/interview/report/$id", params: { id } });
          return;
        }
        toast.success("Answer recorded");
        setIndex((i) => i + 1);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not submit the answer");
      } finally {
        submittingRef.current = false;
        setBusy(false);
      }
    },
    [finish, id, index, navigate, send],
  );

  useEffect(() => {
    if (!current || busy) return;
    if (remaining <= 0) {
      void handleSubmit(true, answer);
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, current, busy, answer, handleSubmit]);

  if (isLoading) return <p className="text-muted-foreground">Loading interview…</p>;
  if (error || !data) return <p className="text-destructive">This interview could not be loaded.</p>;
  if (data.session.status !== "in_progress") {
    return (
      <div>
        <p className="text-muted-foreground">This interview is already closed.</p>
        <button
          onClick={() => navigate({ to: "/interview/report/$id", params: { id } })}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          View report
        </button>
      </div>
    );
  }
  if (!current) return <p className="text-muted-foreground">No questions in this session.</p>;

  const isCoding = current.type === "coding";
  const lowTime = remaining <= 20;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Question {index + 1}/{total}
        </span>
        <span
          className={`font-mono text-2xl tabular-nums ${lowTime ? "text-destructive" : "text-primary"}`}
          aria-live="polite"
        >
          {formatClock(Math.max(0, remaining))}
        </span>
        <button
          onClick={async () => {
            if (!window.confirm("End this interview? It will not be scored.")) return;
            await abort({ data: { session_id: id } });
            navigate({ to: "/dashboard" });
          }}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive"
        >
          End Interview
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 uppercase tracking-wide text-muted-foreground">
              {current.type}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 uppercase tracking-wide text-muted-foreground">
              {current.difficulty}
            </span>
            {current.language !== "none" ? (
              <span className="rounded-full bg-secondary px-2.5 py-1 uppercase tracking-wide text-accent">
                {current.language}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-base leading-relaxed">{current.text}</p>
        </section>

        <section>
          <label className="mb-1.5 block text-sm text-muted-foreground" htmlFor="answer">
            Your answer
          </label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={14}
            className={`input resize-y ${isCoding ? "mono" : ""}`}
            placeholder={
              isCoding
                ? "Explain your approach, complexity, then the code."
                : "Explain your answer clearly and completely."
            }
          />
          <button
            onClick={() => handleSubmit(false, answer)}
            disabled={busy}
            className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Scoring your answer…" : index + 1 === total ? "Submit & finish" : "Submit answer"}
          </button>
        </section>
      </div>
    </div>
  );
}

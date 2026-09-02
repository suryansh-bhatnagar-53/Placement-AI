import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { getRoadmap, regenerateRoadmap, toggleRoadmapItem } from "@/lib/roadmap.functions";
import { ChevronDown, ExternalLink, Map as MapIcon, RefreshCw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "My Roadmap — PlacementAI" },
      {
        name: "description",
        content: "A prioritised study plan built from your weakest interview topics.",
      },
      { property: "og:title", content: "My Roadmap — PlacementAI" },
      {
        property: "og:description",
        content: "A prioritised study plan built from your weakest interview topics.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <RoadmapPage />
    </AppShell>
  ),
});

function RoadmapPage() {
  const load = useServerFn(getRoadmap);
  const toggle = useServerFn(toggleRoadmapItem);
  const regenerate = useServerFn(regenerateRoadmap);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["roadmap"], queryFn: () => load() });

  const toggleMutation = useMutation({
    mutationFn: (vars: { item_id: string; status: "pending" | "done" }) => toggle({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roadmap"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const regenMutation = useMutation({
    mutationFn: () => regenerate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
      toast.success("Roadmap rebuilt from your latest results.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const items = data?.items ?? [];
  const done = items.filter((i) => i.status === "done").length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <MapIcon className="h-6 w-6 text-primary" /> My Roadmap
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your weakest topics, ranked, with concrete actions and real practice questions.
          </p>
        </div>
        {items.length > 0 ? (
          <button
            onClick={() => regenMutation.mutate()}
            disabled={regenMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-primary disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${regenMutation.isPending ? "animate-spin" : ""}`} />
            Regenerate from my results
          </button>
        ) : null}
      </div>

      {data?.stale_results ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-secondary p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm">
            New results available — you finished an interview after this roadmap was built.
          </p>
          <button
            onClick={() => regenMutation.mutate()}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Update roadmap
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Building your roadmap…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">No roadmap yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Take your first interview to generate your roadmap.
          </p>
          <Link
            to="/interview/setup"
            className="mt-5 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Take your first interview
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {done} / {items.length} completed
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <ol className="mt-6 space-y-3">
            {items.map((item) => {
              const expanded = open === item.id;
              return (
                <li key={item.id} className="rounded-lg border border-border bg-card">
                  <div className="flex items-start gap-3 p-4">
                    <input
                      type="checkbox"
                      aria-label={`Mark ${item.title} as done`}
                      checked={item.status === "done"}
                      onChange={(e) =>
                        toggleMutation.mutate({
                          item_id: item.id,
                          status: e.target.checked ? "done" : "pending",
                        })
                      }
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                          {item.topic_label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Priority {item.priority}
                        </span>
                      </div>
                      <h3
                        className={`mt-2 font-medium ${item.status === "done" ? "text-muted-foreground line-through" : ""}`}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.action}</p>
                      <button
                        onClick={() => setOpen(expanded ? null : item.id)}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-primary"
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                        {expanded ? "Hide" : "Show"} resources & practice
                      </button>
                      {expanded ? (
                        <div className="mt-3 space-y-3 border-t border-border pt-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Resources
                            </p>
                            <ul className="mt-1 space-y-1">
                              {item.resources.map((r) => (
                                <li key={r.url}>
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    {r.label} <ExternalLink className="h-3 w-3" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Practice questions
                            </p>
                            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {item.practice_questions.map((q) => (
                                <li key={q.id}>{q.text}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}

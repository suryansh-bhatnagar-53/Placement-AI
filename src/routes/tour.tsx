import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TOUR_MODULES, type TourModule } from "@/lib/tour-content";
import { setTourState } from "@/lib/tour.functions";
import {
  ChevronLeft,
  ChevronRight,
  Timer,
  Gauge,
  MessageSquare,
  LineChart,
  ListChecks,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/tour")({
  head: () => ({
    meta: [
      { title: "Quick tour — PlacementAI" },
      {
        name: "description",
        content: "A 30-second, plain-language walkthrough of the six PlacementAI sections.",
      },
      { property: "og:title", content: "Quick tour — PlacementAI" },
      {
        property: "og:description",
        content: "A 30-second, plain-language walkthrough of the six PlacementAI sections.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Tour />
    </AppShell>
  ),
});

function Preview({ kind }: { kind: TourModule["preview"] }) {
  const common = "h-10 w-10 text-accent";
  return (
    <div className="flex h-36 items-center justify-center rounded-lg border border-border bg-secondary">
      {kind === "timer" ? (
        <div className="flex flex-col items-center gap-2">
          <Timer className={common} />
          <span className="rounded bg-background px-2 py-0.5 font-mono text-sm">02:00</span>
        </div>
      ) : kind === "ring" ? (
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
          <Gauge className="h-8 w-8 text-accent" />
        </div>
      ) : kind === "chat" ? (
        <div className="w-48 space-y-2">
          <div className="ml-auto h-4 w-28 rounded-full bg-primary/40" />
          <div className="h-4 w-40 rounded-full bg-background" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <div className="h-4 w-24 rounded-full bg-background" />
          </div>
        </div>
      ) : kind === "chart" ? (
        <LineChart className="h-14 w-14 text-accent" />
      ) : kind === "checklist" ? (
        <div className="w-48 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-accent" />
              <div className="h-3 flex-1 rounded-full bg-background" />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-48 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            <div className="h-3 w-24 rounded-full bg-background" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-3 w-full rounded-full bg-background" />
          ))}
        </div>
      )}
    </div>
  );
}

function Tour() {
  const navigate = useNavigate();
  const save = useServerFn(setTourState);
  const [index, setIndex] = useState(0);
  const module = TOUR_MODULES[index]!;
  const isLast = index === TOUR_MODULES.length - 1;

  const leave = async (completed: boolean) => {
    await save({ data: completed ? { tour_completed: true } : { tour_prompted: true } });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {index + 1} of {TOUR_MODULES.length}
        </p>
        <button
          type="button"
          onClick={() => void leave(false)}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip tour
        </button>
      </div>

      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {TOUR_MODULES.map((m, i) => (
          <span
            key={m.id}
            className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-secondary"}`}
          />
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">{module.title}</h1>
        <div className="mt-4">
          <Preview kind={module.preview} />
        </div>
        <p className="mt-5 text-sm">{module.use}</p>
        <h2 className="mt-5 text-sm font-medium text-muted-foreground">You can:</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {module.canDo.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-accent">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2 rounded-md bg-secondary p-3 text-sm">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            <span className="font-medium">{module.faq.q}</span>{" "}
            <span className="text-muted-foreground">{module.faq.a}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Previous section"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={() => void leave(true)}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Finish — take me to the dashboard
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void leave(true)}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Finish
            </button>
            <button
              type="button"
              aria-label="Next section"
              onClick={() => setIndex((i) => Math.min(TOUR_MODULES.length - 1, i + 1))}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

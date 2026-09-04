import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { getDashboardSummary } from "@/lib/dashboard.functions";
import { Mic, FileText, Bot, BarChart3, AlertTriangle, Map, BookOpen, Compass } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PlacementAI" },
      {
        name: "description",
        content: "Your placement readiness hub: interviews, resume score and AI guidance.",
      },
      { property: "og:title", content: "Dashboard — PlacementAI" },
      {
        property: "og:description",
        content: "Your placement readiness hub: interviews, resume score and AI guidance.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

const CARDS = [
  { to: "/interview/setup", icon: Mic, title: "Take an Interview", body: "Timed coding or theory round, scored by AI." },
  { to: "/resume", icon: FileText, title: "Get Resume Check", body: "Upload a PDF and get an ATS score with fixes." },
  { to: "/guide", icon: Bot, title: "Talk with AI Guide", body: "Ask anything about prep, resumes or careers." },
  { to: "/performance", icon: BarChart3, title: "Performance Dashboard", body: "Track readiness, sub-scores and history." },
  { to: "/roadmap", icon: Map, title: "My Roadmap", body: "A ranked plan built from your weakest topics." },
  { to: "/cheatsheet", icon: BookOpen, title: "General Cheat Sheet", body: "Core topics, real problems and a 4-week plan." },
] as const;


function Dashboard() {
  const load = useServerFn(getDashboardSummary);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-summary"], queryFn: () => load() });

  const needsOnboarding = !isLoading && data && !data.profile?.target_role;

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome back{data?.profile?.name ? `, ${data.profile.name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick where you want to work today. Everything here feeds one readiness score.
      </p>

      {needsOnboarding ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-secondary p-4">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm">
            Finish onboarding to personalise your questions and resume scoring.
          </p>
          <Link
            to="/onboarding"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Complete setup
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Readiness score"
          value={data?.readiness != null ? data.readiness.toFixed(1) : "—"}
          hint="From your latest snapshot"
        />
        <StatCard
          label="Interviews taken"
          value={data?.interviews_taken ?? "—"}
          hint="Completed sessions"
        />
        <StatCard
          label="Last ATS score"
          value={data?.ats_last ?? "—"}
          hint="Most recent resume check"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <card.icon className="h-6 w-6 text-accent" />
            <h2 className="mt-4 text-lg font-semibold group-hover:text-primary">{card.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

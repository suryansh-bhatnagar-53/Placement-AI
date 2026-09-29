import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { TourLauncher } from "@/components/TourLauncher";
import { useI18n } from "@/i18n/I18nProvider";
import { getDashboardSummary } from "@/lib/dashboard.functions";
import { Mic, FileText, Bot, BarChart3, AlertTriangle, Map, BookOpen, Compass, Network } from "lucide-react";

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
  { to: "/interview/setup", icon: Mic, title: "dash.card.interview.title", body: "dash.card.interview.body" },
  { to: "/resume", icon: FileText, title: "dash.card.resume.title", body: "dash.card.resume.body" },
  { to: "/guide", icon: Bot, title: "dash.card.guide.title", body: "dash.card.guide.body" },
  { to: "/performance", icon: BarChart3, title: "dash.card.performance.title", body: "dash.card.performance.body" },
  { to: "/roadmap", icon: Map, title: "dash.card.roadmap.title", body: "dash.card.roadmap.body" },
  { to: "/cheatsheet", icon: BookOpen, title: "dash.card.cheatsheet.title", body: "dash.card.cheatsheet.body" },
  { to: "/how-it-works", icon: Compass, title: "dash.card.lla.title", body: "dash.card.lla.body" },
  { to: "/architecture", icon: Network, title: "dash.card.hla.title", body: "dash.card.hla.body" },
] as const;



function Dashboard() {
  const { t } = useI18n();
  const load = useServerFn(getDashboardSummary);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-summary"], queryFn: () => load() });

  const needsOnboarding = !isLoading && data && !data.profile?.target_role;

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {data?.profile?.name ? t("dash.welcomeName", { name: data.profile.name }) : t("dash.welcome")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("dash.subtitle")}
      </p>

      {needsOnboarding ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-secondary p-4">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm">
            {t("dash.onboardingPrompt")}
          </p>
          <Link
            to="/onboarding"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
          >
            {t("dash.completeSetup")}
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("dash.readiness")}
          value={data?.readiness != null ? data.readiness.toFixed(1) : "—"}
          hint={t("dash.readinessHint")}
        />
        <StatCard
          label={t("dash.interviews")}
          value={data?.interviews_taken ?? "—"}
          hint={t("dash.interviewsHint")}
        />
        <StatCard
          label={t("dash.ats")}
          value={data?.ats_last ?? "—"}
          hint={t("dash.atsHint")}
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
            <h2 className="mt-4 text-lg font-semibold group-hover:text-primary">{t(card.title)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(card.body)}</p>
          </Link>
        ))}
      </div>

      <TourLauncher />
    </div>
  );
}

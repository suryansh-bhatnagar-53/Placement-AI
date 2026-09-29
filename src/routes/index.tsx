import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";
import { GraduationCap, Mic, FileText, Compass } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlacementAI — Your AI Placement Mentor" },
      {
        name: "description",
        content:
          "Rehearse AI mock interviews, score your resume against ATS filters and get a personalised study roadmap before your campus drive.",
      },
      { property: "og:title", content: "PlacementAI — Your AI Placement Mentor" },
      {
        property: "og:description",
        content: "AI mock interviews, ATS resume checks and a personalised placement roadmap.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Mic,
    title: "land.f1.title",
    body: "land.f1.body", _b: "Timed mock rounds in C, C++, Python and Java plus DSA, DBMS and OS theory — scored on technical accuracy, communication, completeness and confidence.",
  },
  {
    icon: FileText,
    title: "land.f2.title",
    body: "land.f2.body", _b: "Upload your PDF resume and get a 0–100 ATS score with a factor-by-factor breakdown and prioritised fixes.",
  },
  {
    icon: Compass,
    title: "land.f3.title",
    body: "land.f3.body", _b: "Your weak topics become a ranked roadmap with practice questions, and the AI Guide answers prep questions in context.",
  },
];

function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5 text-primary" />
          PlacementAI
        </span>
        <Link
          to="/auth"
          search={{ mode: "login" }}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("land.signIn")}
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-16 pb-14 text-center sm:pt-24">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">{t("land.eyebrow")}</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{t("land.title")}</h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          {t("land.lead")}
        </p>
        <Link
          to="/auth"
          search={{ mode: "register" }}
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("land.cta")}
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <article key={t(feature.title)} className="rounded-lg border border-border bg-card p-6">
            <feature.icon className="h-6 w-6 text-accent" />
            <h2 className="mt-4 text-lg font-semibold">{t(feature.title)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(feature.body)}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        {t("land.footer")}
      </footer>
    </div>
  );
}

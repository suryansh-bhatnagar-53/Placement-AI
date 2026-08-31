import { createFileRoute, Link } from "@tanstack/react-router";
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
    title: "Practice Interviews",
    body: "Timed mock rounds in C, C++, Python and Java plus DSA, DBMS and OS theory — scored on technical accuracy, communication, completeness and confidence.",
  },
  {
    icon: FileText,
    title: "Resume ATS Check",
    body: "Upload your PDF resume and get a 0–100 ATS score with a factor-by-factor breakdown and prioritised fixes.",
  },
  {
    icon: Compass,
    title: "AI Guide & Roadmap",
    body: "Your weak topics become a ranked roadmap with practice questions, and the AI Guide answers prep questions in context.",
  },
];

function Landing() {
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
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-16 pb-14 text-center sm:pt-24">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Smart India Hackathon 2026</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">Your AI Placement Mentor</h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Stop guessing where you stand. PlacementAI runs realistic timed interviews, grades every
          answer against a strict rubric, and turns your weak spots into a study plan you can
          actually follow.
        </p>
        <Link
          to="/auth"
          search={{ mode: "register" }}
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get Started
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-lg border border-border bg-card p-6">
            <feature.icon className="h-6 w-6 text-accent" />
            <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Built for SIH 2026 · PS 26207
      </footer>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { getProfile } from "@/lib/profile.functions";
import { startInterview } from "@/lib/interview.functions";

export const Route = createFileRoute("/interview/setup")({
  head: () => ({
    meta: [
      { title: "Start a mock interview — PlacementAI" },
      {
        name: "description",
        content: "Choose your role, languages and round type, then start a timed AI mock interview.",
      },
      { property: "og:title", content: "Start a mock interview — PlacementAI" },
      {
        property: "og:description",
        content: "Choose your role, languages and round type, then start a timed AI mock interview.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Setup />
    </AppShell>
  ),
});

const ROLES = [
  { value: "SE", title: "Software Engineer", body: "Balanced DSA + OS" },
  { value: "ML", title: "ML Engineer", body: "Python, DSA and OS" },
  { value: "DA", title: "Data Analyst", body: "Database heavy" },
] as const;

const LANGUAGES = [
  { value: "C", label: "C" },
  { value: "CPP", label: "C++" },
  { value: "PYTHON", label: "Python" },
  { value: "JAVA", label: "Java" },
] as const;

const ROUNDS = [
  { value: "coding", title: "Coding Round", body: "5 basic coding questions · 2 min each" },
  { value: "writing", title: "Writing Round", body: "6 theory questions (DSA, DBMS, OS) · 2 min each" },
] as const;

function Setup() {
  const navigate = useNavigate();
  const loadProfile = useServerFn(getProfile);
  const start = useServerFn(startInterview);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => loadProfile() });

  const [role, setRole] = useState<"SE" | "ML" | "DA">("SE");
  const [languages, setLanguages] = useState<string[]>(["PYTHON"]);
  const [round, setRound] = useState<"coding" | "writing">("coding");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.target_role) setRole(profile.target_role as "SE" | "ML" | "DA");
    const stored = profile.preferred_languages as string[] | null;
    if (stored && stored.length > 0) setLanguages(stored);
  }, [profile]);

  async function begin() {
    if (languages.length === 0) {
      toast.error("Pick at least one language");
      return;
    }
    setBusy(true);
    try {
      const result = await start({
        data: {
          role,
          languages: languages as Array<"C" | "CPP" | "PYTHON" | "JAVA">,
          round_type: round,
        },
      });
      navigate({ to: "/interview/session/$id", params: { id: result.session_id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the interview");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Start a mock interview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Each question is timed at 2 minutes and auto-submits when the clock runs out.
      </p>

      <Section title="Role">
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                role === option.value
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:border-muted-foreground"
              }`}
            >
              <p className="font-medium">{option.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{option.body}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Languages">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() =>
                setLanguages((prev) =>
                  prev.includes(lang.value)
                    ? prev.filter((l) => l !== lang.value)
                    : [...prev, lang.value],
                )
              }
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                languages.includes(lang.value)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Round type">
        <div className="grid gap-3 sm:grid-cols-2">
          {ROUNDS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRound(option.value)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                round === option.value
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:border-muted-foreground"
              }`}
            >
              <p className="font-medium">{option.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{option.body}</p>
            </button>
          ))}
        </div>
      </Section>

      <button
        onClick={begin}
        disabled={busy}
        className="mt-10 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Preparing questions…" : "Start interview"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

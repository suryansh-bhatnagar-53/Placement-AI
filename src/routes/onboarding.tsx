import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { getProfile, saveOnboarding } from "@/lib/profile.functions";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — PlacementAI" },
      {
        name: "description",
        content: "Choose your target role and programming languages to personalise your prep.",
      },
      { property: "og:title", content: "Set up your profile — PlacementAI" },
      {
        property: "og:description",
        content: "Choose your target role and programming languages to personalise your prep.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Onboarding />
    </AppShell>
  ),
});

const ROLES = [
  { value: "SE", title: "Software Engineer", body: "Balanced DSA and OS focus" },
  { value: "ML", title: "ML Engineer", body: "Python-heavy with DSA and OS" },
  { value: "DA", title: "Data Analyst", body: "Database and SQL heavy" },
] as const;

const LANGUAGES = [
  { value: "C", label: "C" },
  { value: "CPP", label: "C++" },
  { value: "PYTHON", label: "Python" },
  { value: "JAVA", label: "Java" },
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const load = useServerFn(getProfile);
  const save = useServerFn(saveOnboarding);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => load() });

  const [name, setName] = useState("");
  const [role, setRole] = useState<"SE" | "ML" | "DA">("SE");
  const [languages, setLanguages] = useState<string[]>(["PYTHON"]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      if (profile.target_role) setRole(profile.target_role as "SE" | "ML" | "DA");
      const stored = profile.preferred_languages as string[] | null;
      if (stored && stored.length > 0) setLanguages(stored);
    }
  }, [profile]);

  function toggleLanguage(value: string) {
    setLanguages((prev) =>
      prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value],
    );
  }

  async function submit() {
    if (name.trim().length === 0) return toast.error("Enter your name");
    if (languages.length === 0) return toast.error("Pick at least one language");
    setBusy(true);
    try {
      await save({
        data: {
          name: name.trim(),
          target_role: role,
          preferred_languages: languages as Array<"C" | "CPP" | "PYTHON" | "JAVA">,
        },
      });
      toast.success("Profile saved");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Set up your profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This decides which questions you get and how your resume is scored.
      </p>

      <label className="mt-8 block">
        <span className="mb-1.5 block text-sm text-muted-foreground">Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </label>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Target role
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
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

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Preferred languages
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            type="button"
            onClick={() => toggleLanguage(lang.value)}
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

      <button
        onClick={submit}
        disabled={busy}
        className="mt-10 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save and continue"}
      </button>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { getProfile, saveOnboarding } from "@/lib/profile.functions";
import {
  type Answers,
  computeArchetype,
  computeStats,
  GENDERS,
  LANGUAGES,
  PERSONALITY_QUESTIONS,
  ROLES,
  YEARS,
} from "@/lib/onboarding-content";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your character — PlacementAI" },
      {
        name: "description",
        content:
          "A two-minute, game-style setup that builds your placement character sheet before you start practising.",
      },
      { property: "og:title", content: "Build your character — PlacementAI" },
      {
        property: "og:description",
        content:
          "A two-minute, game-style setup that builds your placement character sheet before you start practising.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Onboarding />
    </AppShell>
  ),
});

const TOTAL_STEPS = 8;

type Basics = {
  name: string;
  gender: string;
  college: string;
  course: string;
  year: string;
};

function Onboarding() {
  const navigate = useNavigate();
  const load = useServerFn(getProfile);
  const save = useServerFn(saveOnboarding);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => load() });

  const [screen, setScreen] = useState(0); // 0..13
  const [basics, setBasics] = useState<Basics>({
    name: "",
    gender: "",
    college: "",
    course: "",
    year: "",
  });
  const [role, setRole] = useState<"SE" | "ML" | "DA">("SE");
  const [languages, setLanguages] = useState<string[]>(["PYTHON"]);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.onboarded_at) {
      navigate({ to: "/dashboard" });
      return;
    }
    setBasics((prev) => ({
      ...prev,
      name: prev.name || (profile.name ?? ""),
      gender: prev.gender || (profile.gender ?? ""),
      college: prev.college || (profile.college ?? ""),
      course: prev.course || (profile.course ?? ""),
      year: prev.year || (profile.year_of_study ?? ""),
    }));
    if (profile.target_role) setRole(profile.target_role as "SE" | "ML" | "DA");
    const stored = profile.preferred_languages as string[] | null;
    if (stored && stored.length > 0) setLanguages(stored);
  }, [profile, navigate]);

  const stats = useMemo(() => computeStats(answers), [answers]);
  const archetype = useMemo(() => computeArchetype(answers), [answers]);

  // screens 0-4 = step 1, 5-6 = step 2, 7-11 = steps 3-7, 12 = step 8
  const step = screen <= 4 ? 1 : screen <= 6 ? 2 : screen <= 11 ? screen - 4 : 8;

  function next() {
    setScreen((s) => Math.min(12, s + 1));
  }
  function back() {
    setScreen((s) => Math.max(0, s - 1));
  }

  async function finish() {
    if (basics.name.trim().length === 0) {
      toast.error("We still need a name to call you by");
      setScreen(0);
      return;
    }
    if (languages.length === 0) {
      toast.error("Pick at least one language");
      setScreen(6);
      return;
    }
    setBusy(true);
    try {
      await save({
        data: {
          name: basics.name.trim(),
          target_role: role,
          preferred_languages: languages as Array<"C" | "CPP" | "PYTHON" | "JAVA">,
          gender: basics.gender || undefined,
          college: basics.college.trim() || undefined,
          course: basics.course.trim() || undefined,
          year_of_study: basics.year || undefined,
          personality_answers: answers as Record<string, string>,
          archetype,
          stat_adaptability: stats.adaptability,
          stat_resilience: stats.resilience,
          stat_focus: stats.focus,
        },
      });
      toast.success("Character saved. Let's go!");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile");
      setBusy(false);
    }
  }

  function answer(id: keyof Answers, key: string) {
    setAnswers((prev) => ({ ...prev, [id]: key }));
    setTimeout(next, 220);
  }

  const initials =
    basics.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Step {step} of {TOTAL_STEPS}
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="min-h-[300px]">
          {screen > 0 && screen < 12 ? (
            <button
              onClick={back}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : null}

          {screen === 0 ? (
            <TextScreen
              title="First off, what should we call you?"
              sub="No formalities needed — just your name."
              value={basics.name}
              onChange={(v) => setBasics({ ...basics, name: v })}
              onNext={() => {
                if (basics.name.trim().length === 0) {
                  toast.error("Enter your name");
                  return;
                }
                next();
              }}
            />
          ) : null}

          {screen === 1 ? (
            <ChoiceScreen
              title="How would you like to be addressed?"
              sub="Totally optional — skip if you'd rather not say."
              options={GENDERS.map((g) => ({ key: g, label: g }))}
              selected={basics.gender}
              onSelect={(key) => {
                setBasics({ ...basics, gender: key });
                setTimeout(next, 200);
              }}
              onSkip={next}
            />
          ) : null}

          {screen === 2 ? (
            <TextScreen
              title="Which college are you representing?"
              sub="Great choice coming here early in the season."
              value={basics.college}
              onChange={(v) => setBasics({ ...basics, college: v })}
              onNext={next}
              onSkip={next}
            />
          ) : null}

          {screen === 3 ? (
            <TextScreen
              title="What's your course and specialization?"
              sub="For example: B.Tech, Computer Science."
              value={basics.course}
              onChange={(v) => setBasics({ ...basics, course: v })}
              onNext={next}
              onSkip={next}
            />
          ) : null}

          {screen === 4 ? (
            <ChoiceScreen
              title="What year of study are you in?"
              sub="This just helps us pace your prep."
              options={YEARS.map((y) => ({ key: y, label: `${y} year` }))}
              selected={basics.year}
              onSelect={(key) => {
                setBasics({ ...basics, year: key });
                setTimeout(next, 200);
              }}
              onSkip={next}
            />
          ) : null}

          {screen === 5 ? (
            <ChoiceScreen
              title="Which role are you chasing?"
              sub="You can change this any time later."
              options={ROLES.map((r) => ({ key: r.value, label: r.title, blurb: r.body }))}
              selected={role}
              onSelect={(key) => {
                setRole(key as "SE" | "ML" | "DA");
                setTimeout(next, 200);
              }}
            />
          ) : null}

          {screen === 6 ? (
            <div>
              <h1 className="text-2xl font-semibold">
                Which language will you fight your interviews in?
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick one or more — we'll mix your questions accordingly.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {LANGUAGES.map((lang) => {
                  const on = languages.includes(lang.value);
                  return (
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
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        on
                          ? "border-primary bg-secondary"
                          : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      <p className="font-medium">{lang.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lang.body}</p>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  if (languages.length === 0) {
                    toast.error("Pick at least one language");
                    return;
                  }
                  next();
                }}
                className="mt-8 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground hover:opacity-90"
              >
                Continue
              </button>
            </div>
          ) : null}

          {screen >= 7 && screen <= 11
            ? (() => {
                const q = PERSONALITY_QUESTIONS[screen - 7]!;
                return (
                  <ChoiceScreen
                    title={q.prompt}
                    sub={q.hint}
                    options={q.choices}
                    selected={answers[q.id] ?? ""}
                    onSelect={(key) => answer(q.id, key)}
                    onSkip={next}
                  />
                );
              })()
            : null}

          {screen === 12 ? (
            <div>
              <h1 className="text-2xl font-semibold">Your character sheet</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Here's how you show up when things get busy.
              </p>
              <div className="mt-6 rounded-lg border border-border bg-card p-6">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Archetype</p>
                <p className="mt-1 text-xl font-semibold text-primary">{archetype}</p>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <Row label="Name" value={basics.name || "—"} />
                  <Row label="Role" value={ROLES.find((r) => r.value === role)?.title ?? role} />
                  <Row
                    label="Languages"
                    value={languages
                      .map((l) => LANGUAGES.find((x) => x.value === l)?.label ?? l)
                      .join(", ")}
                  />
                  <Row label="College" value={basics.college || "—"} />
                </dl>
              </div>
              <button
                onClick={finish}
                disabled={busy}
                className="mt-8 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Start Your Journey"}
              </button>
            </div>
          ) : null}
        </div>

        <aside className="order-first rounded-lg border border-border bg-card p-5 lg:order-last lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium">{basics.name.trim() || "Your character"}</p>
              <p className="text-xs text-muted-foreground">{archetype}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <Bar label="Adaptability" value={stats.adaptability} />
            <Bar label="Resilience" value={stats.resilience} />
            <Bar label="Focus & Strategy" value={stats.focus} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Your stats tick up as you answer. Nothing is saved until the last screen.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function TextScreen({
  title,
  sub,
  value,
  onChange,
  onNext,
  onSkip,
}: {
  title: string;
  sub: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onSkip?: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onNext();
        }}
        className="input mt-6"
        autoFocus
      />
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={onNext}
          className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          Continue
        </button>
        {onSkip ? (
          <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground">
            Skip
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ChoiceScreen({
  title,
  sub,
  options,
  selected,
  onSelect,
  onSkip,
}: {
  title: string;
  sub: string;
  options: ReadonlyArray<{ key: string; label: string; blurb?: string }>;
  selected: string;
  onSelect: (key: string) => void;
  onSkip?: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      <div className="mt-6 grid gap-3">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              selected === option.key
                ? "border-primary bg-secondary"
                : "border-border bg-card hover:border-muted-foreground"
            }`}
          >
            <p className="font-medium">{option.label}</p>
            {option.blurb ? (
              <p className="mt-1 text-xs text-muted-foreground">{option.blurb}</p>
            ) : null}
          </button>
        ))}
      </div>
      {onSkip ? (
        <button
          onClick={onSkip}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground"
        >
          Skip this one
        </button>
      ) : null}
    </div>
  );
}

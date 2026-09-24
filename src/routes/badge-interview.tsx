import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BadgeLogo, BadgeShelf, CuriousMindMark } from "@/components/TraitBadge";
import { getMyBadges, submitBadgeInterview } from "@/lib/badges.functions";
import { getUserProfile } from "@/lib/user-profile.functions";
import {
  ARRANGES,
  CURIOUS_MIND,
  MCQS,
  THINKING,
  THINK_MAX_WORDS,
  THINK_MIN_WORDS,
  THINK_SOFT_CAP,
  TRAIT_INFO,
  TRAITS,
  wordCount,
  type Trait,
  type TraitScores,
} from "@/lib/badge-interview-content";

export const Route = createFileRoute("/badge-interview")({
  head: () => ({
    meta: [
      { title: "Badge Interview — PlacementAI" },
      { name: "description", content: "A three-round behavioural interview where you earn trait badges for your profile." },
      { property: "og:title", content: "Badge Interview — PlacementAI" },
      { property: "og:description", content: "Earn Adaptability, Resilience, Leadership, Collaboration and Critical Thinking badges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <BadgeInterviewPage />
    </AppShell>
  ),
});

type Stage = "intro" | "mcq" | "arrange" | "think" | "saving" | "result";
type Result = { scores: TraitScores; top: Trait; isNew: boolean; earned: Trait[]; curious_mind: boolean };

const shuffleInit = () => ARRANGES.map((q) => q.steps.map((s) => s.id));

function BadgeInterviewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const loadBadges = useServerFn(getMyBadges);
  const loadProfile = useServerFn(getUserProfile);
  const submit = useServerFn(submitBadgeInterview);
  const badges = useQuery({ queryKey: ["my-badges"], queryFn: () => loadBadges() });
  const profile = useQuery({ queryKey: ["user-profile"], queryFn: () => loadProfile() });
  const firstName = (profile.data?.profile?.name || "friend").split(" ")[0];

  const [stage, setStage] = useState<Stage>("intro");
  const [i, setI] = useState(0);
  const [mcq, setMcq] = useState<(number | null)[]>(() => MCQS.map(() => null));
  const [orders, setOrders] = useState<string[][]>(shuffleInit);
  const [thinking, setThinking] = useState<string[]>(() => THINKING.map(() => ""));
  const [picked, setPicked] = useState<number | null>(null);
  const [roundNote, setRoundNote] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const reset = () => {
    setMcq(MCQS.map(() => null));
    setOrders(shuffleInit());
    setThinking(THINKING.map(() => ""));
    setPicked(null);
    setI(0);
    setResult(null);
    setRoundNote(null);
    setStage("intro");
  };

  const finish = async (finalThinking: string[]) => {
    setStage("saving");
    try {
      const r = await submit({ data: { mcq, arrange: orders, thinking: finalThinking } });
      setResult(r as Result);
      setStage("result");
      qc.invalidateQueries({ queryKey: ["my-badges"] });
      window.scrollTo({ top: 0 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your result");
      setStage("think");
    }
  };

  const earned = (badges.data?.earned ?? []) as Trait[];

  if (roundNote) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-lg font-semibold">{roundNote}</p>
        <button onClick={() => setRoundNote(null)} className="mt-6 rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground">
          Continue
        </button>
      </div>
    );
  }

  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Badge Interview</h1>
        <div className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-5 text-sm leading-relaxed">
          <strong>This interview is a long one — please be prepared.</strong> It's about how you handle real situations
          (not coding), with 3 rounds: 10 quick choices, 5 put-in-order puzzles and 5 short written answers. You can
          retake it as many times as you like.
        </div>
        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-medium">
            Your badges so far <CuriousMindMark unlocked={Boolean(badges.data?.curious_mind)} />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {earned.length} of 5 earned. {earned.length === 5 ? "You've unlocked the Curious Mind badge!" : "Earn all five to unlock the Curious Mind badge."}
          </p>
          <div className="mt-4">
            <BadgeShelf earned={earned} />
          </div>
        </section>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setStage("mcq")} className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground">
            Begin
          </button>
          <button onClick={() => navigate({ to: "/profile" })} className="rounded-md border border-border px-6 py-2.5 text-muted-foreground">
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (stage === "mcq") {
    const q = MCQS[i]!;
    const next = (choice: number | null) => {
      const copy = [...mcq];
      copy[i] = choice;
      setMcq(copy);
      setPicked(null);
      if (i + 1 < MCQS.length) setI(i + 1);
      else {
        setI(0);
        setStage("arrange");
        setRoundNote("Round 1 done — nice going! Next up: putting steps in order.");
      }
    };
    return (
      <RoundFrame round={1} title="Pick the best move" index={i} total={MCQS.length}>
        <p className="text-base leading-relaxed">{q.text}</p>
        <div className="mt-5 grid gap-3">
          {q.options.map((o, k) => (
            <button
              key={k}
              onClick={() => setPicked(k)}
              aria-pressed={picked === k}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${picked === k ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}
            >
              {o.text}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={() => next(null)} className="text-sm text-muted-foreground hover:text-foreground">
            Skip (counts as not handled)
          </button>
          <button disabled={picked === null} onClick={() => next(picked)} className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground disabled:opacity-40">
            Next
          </button>
        </div>
      </RoundFrame>
    );
  }

  if (stage === "arrange") {
    const q = ARRANGES[i]!;
    const order = orders[i]!;
    const move = (from: number, to: number) => {
      if (to < 0 || to >= order.length) return;
      const copy = [...order];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item!);
      setOrders(orders.map((o, k) => (k === i ? copy : o)));
    };
    const next = () => {
      if (i + 1 < ARRANGES.length) setI(i + 1);
      else {
        setI(0);
        setStage("think");
        setRoundNote("Round 2 done — great thinking! Last round: short written answers.");
      }
    };
    return (
      <RoundFrame round={2} title="Put the steps in the order you'd follow" index={i} total={ARRANGES.length}>
        <p className="text-base leading-relaxed">{q.text}</p>
        <p className="mt-1 text-xs text-muted-foreground">There's no single right order. Drag the boxes or use the arrows.</p>
        <ol className="mt-5 space-y-2">
          {order.map((id, k) => {
            const step = q.steps.find((s) => s.id === id)!;
            return (
              <li
                key={id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(k))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  move(Number(e.dataTransfer.getData("text/plain")), k);
                }}
                className="flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 text-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{k + 1}</span>
                <span className="flex-1">{step.text}</span>
                <button aria-label="Move up" onClick={() => move(k, k - 1)} disabled={k === 0} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button aria-label="Move down" onClick={() => move(k, k + 1)} disabled={k === order.length - 1} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 flex justify-end">
          <button onClick={next} className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground">
            Lock in this order
          </button>
        </div>
      </RoundFrame>
    );
  }

  if (stage === "think" || stage === "saving") {
    const text = thinking[i]!;
    const words = wordCount(text);
    const next = (skip: boolean) => {
      const copy = [...thinking];
      if (skip) copy[i] = "";
      setThinking(copy);
      if (i + 1 < THINKING.length) setI(i + 1);
      else void finish(copy);
    };
    return (
      <RoundFrame round={3} title="Tell us how you'd think it through" index={i} total={THINKING.length}>
        <p className="text-base leading-relaxed">{THINKING[i]}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Aim for about 100–200 words. Clear ideas matter more than length.
        </p>
        <textarea
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            if (wordCount(v) > THINK_MAX_WORDS) return;
            setThinking(thinking.map((t, k) => (k === i ? v : t)));
          }}
          rows={9}
          className="input mt-4 resize-y"
          placeholder="Write what you'd actually do, and why."
        />
        <p className={`mt-1 text-right text-xs ${words > THINK_SOFT_CAP ? "text-destructive" : "text-muted-foreground"}`}>
          {words} / {THINK_SOFT_CAP} words{words > THINK_SOFT_CAP ? " — try to keep it shorter" : ""}
        </p>
        <div className="mt-4 flex justify-between">
          <button onClick={() => next(true)} disabled={stage === "saving"} className="text-sm text-muted-foreground hover:text-foreground">
            Skip (counts as not handled)
          </button>
          <button
            disabled={words < THINK_MIN_WORDS || stage === "saving"}
            onClick={() => next(false)}
            className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground disabled:opacity-40"
          >
            {stage === "saving" ? "Working out your result…" : i + 1 === THINKING.length ? "Finish" : "Next"}
          </button>
        </div>
        {words < THINK_MIN_WORDS ? (
          <p className="mt-2 text-xs text-muted-foreground">Write at least {THINK_MIN_WORDS} words to continue.</p>
        ) : null}
      </RoundFrame>
    );
  }

  if (!result) return null;
  const info = TRAIT_INFO[result.top];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 text-center">
        <div className="flex justify-center">
          <BadgeLogo kind={result.top} size={96} title={`${info.label} — ${info.meaning}`} />
        </div>
        {result.isNew ? (
          <>
            <p className="mt-4 text-xl font-semibold">New badge unlocked!</p>
            <p className="mt-1 text-muted-foreground">
              {info.label} — “{info.meaning}”
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 text-xl font-semibold">You already hold this badge — great work!</p>
            <p className="mt-1 text-muted-foreground">
              Your strongest side this time was {info.label}. Try again to earn a different one.
            </p>
          </>
        )}
        {result.curious_mind ? (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm">
            <BadgeLogo kind="curious" size={32} title={CURIOUS_MIND.label} /> {CURIOUS_MIND.label}: {CURIOUS_MIND.meaning}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Your strengths this time</h2>
        <div className="mt-4 space-y-3">
          {TRAITS.map((t) => (
            <div key={t}>
              <div className="flex justify-between text-sm">
                <span>{TRAIT_INFO[t].label}</span>
                <span className="text-muted-foreground">{result.scores[t]}</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${result.scores[t]}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <BadgeShelf earned={result.earned} highlight={result.isNew ? result.top : null} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Keep going, {firstName}</h2>
        <blockquote className="mt-2 rounded-xl border-l-4 border-primary bg-primary/10 p-5">
          <p className="text-base italic leading-relaxed">“{info.quote}”</p>
          <footer className="mt-2 text-sm text-muted-foreground">— {info.author}</footer>
        </blockquote>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/profile" className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground">
          View My Badges
        </Link>
        <button onClick={reset} className="rounded-md border border-border px-5 py-2.5">
          Retake Interview
        </button>
      </div>
    </div>
  );
}

function RoundFrame({
  round,
  title,
  index,
  total,
  children,
}: {
  round: number;
  title: string;
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Round {round} of 3 · {title}</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">{children}</div>
    </div>
  );
}

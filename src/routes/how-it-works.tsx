import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  ARCH_EDGES,
  ARCH_GROUPS,
  ARCH_NODES,
  type ArchEdge,
  type ArchNode,
} from "@/lib/architecture-content";
import { ArrowDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — PlacementAI" },
      {
        name: "description",
        content:
          "An interactive, plain-language map of how PlacementAI turns your practice into a personalised plan.",
      },
      { property: "og:title", content: "How It Works — PlacementAI" },
      {
        property: "og:description",
        content:
          "An interactive, plain-language map of how PlacementAI turns your practice into a personalised plan.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <HowItWorks />
    </AppShell>
  ),
});

type Selection =
  | { kind: "node"; item: ArchNode }
  | { kind: "arrow"; item: ArchEdge }
  | null;

const LAYER_TITLES = {
  user: "1 · The student arrives",
  entry: "2 · The hub",
  action: "3 · The six modules",
  engine: "4 · What powers it all",
  loop: "5 · The feedback loop",
} as const;

function HowItWorks() {
  const [selected, setSelected] = useState<Selection>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const byLayer = useMemo(
    () => ({
      user: ARCH_NODES.filter((n) => n.layer === "user"),
      entry: ARCH_NODES.filter((n) => n.layer === "entry"),
      modules: ARCH_NODES.filter((n) => n.layer === "action" && n.type === "module"),
      engine: ARCH_NODES.filter((n) => n.layer === "engine"),
      loop: ARCH_NODES.filter((n) => n.layer === "loop"),
    }),
    [],
  );

  const edge = (id: string) => ARCH_EDGES.find((e) => e.id === id)!;
  const dimmed = (group?: string) => focus !== null && group !== focus;

  const nodeButton = (node: ArchNode, extra?: string) => (
    <button
      key={node.id}
      type="button"
      onClick={() => setSelected({ kind: "node", item: node })}
      aria-label={`Explain: ${node.label}`}
      className={cn(
        "rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        node.type === "module"
          ? "border-primary/50 bg-secondary font-medium"
          : node.type === "engine"
            ? "border-accent/60 bg-card font-medium"
            : "border-border bg-card",
        selected?.kind === "node" && selected.item.id === node.id
          ? "border-primary ring-1 ring-primary"
          : "hover:border-primary",
        dimmed(node.group) && "opacity-35",
        extra,
      )}
    >
      {node.label}
    </button>
  );

  const arrowButton = (edgeId: string) => {
    const e = edge(edgeId);
    return (
      <button
        type="button"
        onClick={() => setSelected({ kind: "arrow", item: e })}
        aria-label={`Explain connection: ${e.label}`}
        className={cn(
          "mx-auto my-3 flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected?.kind === "arrow" && selected.item.id === e.id && "border-primary text-primary",
        )}
      >
        <ArrowDown className="h-3.5 w-3.5" />
        {e.label}
      </button>
    );
  };

  return (
    <div className="relative">
      <h1 className="text-2xl font-semibold">How PlacementAI Works, Simplified</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Follow the story from left to right, top to bottom — click any box or arrow and a small
        card will explain it in plain English.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Highlight one module:</span>
        {ARCH_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setFocus(focus === g.id ? null : g.id)}
            aria-pressed={focus === g.id}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              focus === g.id
                ? "border-primary bg-secondary text-primary"
                : "border-border text-muted-foreground hover:border-primary",
            )}
          >
            {g.label}
          </button>
        ))}
        {focus ? (
          <button
            type="button"
            onClick={() => setFocus(null)}
            className="text-xs text-muted-foreground underline"
          >
            Show all
          </button>
        ) : null}
      </div>

      <div className="mt-6 overflow-x-auto pb-40 lg:pb-32">
        <div className="min-w-[640px] space-y-2">
          <Layer title={LAYER_TITLES.user}>
            <div className="grid gap-3 sm:grid-cols-3">{byLayer.user.map((n) => nodeButton(n))}</div>
          </Layer>
          {arrowButton("e-onboarding-hub")}

          <Layer title={LAYER_TITLES.entry}>
            <div className="grid gap-3">{byLayer.entry.map((n) => nodeButton(n))}</div>
          </Layer>
          {arrowButton("e-hub-actions")}

          <Layer title={LAYER_TITLES.action}>
            <div className="grid gap-4 md:grid-cols-3">
              {byLayer.modules.map((mod) => (
                <div
                  key={mod.id}
                  className={cn(
                    "rounded-lg border border-border/70 p-3 transition-opacity",
                    dimmed(mod.group) && "opacity-40",
                  )}
                >
                  {nodeButton(mod, "w-full")}
                  <div className="mt-2 space-y-2 border-l border-dashed border-border pl-3">
                    {ARCH_NODES.filter(
                      (n) => n.type === "subnode" && n.layer === "action" && n.group === mod.group,
                    ).map((n) => nodeButton(n, "block w-full text-xs"))}
                  </div>
                </div>
              ))}
            </div>
          </Layer>
          {arrowButton("e-actions-engine")}

          <Layer title={LAYER_TITLES.engine}>
            <div className="grid gap-3">{byLayer.engine.map((n) => nodeButton(n))}</div>
          </Layer>
          {arrowButton("e-engine-loop")}

          <Layer title={LAYER_TITLES.loop}>
            <div className="grid gap-3">{byLayer.loop.map((n) => nodeButton(n))}</div>
            {arrowButton("e-loop-hub")}
          </Layer>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {selected ? `Explanation open: ${selected.item.label}` : "Explanation closed"}
      </div>

      {selected ? (
        <div
          role="dialog"
          aria-label={`Explanation: ${selected.item.label}`}
          className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-primary/50 bg-card p-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-accent">
                {selected.kind === "arrow" ? "Connection" : selected.item.type}
              </p>
              <h2 className="mt-1 text-sm font-semibold">{selected.item.label}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close explanation"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{selected.item.summary}</p>
          {selected.kind === "node" && selected.item.analogy ? (
            <p className="mt-2 rounded-md bg-secondary p-2 text-xs text-muted-foreground">
              {selected.item.analogy}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Layer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-background/40 p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  HLA_EDGES,
  HLA_NODES,
  HLA_SCENARIOS,
  type HlaEdge,
  type HlaNode,
  type HlaScenario,
} from "@/lib/hla-content";
import { ArrowDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "High-Level Architecture — PlacementAI" },
      {
        name: "description",
        content:
          "Developer view of PlacementAI: client, server functions, Postgres with row-level security, the AI gateway and the feedback loop.",
      },
      { property: "og:title", content: "High-Level Architecture — PlacementAI" },
      {
        property: "og:description",
        content:
          "Developer view of PlacementAI: client, server functions, Postgres with row-level security, the AI gateway and the feedback loop.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Architecture />
    </AppShell>
  ),
});

type Selection =
  | { kind: "node"; item: HlaNode }
  | { kind: "edge"; item: HlaEdge }
  | { kind: "scenario"; item: HlaScenario }
  | null;

const LAYER_TITLES = {
  client: "1 · Client layer — TanStack Start frontend",
  api: "2 · API layer — server functions (src/lib/*.functions.ts)",
  data: "3 · Data layer — Postgres (Lovable Cloud)",
  external: "4 · External systems",
  loop: "5 · Feedback loop",
} as const;

function Architecture() {
  const [selected, setSelected] = useState<Selection>(null);

  const byLayer = useMemo(
    () => ({
      client: HLA_NODES.filter((n) => n.layer === "client"),
      api: HLA_NODES.filter((n) => n.layer === "api"),
      data: HLA_NODES.filter((n) => n.layer === "data"),
      external: HLA_NODES.filter((n) => n.layer === "external"),
      loop: HLA_NODES.filter((n) => n.layer === "loop"),
    }),
    [],
  );

  const edge = (id: string) => HLA_EDGES.find((e) => e.id === id)!;

  const nodeButton = (node: HlaNode, extra?: string) => (
    <button
      key={node.id}
      type="button"
      onClick={() => setSelected({ kind: "node", item: node })}
      aria-label={`Explain component: ${node.label}`}
      className={cn(
        "rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        node.type === "data"
          ? "border-accent/60 bg-card"
          : node.type === "external"
            ? "border-dashed border-accent/70 bg-background"
            : node.type === "flow"
              ? "border-primary/50 bg-secondary"
              : "border-border bg-card",
        selected?.kind === "node" && selected.item.id === node.id
          ? "border-primary ring-1 ring-primary"
          : "hover:border-primary",
        extra,
      )}
    >
      <span className="block font-medium">{node.label}</span>
      {node.related_tables?.length ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          tables: {node.related_tables.join(" · ")}
        </span>
      ) : null}
    </button>
  );

  const edgeButton = (id: string) => {
    const e = edge(id);
    return (
      <button
        type="button"
        onClick={() => setSelected({ kind: "edge", item: e })}
        aria-label={`Explain data flow: ${e.label}`}
        className={cn(
          "mx-auto my-3 flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected?.kind === "edge" && selected.item.id === e.id && "border-primary text-primary",
        )}
      >
        <ArrowDown className="h-3.5 w-3.5" />
        {e.label}
      </button>
    );
  };

  const selectedLabel =
    selected === null
      ? null
      : selected.kind === "scenario"
        ? selected.item.label
        : selected.item.label;

  return (
    <div className="relative">
      <h1 className="text-2xl font-semibold">High-Level Architecture — Developer View</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The real data path through PlacementAI — client, server functions, Postgres with row-level
        security, and the one external AI dependency. Click any box or arrow for the implementation
        detail.
      </p>

      <div className="mt-6 overflow-x-auto pb-44 lg:pb-36">
        <div className="min-w-[620px] space-y-2">
          <Layer title={LAYER_TITLES.client}>
            <div className="grid gap-3 md:grid-cols-3">
              {byLayer.client.map((n) => nodeButton(n))}
            </div>
          </Layer>
          {edgeButton("e-client-api")}

          <Layer title={LAYER_TITLES.api}>
            <div className="grid gap-3 md:grid-cols-2">{byLayer.api.map((n) => nodeButton(n))}</div>
          </Layer>
          {edgeButton("e-api-data")}

          <Layer title={LAYER_TITLES.data}>
            <div className="grid gap-3">{byLayer.data.map((n) => nodeButton(n))}</div>
          </Layer>
          {edgeButton("e-api-ai")}

          <Layer title={LAYER_TITLES.external}>
            <div className="grid gap-3 md:grid-cols-2">
              {byLayer.external.map((n) => nodeButton(n))}
            </div>
          </Layer>
          {edgeButton("e-data-loop")}

          <Layer title={LAYER_TITLES.loop}>
            <div className="grid gap-3">{byLayer.loop.map((n) => nodeButton(n))}</div>
            {edgeButton("e-loop-client")}
          </Layer>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Common scenarios &amp; how the backend handles them</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each card follows trigger → what happens → how it is handled → user impact.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HLA_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected({ kind: "scenario", item: s })}
              aria-label={`Explain scenario: ${s.label}`}
              className={cn(
                "rounded-lg border bg-card p-4 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected?.kind === "scenario" && selected.item.id === s.id
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-primary",
              )}
            >
              <span className="block font-medium">{s.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{s.trigger}</span>
            </button>
          ))}
        </div>
      </section>

      <div aria-live="polite" className="sr-only">
        {selected ? `Explanation open: ${selectedLabel}` : "Explanation closed"}
      </div>

      {selected ? (
        <div
          role="dialog"
          aria-label={`Explanation: ${selectedLabel}`}
          className="fixed bottom-4 right-4 z-50 max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-primary/50 bg-card p-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-accent">
                {selected.kind === "edge"
                  ? "Data flow"
                  : selected.kind === "scenario"
                    ? "Scenario"
                    : selected.item.type}
              </p>
              <h3 className="mt-1 text-sm font-semibold">{selectedLabel}</h3>
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

          {selected.kind === "scenario" ? (
            <dl className="mt-2 space-y-2 text-sm text-muted-foreground">
              <Field term="Trigger" value={selected.item.trigger} />
              <Field term="What happens" value={selected.item.happens} />
              <Field term="How the backend handles it" value={selected.item.handling} />
              <Field term="User impact" value={selected.item.impact} />
            </dl>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{selected.item.developer_summary}</p>
          )}

          {selected.kind !== "scenario" && selected.kind === "node" && selected.item.related_tables?.length ? (
            <p className="mt-2 rounded-md bg-secondary p-2 text-xs text-muted-foreground">
              Tables: {selected.item.related_tables.join(", ")}
            </p>
          ) : null}

          {selected.item.related_code?.length ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Code: {selected.item.related_code.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Field({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-foreground">{term}</dt>
      <dd className="mt-0.5">{value}</dd>
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

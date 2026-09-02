import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getCheatSheet } from "@/lib/cheatsheet.functions";
import { BookOpen, ChevronDown, ExternalLink } from "lucide-react";

const ROLES = [
  { value: "SE", label: "Software Engineering" },
  { value: "ML", label: "Machine Learning" },
  { value: "DA", label: "Data Analytics" },
] as const;

export const Route = createFileRoute("/cheatsheet")({
  head: () => ({
    meta: [
      { title: "General Cheat Sheet — PlacementAI" },
      {
        name: "description",
        content:
          "Core topics, real practice problems, project ideas and a 4-week plan for SE, ML and Data Analytics roles.",
      },
      { property: "og:title", content: "General Cheat Sheet — PlacementAI" },
      {
        property: "og:description",
        content:
          "Core topics, real practice problems, project ideas and a 4-week plan for SE, ML and Data Analytics roles.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <CheatSheetPage />
    </AppShell>
  ),
});

function CheatSheetPage() {
  const load = useServerFn(getCheatSheet);
  const [role, setRole] = useState<"SE" | "ML" | "DA">("SE");
  const [open, setOpen] = useState<string[]>(["core"]);

  const { data, isLoading } = useQuery({
    queryKey: ["cheatsheet", role],
    queryFn: () => load({ data: { role } }),
  });

  const weak = data?.weak_topics ?? [];

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-semibold">
        <BookOpen className="h-6 w-6 text-primary" /> General Cheat Sheet
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything worth revising before a placement round, per role.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
              role === r.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading cheat sheet…</p>
      ) : (
        <div className="mt-6 space-y-3">
          {data.sheet.sections.map((section) => {
            const expanded = open.includes(section.key);
            const isWeak = (section.topics ?? []).some((t) => weak.includes(t));
            return (
              <section key={section.key} className="rounded-lg border border-border bg-card">
                <button
                  onClick={() =>
                    setOpen((prev) =>
                      prev.includes(section.key)
                        ? prev.filter((k) => k !== section.key)
                        : [...prev, section.key],
                    )
                  }
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                  <h2 className="flex-1 font-medium">{section.title}</h2>
                  {isWeak ? (
                    <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs text-destructive">
                      Weak spot
                    </span>
                  ) : null}
                </button>
                {expanded ? (
                  <ul className="space-y-2 border-t border-border p-4 pt-3">
                    {section.items.map((item) => (
                      <li key={item.name} className="text-sm">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            {item.name} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-medium">{item.name}</span>
                        )}
                        {item.detail ? (
                          <span className="text-muted-foreground"> — {item.detail}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { getPerformance } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — PlacementAI" },
      {
        name: "description",
        content: "Track readiness over time, average sub-scores per topic and interview history.",
      },
      { property: "og:title", content: "Performance — PlacementAI" },
      {
        property: "og:description",
        content: "Track readiness over time, average sub-scores per topic and interview history.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Performance />
    </AppShell>
  ),
});

const TOPIC_LABELS: Record<string, string> = {
  basic: "Basic Coding",
  dsa: "DSA",
  dbms: "DBMS",
  os: "OS",
};

function Performance() {
  const load = useServerFn(getPerformance);
  const { data, isLoading } = useQuery({ queryKey: ["performance"], queryFn: () => load() });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  const snapshots = data?.snapshots ?? [];
  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];
  const history = data?.interview_history ?? [];
  const topicData = (data?.topic_averages ?? []).map((t) => ({
    topic: TOPIC_LABELS[t.topic] ?? t.topic,
    avg: t.avgTechnical,
  }));

  if (snapshots.length === 0 && history.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <h1 className="text-xl font-semibold">No performance data yet</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Finish one mock interview and your readiness score, sub-scores and topic coverage will
          appear here.
        </p>
        <Link
          to="/interview/setup"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground"
        >
          Take your first interview
        </Link>
      </div>
    );
  }

  const delta = latest && previous ? latest.readiness - previous.readiness : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Performance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything is derived from the answers you submitted — no estimates.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Readiness"
          value={latest ? latest.readiness.toFixed(1) : "—"}
          hint={
            delta === null
              ? "First snapshot"
              : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)} vs previous`
          }
        />
        <StatCard label="Interviews" value={history.filter((h) => h.status === "completed").length} />
        <StatCard label="Technical" value={latest?.avg_technical ?? "—"} />
        <StatCard label="Communication" value={latest?.avg_communication ?? "—"} />
        <StatCard label="Completeness" value={latest?.avg_completeness ?? "—"} />
        <StatCard label="Last ATS" value={data?.ats_last ?? "—"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Readiness over time
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={snapshots.map((s) => ({
                  date: new Date(s.date).toLocaleDateString(),
                  readiness: s.readiness,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="readiness"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Average technical score by topic
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="topic" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="avg" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Interview history</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Round</th>
                <th className="px-4 py-2.5">Questions</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-t border-border bg-card">
                  <td className="px-4 py-2.5">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">{row.role}</td>
                  <td className="px-4 py-2.5 capitalize">{row.round_type}</td>
                  <td className="px-4 py-2.5">{row.questions}</td>
                  <td className="px-4 py-2.5">
                    {row.score === null ? "—" : row.score.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">
                    {row.status === "completed" ? (
                      <Link
                        to="/interview/report/$id"
                        params={{ id: row.id }}
                        className="text-primary hover:underline"
                      >
                        View report
                      </Link>
                    ) : (
                      row.status.replace("_", " ")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

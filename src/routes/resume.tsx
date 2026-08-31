import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { ScoreRing } from "@/components/ScoreRing";
import { analyzeResumeText, listResumeReports } from "@/lib/resume.functions";
import { extractPdfText } from "@/lib/pdf-text";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume ATS check — PlacementAI" },
      {
        name: "description",
        content: "Upload a PDF resume and get an ATS score with a breakdown and prioritised fixes.",
      },
      { property: "og:title", content: "Resume ATS check — PlacementAI" },
      {
        property: "og:description",
        content: "Upload a PDF resume and get an ATS score with a breakdown and prioritised fixes.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ResumePage />
    </AppShell>
  ),
});

const FACTOR_LABELS: Record<string, { label: string; max: number }> = {
  contact: { label: "Contact", max: 10 },
  structure: { label: "Structure", max: 20 },
  keywords: { label: "Keywords", max: 40 },
  action_verbs: { label: "Action verbs", max: 10 },
  quantifiable: { label: "Quantified", max: 10 },
  formatting: { label: "Formatting", max: 10 },
};

function ResumePage() {
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeResumeText);
  const loadReports = useServerFn(listResumeReports);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data: reports } = useQuery({
    queryKey: ["ats-reports"],
    queryFn: () => loadReports(),
  });

  const latest = reports?.[0];
  const previous = reports?.[1];

  async function onFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be 5 MB or smaller");
      return;
    }
    setBusy(true);
    try {
      const text = await extractPdfText(file);
      await analyze({ data: { file_name: file.name, text } });
      await queryClient.invalidateQueries({ queryKey: ["ats-reports"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Resume analysed");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not read PDF; ensure it's text-based, not a scanned image",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const breakdown = (latest?.breakdown ?? {}) as Record<string, number>;
  const chartData = Object.entries(FACTOR_LABELS).map(([key, meta]) => ({
    factor: meta.label,
    scored: breakdown[key] ?? 0,
    max: meta.max,
  }));
  const suggestions = (latest?.suggestions ?? []) as Array<{
    issue: string;
    fix: string;
    priority: string;
  }>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Resume ATS check</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        PDF only, up to 5 MB. Scoring is tuned to the target role in your profile.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-6 text-center">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Analysing…" : latest ? "Re-upload resume" : "Upload resume (PDF)"}
        </button>
        {latest ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Last checked: {latest.file_name} · {new Date(latest.created_at).toLocaleString()}
          </p>
        ) : null}
      </div>

      {!latest ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No resume checked yet. Upload a text-based PDF to see your ATS score and fixes.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
            <ScoreRing score={latest.ats_score} label="ATS score" />
            {previous ? (
              <p className="text-xs text-muted-foreground">
                {latest.ats_score - previous.ats_score >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(latest.ats_score - previous.ats_score)} vs previous upload
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Score breakdown
            </h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="factor" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="max" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scored" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <section className="lg:col-span-2">
            <h2 className="text-lg font-semibold">Prioritised fixes</h2>
            <ol className="mt-3 space-y-3">
              {suggestions.map((s, i) => (
                <li key={i} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium">
                    {i + 1}. {s.issue}
                    <span className="ml-2 text-xs uppercase text-muted-foreground">
                      {s.priority} priority
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.fix}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}

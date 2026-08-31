import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { clearGuideChat, getGuideHistory, sendGuideMessage } from "@/lib/guide.functions";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "AI Guide — PlacementAI" },
      {
        name: "description",
        content: "Ask the AI Guide about interview prep, resumes, study plans and career choices.",
      },
      { property: "og:title", content: "AI Guide — PlacementAI" },
      {
        property: "og:description",
        content: "Ask the AI Guide about interview prep, resumes, study plans and career choices.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Guide />
    </AppShell>
  ),
});

function Guide() {
  const queryClient = useQueryClient();
  const loadHistory = useServerFn(getGuideHistory);
  const send = useServerFn(sendGuideMessage);
  const clear = useServerFn(clearGuideChat);
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history } = useQuery({
    queryKey: ["guide-history"],
    queryFn: () => loadHistory(),
  });

  const mutation = useMutation({
    mutationFn: (text: string) => send({ data: { message: text } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guide-history"] }),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "The AI Guide is unavailable"),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, mutation.isPending]);

  const messages = history ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Guide</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Knows your scores, skill gaps and roadmap. Ask what to study next.
          </p>
        </div>
        <button
          onClick={async () => {
            await clear();
            queryClient.invalidateQueries({ queryKey: ["guide-history"] });
          }}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Clear chat
        </button>
      </div>

      <div className="mt-6 min-h-[320px] space-y-3 rounded-lg border border-border bg-card p-4">
        {messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No messages yet. Try: &ldquo;What should I study first for an SDE role?&rdquo;
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
        {mutation.isPending ? (
          <p className="text-sm text-muted-foreground">Thinking…</p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const text = message.trim();
          if (text.length === 0) return;
          setMessage("");
          mutation.mutate(text);
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          placeholder="Ask about prep, resumes or careers…"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

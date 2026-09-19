import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getTourState, setTourState } from "@/lib/tour.functions";
import { Lightbulb, X } from "lucide-react";

const BULB_HIDDEN_KEY = "placementai.tour.bulbHidden";

export function TourLauncher() {
  const navigate = useNavigate();
  const load = useServerFn(getTourState);
  const save = useServerFn(setTourState);
  const { data } = useQuery({ queryKey: ["tour-state"], queryFn: () => load() });
  const [mode, setMode] = useState<"none" | "dialog" | "bulb">("none");

  useEffect(() => {
    if (!data || data.tour_completed) {
      setMode("none");
      return;
    }
    if (!data.tour_prompted) {
      setMode("dialog");
      return;
    }
    const hidden =
      typeof window !== "undefined" && window.localStorage.getItem(BULB_HIDDEN_KEY) === "1";
    setMode(hidden ? "none" : "bulb");
  }, [data]);

  if (mode === "none") return null;

  if (mode === "bulb") {
    return (
      <button
        type="button"
        aria-label="Open the quick tour"
        onClick={() => setMode("dialog")}
        className="fixed bottom-5 right-5 z-40 rounded-full border border-border bg-card p-3 opacity-40 shadow-lg transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        <Lightbulb className="h-5 w-5 text-accent" />
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="New here? Want a quick tour?"
      className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100vw-2.5rem))] rounded-lg border border-primary/40 bg-card p-4 shadow-xl"
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold">New here? Want a quick tour?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Let us walk you through what each section does — 30 seconds, plain language, no
            jargon. Sound good?
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            void save({ data: { tour_prompted: true } });
            setMode("bulb");
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={async () => {
            if (typeof window !== "undefined") window.localStorage.removeItem(BULB_HIDDEN_KEY);
            await save({ data: { tour_prompted: true } });
            navigate({ to: "/tour" });
          }}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Yes, please
        </button>
        <button
          type="button"
          onClick={() => {
            const wasFirstTime = data ? !data.tour_prompted : true;
            void save({ data: { tour_prompted: true } });
            if (wasFirstTime) {
              setMode("bulb");
            } else {
              if (typeof window !== "undefined")
                window.localStorage.setItem(BULB_HIDDEN_KEY, "1");
              setMode("none");
            }
          }}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          No, thanks
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getTourState, setTourState } from "@/lib/tour.functions";
import { useI18n } from "@/i18n/I18nProvider";
import { Lightbulb, X } from "lucide-react";

export function TourLauncher() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const load = useServerFn(getTourState);
  const save = useServerFn(setTourState);
  const { data } = useQuery({ queryKey: ["tour-state"], queryFn: () => load() });
  const [mode, setMode] = useState<"none" | "dialog" | "bulb">("none");
  const [prompted, setPrompted] = useState(false);

  useEffect(() => {
    if (!data) return;
    if (!data.tour_prompted) {
      setMode("dialog");
      return;
    }
    setPrompted(true);
    setMode("bulb");
  }, [data]);


  if (mode === "none") return null;

  if (mode === "bulb") {
    return (
      <button
        type="button"
        aria-label={t("launcher.openTour")}
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
      aria-label={t("launcher.title")}
      className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100vw-2.5rem))] rounded-lg border border-primary/40 bg-card p-4 shadow-xl"
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold">{t("launcher.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("launcher.body")}
          </p>
        </div>
        <button
          type="button"
          aria-label={t("launcher.close")}
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
            await save({ data: { tour_prompted: true } });
            navigate({ to: "/tour" });
          }}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          {t("launcher.yes")}
        </button>
        <button
          type="button"
          onClick={() => {
            void save({ data: { tour_prompted: true } });
            if (!prompted) setPrompted(true);
            setMode("bulb");
          }}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("launcher.no")}
        </button>
      </div>
    </div>
  );
}

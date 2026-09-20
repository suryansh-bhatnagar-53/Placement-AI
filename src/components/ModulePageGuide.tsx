import { type ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import { MODULE_GUIDES, type ModuleGuideKey } from "@/lib/module-guide-content";

export function ModulePageGuide({
  moduleKey,
  children,
}: {
  moduleKey: ModuleGuideKey;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const guide = MODULE_GUIDES[moduleKey];
  const isFade = guide.behavior === "fade";

  return (
    <div
      className={`module-guide-layout ${open ? "is-open" : ""} ${isFade ? "is-fade" : "is-shift"}`}
    >
      <div
        className="module-guide-content"
        aria-hidden={isFade && open ? true : undefined}
        {...(isFade && open ? { inert: true } : {})}
      >
        {children}
      </div>

      <div className="module-guide-icon group">
        <button
          type="button"
          aria-label={open ? "Close module guide" : "Open module guide"}
          aria-expanded={open}
          aria-controls={`module-guide-${moduleKey}`}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground opacity-60 shadow-sm transition-[color,opacity,border-color] duration-200 hover:border-primary hover:text-primary hover:opacity-100 focus-visible:opacity-100"
        >
          <FileQuestion className="h-4 w-4" />
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full mt-2 w-max max-w-52 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          Need help with this module?
        </span>
      </div>

      <aside
        id={`module-guide-${moduleKey}`}
        aria-label={`${guide.title} guide`}
        aria-hidden={!open}
        className="module-guide-panel"
      >
        <div className="module-guide-panel-inner">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-border pb-5">
            <button
              type="button"
              aria-label="Close module guide"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase text-primary">Module guide</p>
              <h2 className="mt-1 text-lg font-semibold">{guide.title}</h2>
            </div>
          </div>

          <div className="space-y-7 py-6">
            <GuideSection title="What this is for">
              <p>{guide.purpose}</p>
            </GuideSection>
            <GuideSection title="How to use it">
              <ol className="space-y-3">
                {guide.steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </GuideSection>
            <GuideSection title="Why it helps you">
              <ul className="space-y-3">
                {guide.benefits.map((benefit) => (
                  <li key={benefit} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </GuideSection>
          </div>
        </div>
      </aside>

      {!open ? (
        <button
          type="button"
          aria-label="Open module guide"
          onClick={() => setOpen(true)}
          className="module-guide-edge-toggle"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
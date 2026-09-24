import { archetypeMeaning } from "@/lib/identity-badge";

export type Identity = {
  archetype: string;
  adaptability: number;
  resilience: number;
  focus: number;
  complete: boolean;
};

const BARS = [
  { key: "adaptability", label: "Adaptability" },
  { key: "resilience", label: "Resilience" },
  { key: "focus", label: "Focus & Strategy" },
] as const;

export function StatBars({ identity, compact = false }: { identity: Identity; compact?: boolean }) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2.5"}>
      {BARS.map((bar) => {
        const value = identity[bar.key];
        return (
          <div key={bar.key}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{bar.label}</span>
              <span>{value}</span>
            </div>
            <div
              className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary"
              role="img"
              aria-label={`${bar.label}: ${value} out of 100`}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function IdentityCard({
  identity,
  photo,
  initials,
  name,
  nameAddon,
}: {
  identity: Identity;
  photo: string | null;
  initials: string;
  name: string;
  nameAddon?: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-lg font-semibold">
            {photo ? (
              <img src={photo} alt="Your profile photo" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-base font-semibold">{name || "Your profile"}{nameAddon}</p>
            <span className="mt-1 inline-flex rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
              {identity.archetype}
            </span>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              {archetypeMeaning(identity.archetype)}
            </p>
          </div>
        </div>

        <div className="w-full sm:max-w-xs sm:flex-1">
          <StatBars identity={identity} />
          <p className="mt-3 text-xs text-muted-foreground">
            {identity.complete
              ? "Generated during your onboarding quiz."
              : "Complete a quick quiz to unlock your real profile badge."}
          </p>
        </div>
      </div>
    </section>
  );
}

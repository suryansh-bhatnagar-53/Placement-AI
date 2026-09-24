import { CURIOUS_MIND, TRAIT_INFO, TRAITS, type Trait } from "@/lib/badge-interview-content";

const COLOR: Record<Trait | "curious", string> = {
  adaptability: "text-badge-adaptability",
  resilience: "text-badge-resilience",
  leadership: "text-badge-leadership",
  collaboration: "text-badge-collaboration",
  critical: "text-badge-critical",
  curious: "text-badge-curious",
};

// Each badge: distinct outer shape + symbol, drawn in currentColor.
function Shape({ kind }: { kind: Trait | "curious" }) {
  switch (kind) {
    case "adaptability": // hexagon + pivot arrows
      return (
        <>
          <path d="M32 3 57 17.5v29L32 61 7 46.5v-29Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="3" />
          <path d="M20 28a13 13 0 0 1 22-6m2 14a13 13 0 0 1-22 6" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="m42 14 1 8-8 1M22 50l-1-8 8-1" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "resilience": // shield + rising flame
      return (
        <>
          <path d="M32 4 55 12v18c0 15-10 25-23 30C19 55 9 45 9 30V12Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="3" />
          <path d="M32 46c-7 0-11-5-11-10 0-6 5-9 6-15 3 3 4 6 4 9 2-2 3-5 3-8 5 4 9 9 9 14 0 5-4 10-11 10Z" fill="currentColor" />
        </>
      );
    case "leadership": // circle + compass needle
      return (
        <>
          <circle cx="32" cy="32" r="28" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="3" />
          <circle cx="32" cy="32" r="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
          <path d="m32 12 7 20-7 20-7-20Z" fill="currentColor" />
          <circle cx="32" cy="32" r="3" className="fill-background" />
        </>
      );
    case "collaboration": // rounded square + interlocked rings
      return (
        <>
          <rect x="5" y="5" width="54" height="54" rx="14" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="3" />
          <circle cx="25" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="39" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="4" />
        </>
      );
    case "critical": // diamond + faceted gem
      return (
        <>
          <path d="M32 2 62 32 32 62 2 32Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="3" />
          <path d="M20 26h24l-12 18Z M20 26l6-7h12l6 7M26 19l6 7 6-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </>
      );
    case "curious": // star + eye/spark
      return (
        <>
          <path d="m32 2 7.5 14.5L56 14l-5 15.5L62 42l-16 2-8 16-6-14-6 14-8-16-16-2 11-12.5L8 14l16.5 2.5Z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M18 33c8-11 20-11 28 0-8 11-20 11-28 0Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="32" cy="33" r="4.5" fill="currentColor" />
        </>
      );
  }
}

export function BadgeLogo({
  kind,
  earned = true,
  size = 56,
  title,
}: {
  kind: Trait | "curious";
  earned?: boolean;
  size?: number;
  title?: string;
}) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} title={title}>
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        role="img"
        aria-label={title}
        className={earned ? COLOR[kind] : "text-muted-foreground opacity-35 grayscale"}
      >
        <Shape kind={kind} />
      </svg>
      {!earned ? (
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">?</span>
      ) : null}
    </span>
  );
}

export function BadgeShelf({ earned, highlight }: { earned: Trait[]; highlight?: Trait | null }) {
  return (
    <ul className="grid grid-cols-5 gap-2 sm:gap-4">
      {TRAITS.map((t) => {
        const has = earned.includes(t);
        const info = TRAIT_INFO[t];
        return (
          <li
            key={t}
            className={`flex flex-col items-center rounded-lg p-2 text-center ${highlight === t ? "ring-2 ring-primary" : ""}`}
          >
            <BadgeLogo kind={t} earned={has} title={has ? `${info.label} — ${info.meaning}` : `${info.label} — not earned yet`} />
            <span className={`mt-1.5 text-[11px] leading-tight sm:text-xs ${has ? "text-foreground" : "text-muted-foreground"}`}>
              {info.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function CuriousMindMark({ unlocked, size = 22 }: { unlocked: boolean; size?: number }) {
  if (!unlocked) return null;
  return (
    <span className="group/cm relative inline-flex align-middle" tabIndex={0}>
      <BadgeLogo kind="curious" size={size} title={`${CURIOUS_MIND.label} — ${CURIOUS_MIND.meaning}`} />
    </span>
  );
}

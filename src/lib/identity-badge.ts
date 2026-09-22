/**
 * Profile Series 2/3 — shared helpers that map onboarding answers onto the
 * profile view. Pure functions, no AI, no extra storage: every value here is
 * derived from the single `profiles` row written by onboarding.
 */

export const DEFAULT_ARCHETYPE = "The Explorer";

export const ARCHETYPE_MEANINGS: Record<string, string> = {
  "The Explorer": "Still finding your style — and that's a perfectly good place to start.",
  "The Fast Starter": "You jump in first and figure the rest out while moving.",
  "The Quiet Operator": "You keep things on track without making noise about it.",
  "The Hands-On Hustler": "You learn fastest by building, breaking and rebuilding.",
  "The Steady Climber": "You keep going at a pace that actually lasts.",
  "The Team Anchor": "People lean on you when a group needs holding together.",
  "The Strategist": "You plan the route before anyone takes the first step.",
};

export function archetypeMeaning(archetype: string | null | undefined): string {
  const key = archetype || DEFAULT_ARCHETYPE;
  return ARCHETYPE_MEANINGS[key] ?? "Your own way of working through tough problems.";
}

export const ROLE_LABELS: Record<string, string> = {
  SE: "Software Engineer",
  ML: "ML Engineer",
  DA: "Data Analyst",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  C: "C",
  CPP: "C++",
  PYTHON: "Python",
  JAVA: "Java",
};

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code;
}

/**
 * Turns "3rd" year of study into a best-guess finishing year. Assumes a
 * four-year course; the value is always editable in the profile.
 */
export function estimateGraduationYear(
  yearOfStudy: string | null | undefined,
  referenceISO?: string | null,
): string {
  if (!yearOfStudy) return "";
  const match = /^(\d)/.exec(yearOfStudy.trim());
  if (!match) return "";
  const current = Number(match[1]);
  const base = referenceISO ? new Date(referenceISO) : new Date();
  const baseYear = Number.isNaN(base.getFullYear()) ? new Date().getFullYear() : base.getFullYear();
  const remaining = Math.max(0, 4 - current);
  return String(baseYear + remaining);
}

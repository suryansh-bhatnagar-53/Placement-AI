// Deterministic local ATS heuristic engine. Zero external calls.
export type AtsBreakdown = {
  contact: number;
  structure: number;
  keywords: number;
  action_verbs: number;
  quantifiable: number;
  formatting: number;
};

export type AtsSuggestion = { issue: string; fix: string; priority: "high" | "medium" | "low" };

export const ROLE_KEYWORDS: Record<string, string[]> = {
  SE: [
    "data structures", "algorithms", "java", "python", "c++", "javascript", "react",
    "rest api", "sql", "git", "docker", "system design", "unit test", "oop", "microservices",
    "node", "backend", "frontend", "debug", "agile",
  ],
  ML: [
    "python", "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn",
    "pandas", "numpy", "model", "regression", "classification", "nlp", "computer vision",
    "feature engineering", "data pipeline", "sql", "statistics", "jupyter", "mlops", "evaluation",
  ],
  DA: [
    "sql", "excel", "power bi", "tableau", "python", "pandas", "dashboard", "etl",
    "data cleaning", "visualization", "statistics", "a/b test", "kpi", "reporting",
    "data warehouse", "analytics", "regression", "forecasting", "stakeholder", "metrics",
  ],
};

const ACTION_VERBS = [
  "built", "designed", "developed", "implemented", "led", "optimized", "optimised", "automated",
  "reduced", "improved", "created", "launched", "migrated", "deployed", "analyzed", "analysed",
  "delivered", "scaled", "refactored", "mentored",
];

const SECTIONS = [
  { key: "education", patterns: [/education/i, /b\.?tech/i, /bachelor/i, /university/i] },
  { key: "experience", patterns: [/experience/i, /internship/i, /employment/i] },
  { key: "skills", patterns: [/skills/i, /technolog/i, /tech stack/i] },
  { key: "projects", patterns: [/projects?/i] },
];

export function analyzeResume(text: string, role: string) {
  const lower = text.toLowerCase();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // 1. Contact (10)
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
  const hasPhone = /(\+?\d[\d\s-]{7,}\d)/.test(text);
  const hasLink = /(linkedin\.com|github\.com)/i.test(text);
  const contactHits = [hasEmail, hasPhone, hasLink].filter(Boolean).length;
  const contact = Math.round((contactHits / 3) * 10);

  // 2. Structure (20)
  const missingSections: string[] = [];
  let sectionHits = 0;
  for (const section of SECTIONS) {
    if (section.patterns.some((p) => p.test(text))) sectionHits++;
    else missingSections.push(section.key);
  }
  const structure = Math.round((sectionHits / SECTIONS.length) * 20);

  // 3. Keyword match vs target role (40)
  const keywords = ROLE_KEYWORDS[role] ?? ROLE_KEYWORDS["SE"]!;
  const matched = keywords.filter((k) => lower.includes(k));
  const missingKeywords = keywords.filter((k) => !lower.includes(k)).slice(0, 8);
  const keywordScore = Math.round(Math.min(1, matched.length / (keywords.length * 0.5)) * 40);

  // 4. Action verbs (10)
  const verbHits = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(text)).length;
  const actionVerbs = Math.round(Math.min(1, verbHits / 6) * 10);

  // 5. Quantifiable achievements (10)
  const quantMatches = text.match(/(\d+(\.\d+)?\s?%|\$\s?\d+|\b\d{2,}\b\s?(users|hours|requests|records|students|ms|x)\b)/gi);
  const quantCount = quantMatches ? quantMatches.length : 0;
  const quantifiable = Math.round(Math.min(1, quantCount / 4) * 10);

  // 6. Formatting friendliness (10) — line-length variance heuristic
  const lengths = lines.map((l) => l.length);
  const mean = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
  const variance =
    lengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / Math.max(1, lengths.length);
  const stdDev = Math.sqrt(variance);
  const tooLong = lines.filter((l) => l.length > 140).length;
  let formatting = 10;
  if (stdDev > 45) formatting -= 4;
  if (tooLong > 3) formatting -= 3;
  if (lines.length < 15) formatting -= 3;
  formatting = Math.max(0, formatting);

  const breakdown: AtsBreakdown = {
    contact,
    structure,
    keywords: keywordScore,
    action_verbs: actionVerbs,
    quantifiable,
    formatting,
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const suggestions: AtsSuggestion[] = [];
  if (contact < 10) {
    suggestions.push({
      issue: `Contact block is incomplete (${!hasEmail ? "email missing; " : ""}${!hasPhone ? "phone missing; " : ""}${!hasLink ? "no LinkedIn or GitHub link" : ""}`.replace(/; $/, "") + ")",
      fix: "Put email, phone and a GitHub or LinkedIn URL as plain text on the first two lines of the resume.",
      priority: "high",
    });
  }
  if (missingSections.length > 0) {
    suggestions.push({
      issue: `Missing standard section headings: ${missingSections.join(", ")}.`,
      fix: "Add clearly titled sections (Education, Experience, Skills, Projects) so parsers can segment the document.",
      priority: "high",
    });
  }
  if (keywordScore < 40) {
    suggestions.push({
      issue: `Only ${matched.length} of ${keywords.length} target-role keywords appear.`,
      fix: `Naturally work in the terms you actually know from: ${missingKeywords.join(", ")}.`,
      priority: "high",
    });
  }
  if (actionVerbs < 10) {
    suggestions.push({
      issue: "Bullet points do not start with strong action verbs.",
      fix: "Rewrite bullets to begin with verbs like Built, Designed, Optimised, Automated, Reduced.",
      priority: "medium",
    });
  }
  if (quantifiable < 10) {
    suggestions.push({
      issue: "Few or no quantified results.",
      fix: "Add numbers to at least four bullets, e.g. 'cut query time by 40%' or 'served 1200 users'.",
      priority: "medium",
    });
  }
  if (formatting < 10) {
    suggestions.push({
      issue: "Layout may confuse ATS parsers (very uneven or very long lines, or too little content).",
      fix: "Use a single-column layout, avoid tables and text boxes, and keep bullets under two lines.",
      priority: "low",
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      issue: "No structural problems detected.",
      fix: "Tailor the top third of the resume to each specific job description before applying.",
      priority: "low",
    });
  }

  return { score, breakdown, suggestions, matchedKeywords: matched, missingKeywords };
}

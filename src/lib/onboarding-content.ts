export type Stats = { adaptability: number; resilience: number; focus: number };

export const NEUTRAL_STATS: Stats = { adaptability: 50, resilience: 50, focus: 50 };

export type Choice = { key: string; label: string; blurb?: string };

export type PersonalityQuestion = {
  id: "q1" | "q2" | "q3" | "q4" | "q5";
  prompt: string;
  hint: string;
  choices: Choice[];
};

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: "q1",
    prompt: "Group project deadline is tomorrow and a teammate ghosts. What do you do?",
    hint: "No wrong answers — go with your gut.",
    choices: [
      { key: "a", label: "I take charge and finish their part myself." },
      { key: "b", label: "I quietly reassign tasks and keep the team moving." },
      { key: "c", label: "I flag it to the mentor right away." },
    ],
  },
  {
    id: "q2",
    prompt: "You need to learn something brand new in 24 hours. Where do you start?",
    hint: "Be honest, we all have a favourite shortcut.",
    choices: [
      { key: "a", label: "I jump in and try it hands-on." },
      { key: "b", label: "I find a fast video breakdown." },
      { key: "c", label: "I read the proper guides first." },
    ],
  },
  {
    id: "q3",
    prompt: "What keeps you going on a big task?",
    hint: "Pick the one that feels most like you.",
    choices: [
      { key: "a", label: "Cracking a genuinely tough problem." },
      { key: "b", label: "Being recognised for my work." },
      { key: "c", label: "Making my team succeed." },
    ],
  },
  {
    id: "q4",
    prompt: "In a team, which seat do you naturally take?",
    hint: "Almost there!",
    choices: [
      { key: "a", label: "The Strategist — plans the approach." },
      { key: "b", label: "The Builder — executes and creates." },
      { key: "c", label: "The Polisher — refines and perfects." },
      { key: "d", label: "The Presenter — communicates and pitches." },
    ],
  },
  {
    id: "q5",
    prompt: "You get tough feedback on something you worked hard on. Your first move?",
    hint: "Last one — then we build your character sheet.",
    choices: [
      { key: "a", label: "I iterate and improve straight away." },
      { key: "b", label: "I ask questions until I fully get it." },
      { key: "c", label: "I explain my choices respectfully." },
    ],
  },
];

export type Answers = Partial<Record<PersonalityQuestion["id"], string>>;

const POINTS: Record<string, Record<string, Partial<Stats>>> = {
  q1: {
    a: { adaptability: 18, focus: 8 },
    b: { adaptability: 22, focus: 12 },
    c: { adaptability: 10, focus: 16 },
  },
  q2: {
    a: { resilience: 22, adaptability: 8 },
    b: { resilience: 16, adaptability: 10 },
    c: { resilience: 12, focus: 10 },
  },
  q3: {
    a: { focus: 20 },
    b: { focus: 12 },
    c: { focus: 14 },
  },
  q4: {
    a: { focus: 20 },
    b: { focus: 14 },
    c: { focus: 16 },
    d: { focus: 12 },
  },
  q5: {
    a: { adaptability: 20, resilience: 18 },
    b: { adaptability: 14, resilience: 22 },
    c: { adaptability: 8, resilience: 14 },
  },
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Stats start neutral-ish and climb as answers come in. */
export function computeStats(answers: Answers): Stats {
  const base: Stats = { adaptability: 30, resilience: 30, focus: 30 };
  for (const [qid, key] of Object.entries(answers)) {
    const delta = POINTS[qid]?.[key as string];
    if (!delta) continue;
    base.adaptability += delta.adaptability ?? 0;
    base.resilience += delta.resilience ?? 0;
    base.focus += delta.focus ?? 0;
  }
  return {
    adaptability: clamp(base.adaptability),
    resilience: clamp(base.resilience),
    focus: clamp(base.focus),
  };
}

export function computeArchetype(answers: Answers): string {
  const count = Object.keys(answers).length;
  if (count === 0) return "The Explorer";
  const stats = computeStats(answers);
  const top = (["adaptability", "resilience", "focus"] as const).reduce((a, b) =>
    stats[a] >= stats[b] ? a : b,
  );
  if (top === "adaptability") {
    return answers.q1 === "a" ? "The Fast Starter" : "The Quiet Operator";
  }
  if (top === "resilience") {
    return answers.q2 === "a" ? "The Hands-On Hustler" : "The Steady Climber";
  }
  return answers.q3 === "c" ? "The Team Anchor" : "The Strategist";
}

export const ROLES = [
  { value: "SE", title: "Software Engineer", body: "You love building things that work." },
  { value: "ML", title: "ML Engineer", body: "You love teaching machines to think." },
  { value: "DA", title: "Data Analyst", body: "You love finding stories hidden in numbers." },
] as const;

export const LANGUAGES = [
  { value: "C", label: "C", body: "Old school, close to the metal." },
  { value: "CPP", label: "C++", body: "Power tools, sharp edges." },
  { value: "PYTHON", label: "Python", body: "The friendly giant of programming." },
  { value: "JAVA", label: "Java", body: "Dependable, everywhere, forever." },
] as const;

export const YEARS = ["1st", "2nd", "3rd", "4th", "5th", "Other"] as const;
export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;

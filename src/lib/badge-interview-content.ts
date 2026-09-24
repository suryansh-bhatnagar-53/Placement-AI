// Static content + deterministic scoring for the Behavioral Badge Interview.
// No AI calls: MCQ option→trait maps, weighted arrangement matching, keyword scan.

export const TRAITS = ["adaptability", "resilience", "leadership", "collaboration", "critical"] as const;
export type Trait = (typeof TRAITS)[number];
export type TraitScores = Record<Trait, number>;

export const TRAIT_INFO: Record<Trait, { label: string; meaning: string; quote: string; author: string }> = {
  adaptability: {
    label: "Adaptability",
    meaning: "I bend, I don't break.",
    quote: "It is not the strongest that survive, but the ones most responsive to change.",
    author: "Leon C. Megginson",
  },
  resilience: {
    label: "Resilience",
    meaning: "Pressure makes me stronger.",
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  leadership: {
    label: "Leadership",
    meaning: "I steer the team forward.",
    quote: "A leader is one who knows the way, goes the way, and shows the way.",
    author: "John C. Maxwell",
  },
  collaboration: {
    label: "Collaboration",
    meaning: "Stronger together.",
    quote: "Alone we can do so little; together we can do so much.",
    author: "Helen Keller",
  },
  critical: {
    label: "Critical Thinking",
    meaning: "I see the pattern in the chaos.",
    quote: "The important thing is not to stop questioning.",
    author: "Albert Einstein",
  },
};

export const CURIOUS_MIND = {
  label: "Curious Mind",
  meaning: "You explore every path — the mark of a true learner.",
};

type Pts = Partial<TraitScores>;

// ---------- Round 1: MCQ ----------
export type Mcq = { text: string; options: { text: string; pts: Pts }[] };

export const MCQS: Mcq[] = [
  {
    text: "Two days before a college project demo, your teammate says the main feature they built doesn't work. What do you do?",
    options: [
      { text: "Call a quick team huddle and split the remaining work so the demo still happens.", pts: { leadership: 2, collaboration: 1 } },
      { text: "Look at what does work and reshape the demo around it.", pts: { adaptability: 2, critical: 1 } },
      { text: "Sit with the teammate and fix it together, step by step.", pts: { collaboration: 2, resilience: 1 } },
      { text: "Tell the teacher the demo will probably fail.", pts: {} },
    ],
  },
  {
    text: "You get rejected after the final round of an interview you really wanted.",
    options: [
      { text: "Ask for feedback and note what to work on next time.", pts: { resilience: 2, critical: 1 } },
      { text: "Take a day off, then apply to three similar roles.", pts: { resilience: 2, adaptability: 1 } },
      { text: "Decide that kind of company just isn't for you.", pts: {} },
      { text: "Talk it over with friends who've been through it.", pts: { collaboration: 1, resilience: 1 } },
    ],
  },
  {
    text: "Your manager changes the project's direction halfway through the month.",
    options: [
      { text: "Ask what triggered the change, then re-plan your tasks.", pts: { adaptability: 2, critical: 1 } },
      { text: "Keep going the old way until someone insists.", pts: {} },
      { text: "Help the team re-plan together so nobody is lost.", pts: { leadership: 1, collaboration: 2 } },
      { text: "Quickly salvage whatever old work still fits.", pts: { adaptability: 2 } },
    ],
  },
  {
    text: "In a group discussion, two members keep arguing and nothing moves forward.",
    options: [
      { text: "Step in, summarise both views, and propose a way to decide.", pts: { leadership: 2, critical: 1 } },
      { text: "Invite the quiet members to share their take.", pts: { collaboration: 2 } },
      { text: "List the pros and cons of each idea on the board.", pts: { critical: 2, collaboration: 1 } },
      { text: "Stay quiet and wait for it to end.", pts: {} },
    ],
  },
  {
    text: "You find a mistake in your own work right after submitting it.",
    options: [
      { text: "Tell the reviewer immediately and send a fix.", pts: { resilience: 1, leadership: 1, critical: 1 } },
      { text: "Hope nobody notices.", pts: {} },
      { text: "Figure out why it happened so it doesn't repeat.", pts: { critical: 2, resilience: 1 } },
      { text: "Ask a colleague to double-check before the next submission.", pts: { collaboration: 2 } },
    ],
  },
  {
    text: "You're asked to learn a tool you've never used, in one week.",
    options: [
      { text: "Pick the few features you'll actually need and learn those first.", pts: { critical: 2, adaptability: 1 } },
      { text: "Dive in, build something small, and learn as you go.", pts: { adaptability: 2, resilience: 1 } },
      { text: "Find someone who knows it and pair with them.", pts: { collaboration: 2 } },
      { text: "Say it's not possible in a week.", pts: {} },
    ],
  },
  {
    text: "Nobody volunteers to lead a new club event.",
    options: [
      { text: "Volunteer and set up a simple plan with clear roles.", pts: { leadership: 3 } },
      { text: "Offer to co-lead with someone else.", pts: { leadership: 1, collaboration: 2 } },
      { text: "Suggest scaling the event down to what's doable.", pts: { critical: 2, adaptability: 1 } },
      { text: "Let the event get cancelled.", pts: {} },
    ],
  },
  {
    text: "You've been stuck on a hard problem for three hours.",
    options: [
      { text: "Take a short break, then come back with fresh eyes.", pts: { resilience: 2 } },
      { text: "Break the problem into smaller parts and test each.", pts: { critical: 2, resilience: 1 } },
      { text: "Try a completely different approach.", pts: { adaptability: 2 } },
      { text: "Give up and move to something else for good.", pts: {} },
    ],
  },
  {
    text: "A new member joins your team and seems lost.",
    options: [
      { text: "Walk them through how the team works.", pts: { collaboration: 2, leadership: 1 } },
      { text: "Give them a small task they can own right away.", pts: { leadership: 2 } },
      { text: "Share your notes and point them to good resources.", pts: { collaboration: 2 } },
      { text: "Let them figure it out on their own.", pts: {} },
    ],
  },
  {
    text: "Your team has to choose between a fast but risky plan and a slow but safe one.",
    options: [
      { text: "Compare the risks and time for both before choosing.", pts: { critical: 3 } },
      { text: "Make the call yourself and own the outcome.", pts: { leadership: 2, resilience: 1 } },
      { text: "Start safe and keep a backup ready to switch.", pts: { adaptability: 2, critical: 1 } },
      { text: "Pick whichever sounds more exciting.", pts: {} },
    ],
  },
];

// ---------- Round 2: Arrangement ----------
export type Arrange = {
  text: string;
  steps: { id: string; text: string }[];
  orderings: { order: string[]; pts: Pts }[];
};

export const ARRANGES: Arrange[] = [
  {
    text: "The college fest website crashes one hour before registrations open.",
    steps: [
      { id: "a", text: "Tell the team and assign who checks what" },
      { id: "b", text: "Find out what exactly broke" },
      { id: "c", text: "Put up a backup form so people can still register" },
      { id: "d", text: "Fix the root problem" },
      { id: "e", text: "Share a short note on what went wrong" },
    ],
    orderings: [
      { order: ["a", "b", "d", "c", "e"], pts: { leadership: 3, collaboration: 1 } },
      { order: ["b", "d", "a", "c", "e"], pts: { critical: 3, resilience: 1 } },
      { order: ["c", "a", "b", "d", "e"], pts: { adaptability: 3, collaboration: 1 } },
    ],
  },
  {
    text: "You're given a group assignment with people you've never worked with.",
    steps: [
      { id: "a", text: "Get to know everyone's strengths" },
      { id: "b", text: "Agree on a plan and deadlines" },
      { id: "c", text: "Split the tasks" },
      { id: "d", text: "Check in on progress regularly" },
    ],
    orderings: [
      { order: ["a", "c", "b", "d"], pts: { collaboration: 3 } },
      { order: ["b", "c", "d", "a"], pts: { leadership: 3 } },
      { order: ["a", "b", "c", "d"], pts: { collaboration: 2, critical: 2 } },
    ],
  },
  {
    text: "You fail a mid-semester exam badly.",
    steps: [
      { id: "a", text: "Accept it and let the disappointment pass" },
      { id: "b", text: "Review which answers went wrong and why" },
      { id: "c", text: "Change how you study" },
      { id: "d", text: "Ask a friend or teacher for help" },
      { id: "e", text: "Practise with old papers" },
    ],
    orderings: [
      { order: ["a", "b", "c", "e", "d"], pts: { resilience: 3, critical: 1 } },
      { order: ["b", "c", "e", "a", "d"], pts: { critical: 3 } },
      { order: ["a", "d", "b", "c", "e"], pts: { collaboration: 2, resilience: 2 } },
      { order: ["a", "c", "b", "e", "d"], pts: { adaptability: 3 } },
    ],
  },
  {
    text: "A client suddenly asks for a big change a day before delivery.",
    steps: [
      { id: "a", text: "Understand exactly what they want and why" },
      { id: "b", text: "Estimate how much time the change needs" },
      { id: "c", text: "Discuss options with your team" },
      { id: "d", text: "Agree on a new timeline with the client" },
    ],
    orderings: [
      { order: ["a", "b", "c", "d"], pts: { critical: 3 } },
      { order: ["a", "c", "b", "d"], pts: { collaboration: 3 } },
      { order: ["a", "d", "b", "c"], pts: { adaptability: 2, leadership: 2 } },
    ],
  },
  {
    text: "Your team misses an important deadline.",
    steps: [
      { id: "a", text: "Own the delay and inform the people affected" },
      { id: "b", text: "Figure out what caused it" },
      { id: "c", text: "Set a realistic new date" },
      { id: "d", text: "Encourage the team to keep going" },
      { id: "e", text: "Change the process so it doesn't repeat" },
    ],
    orderings: [
      { order: ["a", "c", "d", "b", "e"], pts: { leadership: 3, resilience: 1 } },
      { order: ["b", "e", "c", "a", "d"], pts: { critical: 3 } },
      { order: ["d", "a", "b", "c", "e"], pts: { resilience: 3, collaboration: 1 } },
      { order: ["a", "b", "c", "e", "d"], pts: { adaptability: 2, critical: 1 } },
    ],
  },
];

// ---------- Round 3: Thinking ----------
export const THINKING: string[] = [
  "Describe a time a plan you made fell apart. What did you do next?",
  "You're leading a team where one member keeps missing deadlines. How would you handle it?",
  "Your team strongly disagrees with your idea, but you believe it's right. What do you do?",
  "You have three important tasks due tomorrow and time for only two. How do you decide?",
  "Tell us about something you failed at and what it taught you.",
];

export const THINK_MIN_WORDS = 20;
export const THINK_SOFT_CAP = 200;
export const THINK_MAX_WORDS = 250;

export const KEYWORDS: Record<Trait, string[]> = {
  adaptability: ["adapt", "adjust", "pivot", "reassess", "change", "flexib", "switch", "new approach", "alternative", "backup", "plan b", "rethink"],
  resilience: ["kept trying", "keep trying", "learned from", "learnt from", "didn't give up", "did not give up", "persist", "bounce back", "calm", "patience", "patient", "tried again", "setback", "stay positive", "pressure"],
  leadership: ["stepped up", "step up", "led ", "lead ", "took charge", "take charge", "responsib", "decided", "initiative", "delegat", "guide", "own it", "ownership", "accountab"],
  collaboration: ["listen", "we decided", "together", "team", "discuss", "feedback", "support", "help", "communicat", "understand their", "compromise", "everyone"],
  critical: ["weigh", "trade-off", "tradeoff", "priorit", "analy", "pros and cons", "evidence", "root cause", "impact", "option", "data", "because", "risk", "compare"],
};

export const PER_ANSWER_CAP = 3;

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ---------- Scoring ----------
const SKIP_PENALTY = 1; // subtracted from every trait for each skipped item

function empty(): TraitScores {
  return { adaptability: 0, resilience: 0, leadership: 0, collaboration: 0, critical: 0 };
}
function add(target: TraitScores, pts: Pts, factor = 1) {
  for (const t of TRAITS) target[t] += (pts[t] ?? 0) * factor;
}

// Fraction of step pairs placed in the same relative order (Kendall-style agreement, 0..1).
export function orderSimilarity(user: string[], ideal: string[]) {
  const pos = new Map(ideal.map((id, i) => [id, i]));
  let agree = 0;
  let total = 0;
  for (let i = 0; i < user.length; i++)
    for (let j = i + 1; j < user.length; j++) {
      total++;
      if ((pos.get(user[i]!) ?? 0) < (pos.get(user[j]!) ?? 0)) agree++;
    }
  return total ? agree / total : 0;
}

export function scoreArrangement(q: Arrange, order: string[]): TraitScores {
  const out = empty();
  for (const o of q.orderings) {
    const sim = orderSimilarity(order, o.order);
    // Only orderings that mostly match count; strength scales with closeness.
    const factor = sim >= 0.5 ? (sim - 0.5) * 2 : 0;
    add(out, o.pts, factor);
  }
  return out;
}

export function scoreThinking(text: string): TraitScores {
  const out = empty();
  const lower = ` ${text.toLowerCase()} `;
  for (const t of TRAITS) {
    const hits = KEYWORDS[t].filter((k) => lower.includes(k)).length;
    out[t] = Math.min(PER_ANSWER_CAP, hits);
  }
  return out;
}

function maxPerTrait(): TraitScores {
  const m = empty();
  for (const q of MCQS) for (const t of TRAITS) m[t] += Math.max(0, ...q.options.map((o) => o.pts[t] ?? 0));
  for (const q of ARRANGES) for (const t of TRAITS) m[t] += Math.max(0, ...q.orderings.map((o) => o.pts[t] ?? 0));
  for (const t of TRAITS) m[t] += PER_ANSWER_CAP * THINKING.length;
  return m;
}
export const TRAIT_MAX = maxPerTrait();

export type Submission = { mcq: (number | null)[]; arrange: (string[] | null)[]; thinking: string[] };

export function scoreSubmission(s: Submission) {
  const raw = empty();
  let skipped = 0;
  const penalize = () => {
    skipped++;
    for (const t of TRAITS) raw[t] -= SKIP_PENALTY;
  };
  MCQS.forEach((q, i) => {
    const pick = s.mcq[i];
    if (pick === null || pick === undefined || !q.options[pick]) return penalize();
    add(raw, q.options[pick]!.pts);
  });
  ARRANGES.forEach((q, i) => {
    const order = s.arrange[i];
    const valid = order && order.length === q.steps.length && q.steps.every((st) => order.includes(st.id));
    if (!valid) return penalize();
    add(raw, scoreArrangement(q, order!));
  });
  THINKING.forEach((_, i) => {
    const text = (s.thinking[i] ?? "").split(/\s+/).slice(0, THINK_MAX_WORDS).join(" ");
    if (wordCount(text) < THINK_MIN_WORDS) return penalize();
    add(raw, scoreThinking(text));
  });
  const scores = empty();
  for (const t of TRAITS) scores[t] = Math.max(0, Math.min(100, Math.round((raw[t] / TRAIT_MAX[t]) * 100)));
  // Highest wins; ties resolved by fixed trait order.
  const top = TRAITS.reduce((best, t) => (scores[t] > scores[best] ? t : best), TRAITS[0]);
  return { scores, top, skipped };
}

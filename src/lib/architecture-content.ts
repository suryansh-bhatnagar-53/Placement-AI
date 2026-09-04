// Static, frontend-only content for the "How It Works" module.
// audited against build: true
// Covers the six live modules: Interview, Resume ATS, AI Guide, Performance,
// Roadmap, Cheat Sheet — plus the shared engine (AI Gateway, Postgres with RLS,
// local ATS scoring). Every claim below was checked against the real code:
//   TIMER_SECONDS=120, CODING_QUESTION_COUNT=5, WRITING_QUESTION_COUNT=6
//   (src/lib/interview.server.ts); SCORE_WEIGHTS 40/25/20/15 and the four
//   judging dimensions (src/lib/judging.server.ts); grade bands A>=85, B>=70,
//   C>=50, D<50 (src/lib/interview.server.ts); ATS breakdown 10/20/40/10/10/10
//   (src/lib/ats.server.ts); guide rate limit 1 call / 5s and last 6 messages
//   (src/lib/guide.server.ts); PDF text-based only, max 5 MB
//   (src/routes/resume.tsx).

export type ArchLayer = "user" | "entry" | "action" | "engine" | "loop";
export type ArchNodeType = "module" | "subnode" | "engine" | "arrow";

export type ArchNode = {
  id: string;
  label: string;
  type: ArchNodeType;
  layer: ArchLayer;
  /** Plain-language explanation, 2-4 short sentences. */
  summary: string;
  analogy?: string;
  related_label?: string;
  /** Module grouping id, used for the highlight mode. */
  group?: string;
};

export type ArchEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  summary: string;
  group?: string;
};

export const ARCH_GROUPS = [
  { id: "interview", label: "Interview" },
  { id: "resume", label: "Resume Check" },
  { id: "guide", label: "AI Guide" },
  { id: "performance", label: "Performance" },
  { id: "roadmap", label: "Roadmap" },
  { id: "cheatsheet", label: "Cheat Sheet" },
] as const;

export const ARCH_NODES: ArchNode[] = [
  // ---- User layer
  {
    id: "landing",
    label: "Landing page",
    type: "subnode",
    layer: "user",
    summary:
      "The first page a visitor sees. It explains what PlacementAI does and sends you to sign up or sign in. Nothing is stored until you create an account.",
  },
  {
    id: "login",
    label: "Sign up / Sign in",
    type: "subnode",
    layer: "user",
    summary:
      "You create an account with your name, email and password, or sign back in. From this point on, everything you do is saved under your own account and nobody else can see it.",
    analogy: "Like a locker: only your key opens your locker.",
  },
  {
    id: "onboarding",
    label: "Onboarding (role + languages)",
    type: "subnode",
    layer: "user",
    summary:
      "You tell the app which job role you are aiming for and which programming languages you know. The app uses this to pick the right questions and to score your resume against the right role.",
  },

  // ---- Entry layer
  {
    id: "hub",
    label: "Dashboard hub (7 cards)",
    type: "module",
    layer: "entry",
    summary:
      "Your home base. It shows your readiness score, how many interviews you have taken and your last resume score, then offers one card per feature. Every card leads to one of the modules below.",
  },

  // ---- Action layer: Interview
  {
    id: "interview",
    label: "Take an Interview",
    type: "module",
    layer: "action",
    group: "interview",
    summary:
      "A practice interview you can take any time. You choose the setup, answer questions against a clock, and get a scored report at the end.",
  },
  {
    id: "interview-setup",
    label: "Setup: role, language, round",
    type: "subnode",
    layer: "action",
    group: "interview",
    summary:
      "You pick your role, your language and the round type. A Coding round gives you 5 questions; a Writing (theory) round gives you 6. Questions come from a bank of real questions stored in the database.",
  },
  {
    id: "interview-timed",
    label: "Timed questions (120s each)",
    type: "subnode",
    layer: "action",
    group: "interview",
    summary:
      "Each question gives you 120 seconds to type your answer. When the timer runs out the answer is submitted as-is, exactly like a real timed test. Answers are text only.",
  },
  {
    id: "interview-judge",
    label: "AI judging (4 dimensions)",
    type: "subnode",
    layer: "action",
    group: "interview",
    summary:
      "Each answer is sent to an AI examiner that rates it on four things: technical correctness, communication, completeness and confidence. It also writes a couple of sentences on what to fix. If the AI cannot be reached, the app still records your answer.",
    analogy: "Like a teacher marking one question at a time with a rubric.",
  },
  {
    id: "interview-report",
    label: "Report + grade",
    type: "subnode",
    layer: "action",
    group: "interview",
    summary:
      "The app itself, not the AI, adds up the marks: technical counts 40%, communication 25%, completeness 20% and confidence 15%. That total becomes a grade — A from 85, B from 70, C from 50, and D below 50. You see the score for every question next to the model answer.",
  },
  {
    id: "interview-gaps",
    label: "Skill gaps saved",
    type: "subnode",
    layer: "action",
    group: "interview",
    summary:
      "Wherever you scored poorly, the app records a 'skill gap' for that topic with how serious it is. These notes are what the roadmap and the AI guide read later, so a weak answer today shapes your plan tomorrow.",
  },

  // ---- Action layer: Resume
  {
    id: "resume",
    label: "Get Resume Check",
    type: "module",
    layer: "action",
    group: "resume",
    summary:
      "Upload your CV and get an applicant-tracking score out of 100 with concrete fixes. No AI is involved here — the scoring runs on fixed rules inside the app.",
  },
  {
    id: "resume-upload",
    label: "PDF upload (text PDF, ≤5 MB)",
    type: "subnode",
    layer: "action",
    group: "resume",
    summary:
      "You upload a PDF up to 5 MB. It has to be a real text PDF, not a photo or a scan, because the app reads the words out of it. Scanned images are rejected with a clear message.",
  },
  {
    id: "resume-parse",
    label: "Text extraction",
    type: "subnode",
    layer: "action",
    group: "resume",
    summary:
      "The text is pulled out of the PDF in your browser and sent to the app for scoring. Only the text is used, never the layout or images.",
  },
  {
    id: "resume-score",
    label: "ATS score (10/20/40/10/10/10)",
    type: "subnode",
    layer: "action",
    group: "resume",
    summary:
      "Six checks make up the 100 points: contact details 10, section structure 20, keywords for your target role 40, strong action verbs 10, numbers and results 10, and clean formatting 10. The same resume always gets the same score because the rules never change.",
    analogy: "Like a checklist a recruiter's software runs before a human reads you.",
  },
  {
    id: "resume-suggestions",
    label: "Suggestions",
    type: "subnode",
    layer: "action",
    group: "resume",
    summary:
      "For every check you lost points on, the app writes exactly what to change, such as adding a missing section or putting numbers in your bullet points. Your latest score is also copied into your performance snapshot.",
  },

  // ---- Action layer: Guide
  {
    id: "guide",
    label: "Talk with AI Guide",
    type: "module",
    layer: "action",
    group: "guide",
    summary:
      "A chat mentor that already knows your results, so you do not have to explain yourself. Ask it what to study, how to fix your resume, or anything about placements.",
  },
  {
    id: "guide-context",
    label: "Context assembly",
    type: "subnode",
    layer: "action",
    group: "guide",
    summary:
      "Before answering, the app gathers your profile and target role, your skill gaps, your latest resume score, your latest interview result, your roadmap topics and the last 6 messages of the chat. All of that is handed to the AI with your question.",
    analogy: "Like handing a tutor your report card before you ask for advice.",
  },
  {
    id: "guide-reply",
    label: "Complete reply (1 call / 5s)",
    type: "subnode",
    layer: "action",
    group: "guide",
    summary:
      "The AI writes back and the app checks the reply actually finished. If it was cut off mid-sentence the app asks the AI to continue, trims back to the last complete sentence, or shows a short apology instead. You can send one message every 5 seconds.",
  },

  // ---- Action layer: Performance
  {
    id: "performance",
    label: "Performance Dashboard",
    type: "module",
    layer: "action",
    group: "performance",
    summary:
      "One page that shows whether you are actually improving over time, built entirely from results you already produced.",
  },
  {
    id: "perf-readiness",
    label: "Readiness score",
    type: "subnode",
    layer: "action",
    group: "performance",
    summary:
      "A single number that blends your interview performance with your latest resume score. It is the same number shown on the dashboard, so you always have one headline figure to watch.",
  },
  {
    id: "perf-charts",
    label: "Charts + topic averages",
    type: "subnode",
    layer: "action",
    group: "performance",
    summary:
      "Graphs show your trend over time, your four sub-scores, and your average per topic. The weakest topics here are exactly the ones the roadmap picks up.",
  },
  {
    id: "perf-history",
    label: "Interview history",
    type: "subnode",
    layer: "action",
    group: "performance",
    summary:
      "A list of every interview you have completed with its score and grade. You can open any past report again to reread the feedback.",
  },

  // ---- Action layer: Roadmap
  {
    id: "roadmap",
    label: "My Roadmap",
    type: "module",
    layer: "action",
    group: "roadmap",
    summary:
      "A short, ordered study plan built from your own weak spots instead of a generic syllabus. It appears automatically once you have results.",
  },
  {
    id: "roadmap-gaps",
    label: "Reads skill gaps + weak topics",
    type: "subnode",
    layer: "action",
    group: "roadmap",
    summary:
      "The plan starts from your recorded skill gaps, most serious first, and then fills the remaining slots with the topics where your interview average is lowest.",
  },
  {
    id: "roadmap-items",
    label: "Prioritised checklist (up to 5)",
    type: "subnode",
    layer: "action",
    group: "roadmap",
    summary:
      "Each weak topic becomes one task with a title, a clear action, two real learning links and three real practice questions taken from the app's own question bank. You tick tasks off and a progress bar moves. Today the question bank covers four topics, so you usually get four tasks.",
  },
  {
    id: "roadmap-regen",
    label: "Regenerate",
    type: "subnode",
    layer: "action",
    group: "roadmap",
    summary:
      "After a new interview a banner tells you fresh results are available. Pressing regenerate rebuilds the plan from your newest results and clears the ticks.",
  },

  // ---- Action layer: Cheat sheet
  {
    id: "cheatsheet",
    label: "Role Cheat Sheet",
    type: "module",
    layer: "action",
    group: "cheatsheet",
    summary:
      "A fixed revision pack you can read any time. It costs nothing to show because it is stored in the app rather than generated by AI.",
  },
  {
    id: "cheatsheet-sections",
    label: "3 roles × 6 sections",
    type: "subnode",
    layer: "action",
    group: "cheatsheet",
    summary:
      "Three roles — software engineer, machine learning and data analyst — each with six sections: core topics, coding problems, interview concepts, project ideas, a four-week timeline and resources. Every problem and link points to a real, well-known site.",
  },
  {
    id: "cheatsheet-weak",
    label: "Weak-spot badges",
    type: "subnode",
    layer: "action",
    group: "cheatsheet",
    summary:
      "Where a section overlaps a topic you scored badly on, it gets a 'weak spot' badge so you know where to start reading. The badges come from the same skill gaps the roadmap uses.",
  },

  // ---- Engine layer (one combined node)
  {
    id: "engine",
    label: "Core engine: AI Gateway · Postgres (row-level security) · local ATS rules",
    type: "engine",
    layer: "engine",
    summary:
      "This is the machinery under every screen. The AI part 'thinks' — it marks interview answers and writes guide replies, and the app checks whether each reply finished properly. The database keeps your profile, sessions, answers, resume reports, chats, skill gaps and roadmap tasks, with a rule that lets you read only your own rows. The resume scorer is plain code with no AI, so it works even when the AI service is down.",
    analogy: "Engine, filing cabinet and calculator, all behind the dashboard.",
  },

  // ---- Feedback loop
  {
    id: "loop",
    label: "The feedback loop makes each attempt smarter",
    type: "subnode",
    layer: "loop",
    summary:
      "Interview results create skill gaps, skill gaps shape your roadmap, the roadmap and your scores show up on the performance page, and that tells you what to practise in your next interview. Every round of the loop makes the advice more personal.",
    analogy: "Like a coach who remembers your last match before planning the next training.",
  },
];

export const ARCH_EDGES: ArchEdge[] = [
  {
    id: "e-landing-login",
    from: "landing",
    to: "login",
    label: "visitor signs in",
    summary:
      "The visitor moves from the public page into their own account. Everything after this arrow is private to that student.",
  },
  {
    id: "e-login-onboarding",
    from: "login",
    to: "onboarding",
    label: "first-time setup",
    summary:
      "A brand-new account is asked for a target role and languages once. Existing users skip straight past this step.",
  },
  {
    id: "e-onboarding-hub",
    from: "onboarding",
    to: "hub",
    label: "enters the hub",
    summary:
      "With a role saved, the student lands on the dashboard. The dashboard reads their saved profile and results to fill in the three summary numbers.",
  },
  {
    id: "e-hub-actions",
    from: "hub",
    to: "action",
    label: "picks one of six modules",
    summary:
      "From the hub the student branches into whichever module they want. Nothing is compulsory and the modules can be used in any order.",
  },
  {
    id: "e-actions-engine",
    from: "action",
    to: "engine",
    label: "modules call the engine",
    summary:
      "Whatever module you use, it talks to the same engine underneath: the AI service for thinking, the database for remembering, and plain code for resume scoring.",
  },
  {
    id: "e-engine-loop",
    from: "engine",
    to: "loop",
    label: "results feed back",
    summary:
      "Everything the engine stores flows back into your next visit, which is what turns a set of separate tools into one coaching loop.",
  },
  {
    id: "e-loop-hub",
    from: "loop",
    to: "hub",
    label: "back to the hub, better informed",
    summary:
      "The loop closes at the dashboard: your readiness score, roadmap and guide advice all reflect what you just did. The next attempt starts from a smarter baseline.",
  },
];

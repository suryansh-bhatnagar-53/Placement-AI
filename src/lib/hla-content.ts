// Static, frontend-only content for the "High-Level Architecture (Developer View)" module.
// audited against build: true — every claim below maps to a real file/table in this repo.
// Sources audited:
//   Client routes            src/routes/*.tsx
//   Server functions         src/lib/*.functions.ts
//   Interview engine         src/lib/interview.server.ts (TIMER_SECONDS=120, CODING=5, WRITING=6,
//                            TOPIC_WEIGHTS, shuffle(), computeOverallScore, gradeFor, severityFor)
//   Judging                  src/lib/judging.server.ts (SCORE_WEIGHTS 40/25/20/15)
//   AI wrapper               src/lib/ai.server.ts (chat, chatWithFinish, AiUnavailableError)
//   Guide completion         src/lib/guide-completion.ts (+ guide-completion.test.ts)
//   Guide context/limit      src/lib/guide.server.ts (buildGuideContext, checkRateLimit 5000ms)
//   ATS engine               src/lib/ats.server.ts (analyzeResume, ROLE_KEYWORDS)
//   Roadmap                  src/lib/roadmap.functions.ts, src/lib/roadmap-config.ts
//   Cheat sheet              src/lib/cheatsheet-content.ts, src/lib/cheatsheet.functions.ts
//   Auth                     src/integrations/supabase/auth-middleware.ts, src/hooks/useAuth.ts
//   Schema + seed            supabase/migrations/*.sql (64 questions: 32 basic across
//                            C/CPP/PYTHON/JAVA, 12 dsa, 10 dbms, 10 os — verified by query)
// No secrets, keys, hostnames or env values appear in this file.

export type HlaLayer = "client" | "api" | "data" | "external" | "loop";
export type HlaNodeType = "component" | "api" | "data" | "external" | "flow";

export type HlaNode = {
  id: string;
  label: string;
  type: HlaNodeType;
  layer: HlaLayer;
  /** 3-6 precise developer sentences. */
  developer_summary: string;
  related_tables?: string[];
  related_code?: string[];
};

export type HlaEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  developer_summary: string;
  related_code?: string[];
};

export type HlaScenario = {
  id: string;
  label: string;
  trigger: string;
  happens: string;
  handling: string;
  impact: string;
  related_code?: string[];
};

export const HLA_NODES: HlaNode[] = [
  // ---------- Client layer
  {
    id: "client-public",
    label: "Public pages (landing, auth)",
    type: "component",
    layer: "client",
    developer_summary:
      "src/routes/index.tsx is the marketing landing route and src/routes/auth.tsx handles sign-up and sign-in against Supabase Auth through the generated browser client in src/integrations/supabase/client.ts. Session state is exposed app-wide by the useAuth hook (src/hooks/useAuth.ts), which subscribes to onAuthStateChange and getSession. src/routes/onboarding.tsx writes target_role and languages to the profiles row via profile.functions.ts. These are the only routes reachable without a session.",
    related_tables: ["profiles"],
    related_code: ["src/routes/index.tsx", "src/routes/auth.tsx", "src/hooks/useAuth.ts"],
  },
  {
    id: "client-hub",
    label: "Dashboard hub (8 cards)",
    type: "component",
    layer: "client",
    developer_summary:
      "src/routes/dashboard.tsx renders the card grid and calls one server function, getDashboardSummary (src/lib/dashboard.functions.ts), through useServerFn + TanStack Query. That call returns the profile, the newest performance_snapshots.readiness_score, a head/count of completed sessions and the latest ats_reports.ats_score. The card list is a plain const array in the route file, so adding a module is a one-line append. No business logic lives in the component.",
    related_tables: ["profiles", "performance_snapshots", "sessions", "ats_reports"],
    related_code: ["src/routes/dashboard.tsx", "src/lib/dashboard.functions.ts"],
  },
  {
    id: "client-modules",
    label: "Module pages (interview, resume, guide, performance, roadmap, cheat sheet)",
    type: "component",
    layer: "client",
    developer_summary:
      "Each module is a file route: interview/setup, interview/session.$id, interview/report.$id, resume, guide, performance, roadmap, cheatsheet. They hold UI state only — the 120s countdown, form inputs, chart rendering (recharts on src/routes/performance.tsx) and accordion state — and delegate every read or write to a server function. The one genuinely client-side computation is PDF text extraction in src/lib/pdf-text.ts, which lazy-imports pdfjs-dist so it never runs during SSR. All of these routes render inside src/components/AppShell.tsx, which redirects to /auth when useAuth reports no session.",
    related_code: ["src/routes/interview/session.$id.tsx", "src/routes/resume.tsx", "src/lib/pdf-text.ts"],
  },

  // ---------- API / server layer
  {
    id: "api-auth",
    label: "Auth gate: Supabase JWT + requireSupabaseAuth middleware",
    type: "api",
    layer: "api",
    developer_summary:
      "Credentials are never hashed by this app: Supabase Auth (GoTrue) owns password hashing and issues the access token, so there is no local bcrypt implementation. On the client, src/start.ts registers a function middleware that attaches the bearer token to every server-function call; on the server, requireSupabaseAuth (src/integrations/supabase/auth-middleware.ts) validates it and injects context.supabase and context.userId. An unauthenticated call gets a 401 Response before the handler body runs. In the UI, AppShell plus useAuth redirect to /auth, so protection exists on both sides.",
    related_tables: ["profiles"],
    related_code: [
      "src/integrations/supabase/auth-middleware.ts",
      "src/start.ts",
      "src/components/AppShell.tsx",
    ],
  },
  {
    id: "api-interview",
    label: "Interview server functions",
    type: "api",
    layer: "api",
    developer_summary:
      "src/lib/interview.functions.ts exposes startInterview, getSessionState, submitAnswer, abortInterview, finishInterview and getReport, each validated with a zod schema. startInterview calls pickQuestions() and stores the chosen ids as a JSON question_ids array on the sessions row, which makes every session replayable and auditable. submitAnswer upserts on the (session_id, position) unique key, so a retry cannot duplicate an answer. finishInterview computes the overall score locally, writes skill_gaps, a roadmaps snapshot and a performance_snapshots row, and is idempotent — a session already marked completed returns its stored score.",
    related_tables: ["sessions", "answers", "skill_gaps", "roadmaps", "performance_snapshots"],
    related_code: ["src/lib/interview.functions.ts"],
  },
  {
    id: "api-selection",
    label: "Question selection engine",
    type: "api",
    layer: "api",
    developer_summary:
      "pickQuestions() in src/lib/interview.server.ts loads the bank filtered by type ('coding' for the coding round, 'theory' for writing) and then selects, never inventing questions. Coding rounds take CODING_QUESTION_COUNT = 5 topic-'basic' questions, shuffled inside each selected language and drawn round-robin so every chosen language appears; role ML puts PYTHON first when it is selected. Writing rounds take WRITING_QUESTION_COUNT = 6 from the shuffled dsa/dbms/os buckets using TOPIC_WEIGHTS — SE and ML are dsa 3 / os 2 / dbms 1, DA is dbms 4 / dsa 1 / os 1 — then shuffle the result and top up from leftovers so the set is never short. Selection is therefore random within a deterministic, role-weighted frame.",
    related_tables: ["questions", "sessions"],
    related_code: ["src/lib/interview.server.ts"],
  },
  {
    id: "api-judging",
    label: "Judging + local scoring",
    type: "api",
    layer: "api",
    developer_summary:
      "judgeAnswer() in src/lib/judging.server.ts makes exactly one AI call per submitted answer and asks for JSON with technical/communication/completeness/confidence scores (0-10) plus feedback; the candidate answer is fenced as untrusted data in the prompt. Parsing is defensive: parseJsonLoose strips markdown fences, values are clamped to 0-10, and any throw or unparsable body returns nulls with the GENERIC_FEEDBACK string instead of crashing the request. The overall score is computed in code, never by the model: computeOverallScore() averages each dimension and applies SCORE_WEIGHTS 0.40/0.25/0.20/0.15 × 10 to give 0-100, and gradeFor() maps it to A ≥ 85, B ≥ 70, C ≥ 50, else D. severityFor() turns per-topic technical averages into high (<3), medium (<4) or low (<5) skill_gaps rows.",
    related_tables: ["answers", "skill_gaps"],
    related_code: ["src/lib/judging.server.ts", "src/lib/interview.server.ts"],
  },
  {
    id: "api-ats",
    label: "LocalHeuristicATS (internal, zero AI)",
    type: "api",
    layer: "api",
    developer_summary:
      "analyzeResume() in src/lib/ats.server.ts is pure deterministic TypeScript — no network, no model — so the same text always yields the same score and it keeps working when the AI gateway is down. The 100 points are contact 10 (email/phone/LinkedIn-or-GitHub regexes), structure 20 (education/experience/skills/projects heading patterns), keywords 40 (ROLE_KEYWORDS map for SE, ML and DA), action verbs 10, quantifiable results 10 (percent/currency/number regexes) and formatting 10 (line-length standard deviation and over-long-line heuristics). Every bucket that loses points emits a typed suggestion with a high/medium/low priority. analyzeResumeText (src/lib/resume.functions.ts) rejects text under 100 characters, truncates input to 40 000 characters, stores the report and patches ats_last_score onto the newest performance snapshot.",
    related_tables: ["ats_reports", "performance_snapshots", "profiles"],
    related_code: ["src/lib/ats.server.ts", "src/lib/resume.functions.ts"],
  },
  {
    id: "api-guide",
    label: "AI Guide server function",
    type: "api",
    layer: "api",
    developer_summary:
      "sendGuideMessage (src/lib/guide.functions.ts) first calls checkRateLimit(), an in-memory Map in src/lib/guide.server.ts that throws when the same user posts twice within 5000 ms. buildGuideContext() then fetches profile name and target_role, the 3 newest skill_gaps, the latest ats_reports score, the most recent completed session score, the newest roadmap topics and the last 6 chat_messages in one Promise.all, and that block is injected into the system prompt. The model call goes through generateCompleteReply() with maxTokens 900: on finish_reason === 'length' it issues one continuation call, then trims to the last complete sentence, and returns GUIDE_FALLBACK if nothing complete survives. Only the guaranteed-complete text is inserted into chat_messages, so history can never contain a truncated reply.",
    related_tables: ["chat_messages", "profiles", "skill_gaps", "ats_reports", "sessions", "roadmaps"],
    related_code: [
      "src/lib/guide.functions.ts",
      "src/lib/guide.server.ts",
      "src/lib/guide-completion.ts",
    ],
  },
  {
    id: "api-roadmap",
    label: "Roadmap generator",
    type: "api",
    layer: "api",
    developer_summary:
      "src/lib/roadmap.functions.ts ranks weak topics in rankWeakTopics(): recorded skill_gaps first, mapped to priority 1/2/3 by severity, then the weakest measured topics from topicAverages() fill the remaining slots up to ROADMAP_MAX_ITEMS (5). Each surviving topic must exist in the static TOPIC_PLANS map in src/lib/roadmap-config.ts, which supplies the title, action and two real resource links, and three real practice question ids are read from the questions table by topic — so practice_question_ids never dangle. Rows are written to roadmap_items with status 'pending'; toggling flips a single row and regeneration deletes and rebuilds the set, clearing done flags. Because the seeded bank only covers four topics (basic, dsa, dbms, os), a learner normally sees four items rather than five.",
    related_tables: ["roadmap_items", "skill_gaps", "answers", "questions"],
    related_code: ["src/lib/roadmap.functions.ts", "src/lib/roadmap-config.ts"],
  },
  {
    id: "api-cheatsheet",
    label: "Cheat sheet reader (static content)",
    type: "api",
    layer: "api",
    developer_summary:
      "The cheat sheet content is a checked-in TypeScript module, src/lib/cheatsheet-content.ts, holding three roles (SE, ML, DA) × six sections: Core Topics, Coding Problems, Interview Concepts, Project Ideas, a 4-week timeline and Resources, with 12 named linked problems and 5 projects per role. getCheatSheet in src/lib/cheatsheet.functions.ts just selects the requested role and returns the section list — it makes zero LLM calls and touches no table for the content itself. The weak-spot badges are computed by overlapping the learner's skill_gaps topics with the section topics, which is the only per-user read on this page.",
    related_tables: ["skill_gaps"],
    related_code: ["src/lib/cheatsheet-content.ts", "src/lib/cheatsheet.functions.ts"],
  },
  {
    id: "api-performance",
    label: "Performance & readiness aggregation",
    type: "api",
    layer: "api",
    developer_summary:
      "getPerformance (src/lib/dashboard.functions.ts) reads up to 50 performance_snapshots ordered by snapshot_date for the trend line, the 20 most recent sessions for interview history, every answers row for topic aggregation and the latest ats_reports score. Per-topic bars come from topicAverages() in src/lib/interview.server.ts, joining answers.question_id to questions.topic in memory. The readiness score is not recomputed here: it is the overall_score persisted by finishInterview into performance_snapshots.readiness_score, and resume uploads patch ats_last_score onto the newest snapshot. getDashboardSummary reads the same tables in a smaller shape for the hub tiles.",
    related_tables: ["performance_snapshots", "sessions", "answers", "questions", "ats_reports"],
    related_code: ["src/lib/dashboard.functions.ts", "src/lib/interview.server.ts"],
  },

  // ---------- Data layer
  {
    id: "data-postgres",
    label:
      "Postgres (Lovable Cloud) — profiles · questions · sessions · answers · ats_reports · chat_messages · skill_gaps · roadmaps · roadmap_items · performance_snapshots",
    type: "data",
    layer: "data",
    developer_summary:
      "Schema lives in versioned SQL under supabase/migrations, each new public table followed by GRANTs, ENABLE ROW LEVEL SECURITY and owner-scoped policies, so a query can only ever see rows whose user_id matches auth.uid(). questions is the one shared, read-only table and is seeded idempotently by migration with 64 rows: 32 basic coding questions (8 each for C, C++, Python and Java), 12 DSA, 10 DBMS and 10 OS, each carrying a sample_answer used both for grading context and for the report's model answer. sessions stores role, languages, round_type, the JSON question_ids array, status (in_progress / completed / aborted) and overall_score; answers stores user_text, time_taken_seconds, the timed_out flag, four dimension scores, feedback and the model answer. Derived state lives in skill_gaps, roadmaps, roadmap_items, ats_reports and performance_snapshots, which is what makes the feedback loop possible.",
    related_tables: [
      "profiles",
      "questions",
      "sessions",
      "answers",
      "ats_reports",
      "chat_messages",
      "skill_gaps",
      "roadmaps",
      "roadmap_items",
      "performance_snapshots",
    ],
    related_code: ["supabase/migrations/", "src/integrations/supabase/types.ts"],
  },

  // ---------- External layer
  {
    id: "ext-ai",
    label: "External: AI Gateway (LLM provider)",
    type: "external",
    layer: "external",
    developer_summary:
      "src/lib/ai.server.ts is the single egress point for AI in the whole app; nothing else calls a model. chat() returns content only, while chatWithFinish() returns { content, finishReason } so the guide can detect 'length' truncation and continue. The API key is read from the server environment inside the handler and never reaches the browser; a missing key, a 429 or a 402 all raise a typed AiUnavailableError with a user-safe message. Only two features depend on it — per-answer interview judging and the AI Guide — so an outage degrades those two paths and leaves everything else fully functional.",
    related_code: ["src/lib/ai.server.ts"],
  },
  {
    id: "ext-none-ats",
    label: "No external resume/AI parsing service (internal only)",
    type: "external",
    layer: "external",
    developer_summary:
      "There is deliberately no third-party resume-parsing or wording-polish service in this build. Text extraction happens in the browser with pdfjs-dist (src/lib/pdf-text.ts) and scoring happens in-process in src/lib/ats.server.ts, so the ATS node sits in the internal API layer, not here. That means resume checks cost nothing per run, are reproducible, and keep working during an AI outage. Nothing about the resume ever goes to the model provider.",
    related_code: ["src/lib/pdf-text.ts", "src/lib/ats.server.ts"],
  },

  // ---------- Feedback loop
  {
    id: "loop",
    label: "The feedback loop",
    type: "flow",
    layer: "loop",
    developer_summary:
      "finishInterview writes three derived artefacts in one pass: skill_gaps rows from per-topic technical averages, a roadmaps snapshot for that session, and a performance_snapshots row carrying readiness, the four dimension averages and the latest ATS score. Roadmap generation reads those skill_gaps back and ranks them by severity; the performance page charts the snapshots; the AI Guide injects gaps, scores and roadmap topics into its system prompt. The next interview then produces fresh rows, and because skill_gaps are append-only with created_at ordering, the newest results dominate the ranking. Nothing in this loop needs the model to be online except the judging step itself.",
    related_tables: ["skill_gaps", "roadmaps", "roadmap_items", "performance_snapshots"],
    related_code: ["src/lib/interview.functions.ts", "src/lib/roadmap.functions.ts"],
  },
];

export const HLA_EDGES: HlaEdge[] = [
  {
    id: "e-client-api",
    from: "client",
    to: "api",
    label: "useServerFn RPC (POST/GET, bearer token attached)",
    developer_summary:
      "Every UI action goes through TanStack Start server functions rather than hand-rolled REST endpoints: the component calls useServerFn(fn) and TanStack serialises the call over HTTP. src/start.ts adds a client function middleware that attaches the Supabase access token, and requireSupabaseAuth validates it on the server. Inputs are parsed with zod inside .inputValidator(), so malformed payloads are rejected before any database work. There is no separate API server to deploy or keep in sync.",
    related_code: ["src/start.ts", "src/lib/interview.functions.ts"],
  },
  {
    id: "e-api-data",
    from: "api",
    to: "data",
    label: "Supabase client scoped to the caller (RLS enforced)",
    developer_summary:
      "Handlers use context.supabase from requireSupabaseAuth, a client bound to the caller's token, so Postgres row-level security decides visibility rather than application code. Writes always set user_id from context.userId, never from request input, which removes a whole class of tampering bugs. The service-role client is not used on these read/write paths. Query shapes are narrow selects, and count queries use head:true so the hub tiles do not pull rows.",
    related_code: ["src/integrations/supabase/auth-middleware.ts"],
  },
  {
    id: "e-api-ai",
    from: "api",
    to: "ext-ai",
    label: "HTTPS chat completion (judging + guide only)",
    developer_summary:
      "Only judgeAnswer() and sendGuideMessage() cross this boundary. Judging sends the question, the reference answer and the candidate answer clearly delimited as untrusted data, and asks for a fixed JSON shape; the guide sends the system prompt with the learner context block plus the last 6 messages. Both calls are awaited server-side — nothing is streamed to the browser mid-generation — so a partial response can never be committed to the UI. Failures raise AiUnavailableError and are handled by the caller rather than propagating raw provider errors.",
    related_code: ["src/lib/ai.server.ts", "src/lib/judging.server.ts"],
  },
  {
    id: "e-data-loop",
    from: "data",
    to: "loop",
    label: "derived rows feed the next attempt",
    developer_summary:
      "The loop is made of ordinary rows, not background jobs: skill_gaps, roadmaps, roadmap_items and performance_snapshots are written synchronously at the end of finishInterview. Because they are plain tables under RLS, the roadmap, performance and guide features read them independently with no queue, cron or cache to invalidate. The roadmap page compares the newest interview timestamp against the roadmap rows to show its 'new results available' banner.",
    related_code: ["src/lib/interview.functions.ts", "src/lib/roadmap.functions.ts"],
  },
  {
    id: "e-loop-client",
    from: "loop",
    to: "client",
    label: "back to the hub with updated readiness",
    developer_summary:
      "After finishInterview returns, the client navigates to the report route and the dashboard query refetches, picking up the new performance_snapshots row as the readiness tile. The roadmap route auto-generates on its first read and offers regeneration afterwards, and the guide immediately sees the new gaps because it rebuilds its context on every message. No client-side cache of derived scores exists, so there is nothing to keep in sync.",
    related_code: ["src/routes/dashboard.tsx", "src/lib/dashboard.functions.ts"],
  },
];

export const HLA_SCENARIOS: HlaScenario[] = [
  {
    id: "s-ai-down",
    label: "AI gateway unreachable or erroring",
    trigger: "The provider returns a non-2xx (429/402/5xx) or the fetch in src/lib/ai.server.ts fails.",
    happens:
      "chat() raises a typed AiUnavailableError instead of returning text, and judgeAnswer() catches every throw in its try/catch.",
    handling:
      "judgeAnswer() returns nullJudgement(): four null scores plus the GENERIC_FEEDBACK string. The answer row is still upserted, the session continues, and computeOverallScore() simply ignores rows whose technical_score is null.",
    impact:
      "The interview never breaks mid-round; unscored questions show the sample answer and generic feedback. Auth, resume checks, roadmap, cheat sheet and the dashboard are unaffected because they make no AI calls.",
    related_code: ["src/lib/ai.server.ts", "src/lib/judging.server.ts"],
  },
  {
    id: "s-truncated",
    label: "AI reply truncated mid-sentence",
    trigger: "The guide response hits the 900-token cap and the provider reports finish_reason === 'length'.",
    happens:
      "generateCompleteReply() in src/lib/guide-completion.ts detects the length finish and issues one continuation call asking the model to resume exactly where it stopped.",
    handling:
      "The combined text is validated with endsComplete(); if it still does not end in terminal punctuation it is cut back by trimToLastSentence(), and if nothing complete survives GUIDE_FALLBACK is returned. Only the guaranteed-complete string is inserted into chat_messages.",
    impact:
      "The user always sees a finished sentence or the explicit fallback message, and stored history can never contain a broken reply. Covered by the unit suite in src/lib/guide-completion.test.ts.",
    related_code: ["src/lib/guide-completion.ts", "src/lib/guide.functions.ts"],
  },
  {
    id: "s-scanned-pdf",
    label: "Unreadable or scanned PDF",
    trigger: "A user uploads an image-only PDF, or a file over 5 MB, on /resume.",
    happens:
      "src/routes/resume.tsx rejects anything above 5 MB client-side; otherwise pdfjs-dist extracts text and analyzeResumeText receives a nearly empty string.",
    handling:
      "The server function throws before any scoring when the trimmed text is under 100 characters, with the message 'Could not read PDF; ensure it's text-based, not a scanned image'. No ats_reports row is written.",
    impact:
      "The user gets one clear, actionable error and can retry with a text-based export; no partial or misleading score is ever stored.",
    related_code: ["src/routes/resume.tsx", "src/lib/resume.functions.ts"],
  },
  {
    id: "s-empty-answer",
    label: "Empty answer submitted manually",
    trigger: "The candidate presses submit with a blank textarea while the timer is still running.",
    happens:
      "submitAnswer's guard sees answer.trim().length === 0 with timed_out false and throws 'Answer cannot be empty'.",
    handling:
      "The error surfaces before the AI call and before any insert, so no answers row is created and the position is not advanced. Zod has already validated the payload shape upstream.",
    impact:
      "The learner stays on the same question with their remaining time and no AI credit is spent on an empty submission.",
    related_code: ["src/lib/interview.functions.ts"],
  },
  {
    id: "s-timeout",
    label: "Timer expires mid-answer",
    trigger: "The 120-second countdown in src/routes/interview/session.$id.tsx reaches zero (TIMER_SECONDS in src/lib/interview.server.ts).",
    happens:
      "The client auto-submits whatever is typed with timed_out: true, and the empty-answer guard is deliberately skipped for timed-out submissions.",
    handling:
      "judgeAnswer() is told the candidate ran out of time, the answers row stores timed_out and time_taken_seconds, and the report renders the flag next to that question.",
    impact:
      "Behaviour matches a real timed test: the attempt counts, it is graded honestly, and the report shows which questions were cut short.",
    related_code: ["src/lib/interview.functions.ts", "src/lib/interview.server.ts"],
  },
  {
    id: "s-abort",
    label: "Candidate aborts the interview early",
    trigger: "The user confirms 'leave interview' during an in-progress session.",
    happens:
      "abortInterview updates the sessions row to status 'aborted' with an ended_at timestamp, guarded by .eq('status','in_progress') so a completed session cannot be downgraded.",
    handling:
      "finishInterview is never called, so no overall_score, skill_gaps, roadmaps or performance_snapshots rows are produced. Partial answers stay in the answers table but are never aggregated into a report.",
    impact:
      "No half-finished score pollutes the readiness trend, and the user is returned to the dashboard.",
    related_code: ["src/lib/interview.functions.ts"],
  },
  {
    id: "s-auth",
    label: "Session token expired or missing",
    trigger: "A server function is called without a valid Supabase access token, or the token has expired.",
    happens:
      "requireSupabaseAuth rejects the call with a 401 Response before the handler body executes.",
    handling:
      "Supabase Auth refreshes tokens automatically while the tab is alive; when it cannot, useAuth reports a null session and AppShell redirects to /auth. Protection is enforced server-side, so hiding the UI is defence in depth rather than the actual gate.",
    impact:
      "The user is sent to sign-in and no data leaks; every protected route behaves identically because they share one middleware.",
    related_code: ["src/integrations/supabase/auth-middleware.ts", "src/components/AppShell.tsx"],
  },
  {
    id: "s-duplicate-email",
    label: "Sign-up with an already registered email",
    trigger: "A visitor submits the sign-up form with an email that already has an account.",
    happens:
      "Supabase Auth rejects the signUp call and src/routes/auth.tsx surfaces the returned error message inline on the form.",
    handling:
      "This app does not implement its own registration table or its own status codes; account uniqueness is enforced by the auth provider, and the client only renders the error and keeps the form state.",
    impact:
      "The user is told the account exists and can switch to sign-in without losing what they typed.",
    related_code: ["src/routes/auth.tsx"],
  },
  {
    id: "s-rate-limit",
    label: "Guide messages sent faster than 1 per 5 seconds",
    trigger: "The same user posts a second guide message within 5000 ms.",
    happens:
      "checkRateLimit() in src/lib/guide.server.ts compares Date.now() against an in-memory Map keyed by user id and throws before any context assembly or AI call.",
    handling:
      "The thrown message — 'You're sending messages too fast. Wait a few seconds and try again.' — is rendered by the guide UI. It is a server-side throw rather than a formal 429 status, and the Map is per-instance, not shared storage.",
    impact:
      "Bursts are stopped before they cost AI credits, and the user sees a plain instruction to wait a moment.",
    related_code: ["src/lib/guide.server.ts", "src/routes/guide.tsx"],
  },
  {
    id: "s-new-results",
    label: "New interview finished after the roadmap was generated",
    trigger: "A completed session is newer than the newest roadmap_items row for that user.",
    happens:
      "getRoadmap compares the latest completed session timestamp with the roadmap rows and returns a stale flag alongside the items.",
    handling:
      "The /roadmap page shows a 'new results available' banner; regenerate deletes the existing roadmap_items and rebuilds from the current skill_gaps and topic averages, which clears all done flags by construction.",
    impact:
      "The plan can never silently drift from the learner's latest results, and regeneration is an explicit user choice rather than an automatic reset.",
    related_code: ["src/lib/roadmap.functions.ts", "src/routes/roadmap.tsx"],
  },
  {
    id: "s-bad-json",
    label: "Model returns malformed judging JSON",
    trigger: "The grader replies with markdown fences, prose around the JSON, or invalid JSON.",
    happens:
      "parseJsonLoose() in src/lib/ai.server.ts strips fences and attempts a tolerant parse; a failure returns null rather than throwing.",
    handling:
      "judgeAnswer() falls back to nullJudgement(), clamps any out-of-range numbers to 0-10, and caps feedback at 800 characters. The answer is still persisted with its text and timing.",
    impact:
      "One bad model response degrades a single question's score to 'not evaluated' instead of failing the submission or the whole session.",
    related_code: ["src/lib/ai.server.ts", "src/lib/judging.server.ts"],
  },
  {
    id: "s-duplicate-submit",
    label: "Duplicate submit or a re-finished session",
    trigger: "A double click, retry or refresh resubmits the same question position or calls finishInterview twice.",
    happens:
      "answers is upserted on the (session_id, position) conflict target, and finishInterview short-circuits when the session status is already 'completed'.",
    handling:
      "The upsert overwrites rather than duplicating, and the early return replays the stored overall_score instead of writing a second performance snapshot or a second set of skill gaps.",
    impact:
      "Reports stay consistent under flaky networks, and the readiness trend is not inflated by repeated finishes.",
    related_code: ["src/lib/interview.functions.ts"],
  },
];

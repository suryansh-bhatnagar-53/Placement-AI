# PlacementAI — Phase 1: Interview Core + Career Quiz

Building the PRD on this project's stack: TanStack Start (React) frontend, Lovable Cloud for database, auth, storage, and server-side logic, and Lovable AI for all judging and generation. No separate FastAPI/Next.js services.

## Scope of this build

In:
- Auth: email/password + Google sign-in, session persists on refresh (FR-A1)
- Onboarding: name, target role (SDE / Data Analyst / ML Engineer), company type, optional prep deadline, preferred languages C/C++/Java/Python (FR-A2, FR-A3)
- Mock interview: config (role, languages, topics Basic Coding/DSA/DBMS/OS, question count default 8, difficulty), one question at a time, timer with auto-submit on timeout, pause/resume (FR-C1, C2, C3, C5, C6)
- Seed question bank: 90+ questions across topics x languages with model answers (FR-C2)
- AI judging: per-answer Technical / Communication / Confidence / Completeness 0-10 with justifications, per-question feedback + model answer, overall 0-100 weighted score (40/25/20/15) (FR-D1, D2, D3)
- Skill gaps: 5-10 gap statements per session, stored and listed (FR-D4)
- Interview report page with per-question breakdown
- Career guidance quiz (O7 / FR-G1): strengths + interest + aptitude questions, AI recommends SDE / DA / ML with reasoning
- Prompt hardening: system boundaries, answers treated as untrusted input, JSON-validated + clamped scores (FR-D5)

Deferred to the next phase: resume ATS checker (Module B), roadmap generation (Module E), dashboard and readiness score (Module F), voice answers, score history charts.

Decisions applied: text answers only; DSA answered as approach/pseudo-code (code snippets accepted but not executed); career quiz included.

## Screens

- `/` — landing: what PlacementAI does, sign in / get started
- `/auth` — sign in / sign up (email + Google)
- `/onboarding` — profile and role/language setup
- `/home` — signed-in hub: start interview, past sessions, career quiz entry
- `/interview/new` — interview configuration
- `/interview/$sessionId` — live interview: question, timer, answer editor, progress
- `/interview/$sessionId/report` — scores, per-question feedback, model answers, skill gaps
- `/career-quiz` — quiz + AI role recommendation

## Data model (Lovable Cloud / Postgres)

- `profiles` — user_id, name, target_role, target_company_type, prep_deadline, languages[]
- `question_bank` — topic, language, difficulty, question_text, model_answer, tags[] (public read)
- `interview_sessions` — user_id, role, topics[], languages[], difficulty, question_count, status, started_at, ended_at, overall_score, scores_breakdown
- `session_questions` — session_id, question_id, position, snapshot of question text
- `answers` — session_id, session_question_id, text, time_taken_s, timeout_flag, scores JSON, feedback
- `skill_gaps` — user_id, session_id, skill_name, topic, severity, suggestion
- `career_assessments` — user_id, quiz_answers JSON, recommendations JSON

Every table gets row-level security scoped to the owning user; the question bank is read-only to signed-in users. Seed questions ship as literal inserts in the migration.

## Technical notes

- Server logic uses `createServerFn` handlers (start session, submit answer, finish session, generate gaps, career recommendation). No public unauthenticated endpoints.
- AI calls go through Lovable AI (`google/gemini-3.7-flash`) from server handlers only, with a strict JSON scoring schema, score clamping to 0-10, and a rubric with few-shot examples.
- Cost control: batch judging is capped so a session stays within ~15 model calls; question bank is read from the database, never generated per session.
- Gateway failures (402/429/5xx) surface as explicit in-app messages rather than fake scores.
- Scoring weights live as a single documented constant.
- Timer state and pause/resume persist in the session row so refresh does not lose progress.

## Design

Focused, exam-room feel: dark-neutral surface, single accent for scores and progress, monospace for code answers, generous typographic hierarchy. Distinct visual language from generic dashboards — no purple gradients.

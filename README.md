## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

---

# PlacementAI

AI interview & placement mentor. Stack: TanStack Start + Lovable Cloud (Postgres, Auth, Storage) + Lovable AI Gateway.

## AI Guide truncation — diagnosis

Checklist run against the actual code:

| Suspect | Verdict | Evidence |
| --- | --- | --- |
| `max_tokens` cap → `finish_reason == "length"` | **ROOT CAUSE** | `src/lib/ai.server.ts:35` sent `max_tokens` (guide used 500) and `src/lib/ai.server.ts:63` returned only `choices[0].message.content`, discarding `finish_reason` — a capped reply was persisted mid-sentence with no way to detect it. |
| Streaming committed prematurely | Not applicable | No streaming anywhere; `src/lib/ai.server.ts:25` is a single buffered `fetch`. |
| Client-side truncation (`.slice`/`.substring`/`AbortController`) | Not present | `src/routes/guide.tsx` renders `message.content` verbatim; no slicing, no abort/timeout on the guide path. The only `.slice` in guide code is the intentional sentence trim at `src/lib/guide-completion.ts:28`. |
| Missing `await` / early return on the backend | Not present | `src/lib/guide.functions.ts:54-72` awaits generation, then persists, then returns. |
| Provider timeout | Not observed | No timer/abort wraps the gateway call; gateway errors surface as typed `AiUnavailableError` (`src/lib/ai.server.ts:39-58`). |

### Fix

- `src/lib/ai.server.ts:66-121` — `chatWithFinish()` returns `{ content, finishReason }` (the old `chat()` is untouched, so judging/ATS behaviour is unchanged).
- `src/lib/guide-completion.ts` — pure guarantee layer: `endsComplete()` (terminal `. ! ? " ' ) ] \``), one continuation retry when `finish_reason === "length"`, `trimToLastSentence()` fallback, and `GUIDE_FALLBACK` = "I'm having trouble forming a complete answer right now. Please try again." Broken text can never reach the user.
- `src/lib/guide.functions.ts:54-69` — the guide now calls `generateCompleteReply()` with `maxTokens: 900` and a continuation prompt; only the guaranteed-complete text is persisted.

### Regression test

`src/lib/guide-completion.test.ts` (mock LLM returning truncated text). `bunx vitest run`:

```
✓ src/lib/guide-completion.test.ts (10 tests) 14ms
Test Files  1 passed (1)
Tests  10 passed (10)
```

### Before / after (captured from real chat history)

- Before (persisted 2026-09-02): `"Hi John, since your coding interview baseline is solid (73.3/100"` — cut mid-sentence.
- After (persisted 2026-09-03): `"…ery in C++ or Java, stick with what you know best for pure algorithmic speed. Otherwise, commit fully to Python."` — ends with terminal punctuation.

Multi-language still works (a Hinglish reply is in the same history), and the guide context still includes profile/role, skill gaps, latest ATS score, latest interview score and roadmap topics (`src/lib/guide.server.ts`).

## RoadMap (`/roadmap`)

- Backend: `src/lib/roadmap.functions.ts` — `getRoadmap` (auto-generates on first call), `toggleRoadmapItem` (pending/done), `regenerateRoadmap` (rebuild from latest data, clears done flags).
- Ranking: `skill_gaps` by severity first, then weakest per-topic interview averages (`topicAverages` in `src/lib/interview.server.ts`).
- Static topic → title/action/2 real resources map: `src/lib/roadmap-config.ts`.
- `practice_question_ids` are selected from the seeded `questions` table, so every reference is real.
- Table `roadmap_items` (additive migration) with RLS scoped to `auth.uid()`.
- UI: progress bar, checklist with topic badge + action + expandable resources/practice questions, "Regenerate from my results", "New results available" banner, empty-state CTA.

**Deviation:** the seeded question bank has four topics (Basic Coding, DSA, DBMS, OS), so the roadmap generates up to four items instead of five. `ROADMAP_MAX_ITEMS` is 5 — adding a fifth topic to the seed automatically yields a fifth item. No fake topic was invented.

## General Cheat Sheet (`/cheatsheet`)

- Static content in `src/lib/cheatsheet-content.ts`: 3 roles (SE / ML / DA) × 6 sections — Core Topics, Coding Problems, Interview Concepts, Project Ideas, 4-Week Timeline, Resources. 10+ named real problems per role with real LeetCode / NeetCode / SQL 50 / Kaggle links, 4–5 projects per role.
- API: `getCheatSheet` (`src/lib/cheatsheet.functions.ts`) returns the sheet plus the learner's weak topics. Zero LLM calls.
- UI: role selector (defaults to the profile's target role), accordion sections, "Weak spot" badges where a section overlaps a recorded skill gap, all links open in new tabs.

## Dashboard

Exactly six cards, in order: Interview → Resume → AI Guide → Performance → Roadmap → Cheat Sheet. All app routes require a session.

## Demo script

1. Register / sign in → onboarding (role + languages).
2. Dashboard — six cards, readiness score, interviews taken, last ATS.
3. Interview → setup (role, round, language) → session (timed answers) → report with per-question scores and skill gaps.
4. Resume → upload a PDF → ATS score, breakdown, suggestions.
5. AI Guide → ask "What should I study first?" → complete, context-aware reply.
6. Performance → readiness trend, sub-scores, per-topic averages, interview history.
7. Roadmap → prioritised items, tick one to move the progress bar, "Regenerate from my results".
8. Cheat Sheet → switch role, expand sections, open a real problem link.

## How It Works — Low-Level Architecture (`/how-it-works`)

- Static, frontend-only content in `src/lib/architecture-content.ts` (nodes + edges, one source of truth; zero AI calls, no new endpoints or dependencies).
- `src/routes/how-it-works.tsx` renders one layered workflow: student → hub → six modules with sub-nodes → combined core engine (AI Gateway, Postgres with RLS, local ATS rules) → feedback loop back to the hub.
- Every node, sub-node, engine node and arrow is a focusable button; clicking one opens a fixed mini dialog in the bottom-right with a plain-language explanation and close button — the diagram never moves or resizes. Optional legend highlights a single module.

## High-Level Architecture — Developer View (`/architecture`)

- Static, frontend-only content in `src/lib/hla-content.ts` (nodes + edges + resilience scenarios; zero AI calls, no new endpoints, tables or dependencies). Deviation: the spec named `architecture-content.ts`, which is already owned by the low-level module, so the new file is `hla-content.ts`.
- `src/routes/architecture.tsx` renders one connected diagram — client routes → server functions (auth gate, interview, selection, judging, local ATS, guide, roadmap, cheat sheet, performance) → Postgres with row-level security → external AI Gateway (the only external dependency; resume scoring is internal and deterministic) → feedback loop.
- Every box and arrow is a focusable button opening a fixed mini dialog with 3–6 developer sentences naming real files, functions and tables. Below the diagram, "Common scenarios & how the backend handles them" lists twelve audited failure paths as Trigger → What happens → Handling → User impact. No secrets, keys or hostnames appear anywhere.

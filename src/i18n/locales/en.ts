import { TOUR_MODULES } from "@/lib/tour-content";
import { MODULE_GUIDES } from "@/lib/module-guide-content";

/**
 * English is the source language and the fallback for every other language.
 * Tour and in-module guide copy is generated from their existing content files,
 * so English stays written in exactly one place.
 */
const tourKeys = Object.fromEntries(
  TOUR_MODULES.flatMap((m) => [
    [`tour.m.${m.id}.title`, m.title],
    [`tour.m.${m.id}.use`, m.use],
    ...m.canDo.map((c, i) => [`tour.m.${m.id}.can${i}`, c]),
    [`tour.m.${m.id}.q`, m.faq.q],
    [`tour.m.${m.id}.a`, m.faq.a],
  ]),
);

const guideKeys = Object.fromEntries(
  Object.entries(MODULE_GUIDES).flatMap(([key, g]) => [
    [`mg.m.${key}.title`, g.title],
    [`mg.m.${key}.purpose`, g.purpose],
    ...g.steps.map((s, i) => [`mg.m.${key}.step${i}`, s]),
    ...g.benefits.map((b, i) => [`mg.m.${key}.benefit${i}`, b]),
  ]),
);

export const en: Record<string, string> = {
  "lang.label": "Language",
  "shell.loading": "Loading…",
  "shell.signOut": "Sign out",
  "nav.dashboard": "Dashboard",
  "nav.interview": "Interview",
  "nav.resume": "Resume",
  "nav.guide": "AI Guide",
  "nav.performance": "Performance",
  "nav.roadmap": "Roadmap",
  "nav.cheatsheet": "Cheat Sheet",

  "dash.welcome": "Welcome back",
  "dash.welcomeName": "Welcome back, {name}",
  "dash.subtitle": "Pick where you want to work today. Everything here feeds one readiness score.",
  "dash.onboardingPrompt": "Finish onboarding to personalise your questions and resume scoring.",
  "dash.completeSetup": "Complete setup",
  "dash.readiness": "Readiness score",
  "dash.readinessHint": "From your latest snapshot",
  "dash.interviews": "Interviews taken",
  "dash.interviewsHint": "Completed sessions",
  "dash.ats": "Last ATS score",
  "dash.atsHint": "Most recent resume check",
  "dash.card.interview.title": "Take an Interview",
  "dash.card.interview.body": "Timed coding or theory round, scored by AI.",
  "dash.card.resume.title": "Get Resume Check",
  "dash.card.resume.body": "Upload a PDF and get an ATS score with fixes.",
  "dash.card.guide.title": "Talk with AI Guide",
  "dash.card.guide.body": "Ask anything about prep, resumes or careers.",
  "dash.card.performance.title": "Performance Dashboard",
  "dash.card.performance.body": "Track readiness, sub-scores and history.",
  "dash.card.roadmap.title": "My Roadmap",
  "dash.card.roadmap.body": "A ranked plan built from your weakest topics.",
  "dash.card.cheatsheet.title": "General Cheat Sheet",
  "dash.card.cheatsheet.body": "Core topics, real problems and a 4-week plan.",
  "dash.card.lla.title": "How It Works (Low-Level Architecture)",
  "dash.card.lla.body": "An interactive map of how every part connects.",
  "dash.card.hla.title": "High-Level Architecture (Developer View)",
  "dash.card.hla.body": "The real data flow, tables and failure handling.",

  "launcher.openTour": "Open the quick tour",
  "launcher.title": "New here? Want a quick tour?",
  "launcher.body":
    "Let us walk you through what each section does — 30 seconds, plain language, no jargon. Sound good?",
  "launcher.yes": "Yes, please",
  "launcher.no": "No, thanks",
  "launcher.close": "Close",

  "tour.progress": "{current} of {total}",
  "tour.skip": "Skip tour",
  "tour.youCan": "You can:",
  "tour.back": "Back",
  "tour.next": "Next",
  "tour.prevAria": "Previous section",
  "tour.nextAria": "Next section",
  "tour.finish": "Finish",
  "tour.finishLast": "Finish — take me to the dashboard",
  ...tourKeys,

  "mg.tooltip": "Need help with this module?",
  "mg.open": "Open module guide",
  "mg.close": "Close module guide",
  "mg.label": "Module guide",
  "mg.panelLabel": "{title} guide",
  "mg.what": "What this is for",
  "mg.how": "How to use it",
  "mg.why": "Why it helps you",
  ...guideKeys,

  "land.signIn": "Sign in",
  "land.eyebrow": "Smart India Hackathon 2026",
  "land.title": "Your AI Placement Mentor",
  "land.lead":
    "Stop guessing where you stand. PlacementAI runs realistic timed interviews, grades every answer against a strict rubric, and turns your weak spots into a study plan you can actually follow.",
  "land.cta": "Get Started",
  "land.f1.title": "Practice Interviews",
  "land.f1.body":
    "Timed mock rounds in C, C++, Python and Java plus DSA, DBMS and OS theory — scored on technical accuracy, communication, completeness and confidence.",
  "land.f2.title": "Resume ATS Check",
  "land.f2.body":
    "Upload your PDF resume and get a 0–100 ATS score with a factor-by-factor breakdown and prioritised fixes.",
  "land.f3.title": "AI Guide & Roadmap",
  "land.f3.body":
    "Your weak topics become a ranked roadmap with practice questions, and the AI Guide answers prep questions in context.",
  "land.footer": "Built for SIH 2026 · PS 26207",
};

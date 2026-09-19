export type TourModule = {
  id: string;
  title: string;
  to: "/interview/setup" | "/resume" | "/guide" | "/performance" | "/roadmap" | "/cheatsheet";
  preview: "timer" | "ring" | "chat" | "chart" | "checklist" | "list";
  use: string;
  canDo: string[];
  faq: { q: string; a: string };
};

export const TOUR_MODULES: TourModule[] = [
  {
    id: "interview",
    title: "Take an Interview",
    to: "/interview/setup",
    preview: "timer",
    use: "Practice a real, timed interview with an AI that judges your answers.",
    canDo: [
      "Pick your role (Software Engineer, ML Engineer, Data Analyst).",
      "Pick your language (C, C++, Python, Java).",
      "Get instant feedback and a score after every round.",
    ],
    faq: {
      q: "Is it timed?",
      a: "Yes — every question gives you a set time, just like a real interview.",
    },
  },
  {
    id: "resume",
    title: "Get Resume Check",
    to: "/resume",
    preview: "ring",
    use: "Upload your resume and instantly see how well it would pass a job filter.",
    canDo: [
      "Upload a PDF resume.",
      "Get a score with numbered, actionable tips.",
      "See what's missing before you apply anywhere.",
    ],
    faq: { q: "What format?", a: "PDF only, under 5MB." },
  },
  {
    id: "guide",
    title: "Talk with AI Guide",
    to: "/guide",
    preview: "chat",
    use: "Ask anything about your preparation and get answers that actually know you.",
    canDo: [
      "Ask questions in plain words.",
      "Get advice based on your progress and weak spots.",
      "Clear the chat anytime.",
    ],
    faq: { q: "Does it remember me?", a: "Yes — it reads your progress before it answers." },
  },
  {
    id: "performance",
    title: "Performance Dashboard",
    to: "/performance",
    preview: "chart",
    use: "See how you're improving over time, all in one place.",
    canDo: [
      "Watch your readiness score trend.",
      "See which topics are strong and which are weak.",
      "Review your full interview history.",
    ],
    faq: { q: "Why does it matter?", a: "It shows exactly where to spend your next hour." },
  },
  {
    id: "roadmap",
    title: "Roadmap",
    to: "/roadmap",
    preview: "checklist",
    use: "A personal to-do list that tells you what to study next.",
    canDo: [
      "Follow a step-by-step checklist built from your weak areas.",
      "Open practice questions and resources.",
      "Regenerate the plan when your results change.",
    ],
    faq: { q: "How is it built?", a: "From your own results — not a generic plan." },
  },
  {
    id: "cheatsheet",
    title: "General Cheat Sheet",
    to: "/cheatsheet",
    preview: "list",
    use: "A one-stop cheat sheet for your target role.",
    canDo: [
      "See topics to study, problems to practice, and project ideas.",
      "Switch between the three roles.",
      "Spot your weak areas highlighted for you.",
    ],
    faq: { q: "Is it for beginners?", a: "Yes — it's built for anyone starting from zero." },
  },
];

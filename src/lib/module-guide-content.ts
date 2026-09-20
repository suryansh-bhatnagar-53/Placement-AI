export type ModuleGuideKey =
  | "interview"
  | "resume"
  | "guide"
  | "performance"
  | "roadmap"
  | "cheatsheet";

export type ModuleGuideContent = {
  title: string;
  behavior: "shift" | "fade";
  purpose: string;
  steps: string[];
  benefits: string[];
};

export const MODULE_GUIDES: Record<ModuleGuideKey, ModuleGuideContent> = {
  interview: {
    title: "Take an Interview",
    behavior: "shift",
    purpose: "A timed practice interview that scores each answer and shows what you can improve.",
    steps: [
      "Pick the role you are preparing for.",
      "Choose one or more languages.",
      "Choose a coding or writing round.",
      "Write your answer before the timer ends, then submit it.",
      "Open your report after the last question.",
    ],
    benefits: [
      "Practice real pressure before the real interview.",
      "See which parts of every answer need work.",
      "Build confidence by repeating focused rounds.",
    ],
  },
  resume: {
    title: "Get Resume Check",
    behavior: "shift",
    purpose: "A quick check of how well your PDF resume may pass a company’s first job filter.",
    steps: [
      "Choose Upload resume and select a PDF file.",
      "Wait while the resume is checked.",
      "Read your overall score and score breakdown.",
      "Work through the numbered fixes, starting at the top.",
      "Upload the improved version to compare it with the last one.",
    ],
    benefits: [
      "Fix important problems before sending applications.",
      "Know which changes can improve your score first.",
      "Track whether each new version is stronger.",
    ],
  },
  guide: {
    title: "Talk with AI Guide",
    behavior: "shift",
    purpose: "A chat assistant that knows your progress and answers your preparation questions.",
    steps: [
      "Type one clear question in the message box.",
      "Choose Send and read the complete answer.",
      "Ask a follow-up if you need a simpler or deeper explanation.",
      "Choose Clear chat when you want a fresh conversation.",
    ],
    benefits: [
      "Get guidance shaped by your own scores and weak areas.",
      "Turn confusion into a clear next step.",
      "Ask follow-up questions instead of searching in many places.",
    ],
  },
  performance: {
    title: "Performance Dashboard",
    behavior: "fade",
    purpose: "Your progress report, showing scores, trends, topic strengths, and past interviews.",
    steps: [
      "Check your latest readiness and skill scores.",
      "Follow the readiness line to see how you are changing over time.",
      "Compare your stronger and weaker topics.",
      "Open a completed interview from the history list to read its report.",
    ],
    benefits: [
      "Know exactly where to spend your next study hour.",
      "See whether your practice is producing better results.",
      "Return to earlier feedback whenever you need it.",
    ],
  },
  roadmap: {
    title: "My Roadmap",
    behavior: "fade",
    purpose: "A personal checklist that tells you what to study next, based on your recent results.",
    steps: [
      "Start with the highest-priority checklist item.",
      "Open its resources and practice questions.",
      "Tick the item when you finish it.",
      "Choose Regenerate when new interview results are available.",
    ],
    benefits: [
      "Always have a clear next task instead of wondering what to do.",
      "Focus first on the topics that need the most attention.",
      "See your progress as the checklist fills up.",
    ],
  },
  cheatsheet: {
    title: "General Cheat Sheet",
    behavior: "fade",
    purpose: "A one-stop reference for your chosen role, with topics, problems, and project ideas.",
    steps: [
      "Choose the role you want to prepare for.",
      "Open a topic section to read its key points.",
      "Follow the practice links for hands-on work.",
      "Use the project ideas and study plan to keep moving.",
    ],
    benefits: [
      "Start with a clear map instead of random searching.",
      "Keep important revision material in one place.",
      "Find useful practice and project ideas quickly.",
    ],
  },
};

export function getModuleGuideKey(pathname: string): ModuleGuideKey | null {
  if (pathname.startsWith("/interview/")) return "interview";
  if (pathname === "/resume") return "resume";
  if (pathname === "/guide") return "guide";
  if (pathname === "/performance") return "performance";
  if (pathname === "/roadmap") return "roadmap";
  if (pathname === "/cheatsheet") return "cheatsheet";
  return null;
}
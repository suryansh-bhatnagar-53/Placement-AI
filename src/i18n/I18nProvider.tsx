import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { mr } from "./locales/mr";
import { te } from "./locales/te";
import { ta } from "./locales/ta";
import { bn } from "./locales/bn";

export const LANGUAGES = [
  { code: "en", native: "English" },
  { code: "hi", native: "हिंदी" },
  { code: "mr", native: "मराठी" },
  { code: "te", native: "తెలుగు" },
  { code: "ta", native: "தமிழ்" },
  { code: "bn", native: "বাংলা" },
] as const;
export type LangCode = (typeof LANGUAGES)[number]["code"];

const DICTS: Record<LangCode, Partial<Record<string, string>>> = { en, hi, mr, te, ta, bn };
const STORAGE_KEY = "placementai.lang";
const isLang = (v: unknown): v is LangCode => LANGUAGES.some((l) => l.code === v);

export type Vars = Record<string, string | number>;

/** Look up a key: chosen language → English → the key's English text never missing. */
export function translate(lang: LangCode, key: string, vars?: Vars): string {
  const raw = DICTS[lang][key] ?? en[key] ?? key;
  if (!vars) return raw;
  // Replace only placeholders we were given; unknown ones are left untouched.
  return raw.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in vars ? String(vars[name]) : m,
  );
}

type Ctx = { lang: LangCode; setLang: (l: LangCode) => void; t: (key: string, vars?: Vars) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // Restore after hydration (localStorage first, then the signed-in profile).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) setLangState(stored);

    const syncFromProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("ui_language")
        .eq("id", userId)
        .maybeSingle();
      const remote = (data as { ui_language?: string } | null)?.ui_language;
      const local = localStorage.getItem(STORAGE_KEY);
      if (isLang(remote) && remote !== "en") {
        setLangState(remote);
        localStorage.setItem(STORAGE_KEY, remote);
      } else if (isLang(local) && local !== remote) {
        // Chosen before signing in: carry it onto the profile.
        await supabase.from("profiles").update({ ui_language: local } as never).eq("id", userId);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void syncFromProfile(session.user.id);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    void supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id;
      if (id) void supabase.from("profiles").update({ ui_language: next } as never).eq("id", id);
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, setLang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

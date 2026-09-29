import { Languages } from "lucide-react";
import { LANGUAGES, useI18n, type LangCode } from "@/i18n/I18nProvider";

/** Slim bar rendered once in the root layout, so it sits above every screen. */
export function LanguageBar() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="border-b border-border bg-card/60">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-1">
        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">{t("lang.label")}</span>
          <select
            aria-label={t("lang.label")}
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} lang={l.code}>
                {l.native}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

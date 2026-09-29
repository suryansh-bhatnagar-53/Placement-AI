import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, LogOut } from "lucide-react";
import { ModulePageGuide } from "@/components/ModulePageGuide";
import { getModuleGuideKey } from "@/lib/module-guide-content";
import { useI18n } from "@/i18n/I18nProvider";
import { ProfileAvatarButton } from "@/components/ProfileAvatarButton";

const NAV = [
  { to: "/dashboard", label: "nav.dashboard" },
  { to: "/interview/setup", label: "nav.interview" },
  { to: "/resume", label: "nav.resume" },
  { to: "/guide", label: "nav.guide" },
  { to: "/performance", label: "nav.performance" },
  { to: "/roadmap", label: "nav.roadmap" },
  { to: "/cheatsheet", label: "nav.cheatsheet" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const moduleGuideKey = getModuleGuideKey(pathname);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: { mode: "login" } });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {t("shell.loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="tracking-tight">PlacementAI</span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>
          <ProfileAvatarButton />
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> {t("shell.signOut")}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {moduleGuideKey ? (
          <ModulePageGuide key={moduleGuideKey} moduleKey={moduleGuideKey}>
            {children}
          </ModulePageGuide>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

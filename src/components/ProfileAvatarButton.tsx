import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUserProfile } from "@/lib/user-profile.functions";
import { initialsOf, useAvatarUrl } from "@/lib/avatar";
import { StatBars } from "@/components/IdentityCard";
import { archetypeMeaning } from "@/lib/identity-badge";

export function ProfileAvatarButton() {
  const load = useServerFn(getUserProfile);
  const { data } = useQuery({ queryKey: ["user-profile"], queryFn: () => load() });
  const photo = useAvatarUrl(data?.profile?.avatar_url);
  const name = data?.profile?.name || data?.email || "";
  const initials = initialsOf(name);
  const identity = data?.identity ?? null;

  return (
    <div className="group relative">
      <Link
        to="/profile"
        aria-label="Open your profile"
        title="Your profile"
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-sm font-semibold text-foreground transition-colors hover:border-primary focus:border-primary focus:outline-none"
      >
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </Link>

      {identity ? (
        <div className="pointer-events-none absolute right-0 top-11 z-50 hidden w-64 rounded-lg border border-border bg-card p-4 shadow-lg group-hover:block group-focus-within:block">
          <p className="text-sm font-semibold">{name}</p>
          <span className="mt-1 inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            {identity.archetype}
          </span>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {archetypeMeaning(identity.archetype)}
          </p>
          <div className="mt-3">
            <StatBars identity={identity} compact />
          </div>
        </div>
      ) : null}
    </div>
  );
}

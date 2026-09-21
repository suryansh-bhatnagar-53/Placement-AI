import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUserProfile } from "@/lib/user-profile.functions";
import { initialsOf, useAvatarUrl } from "@/lib/avatar";

export function ProfileAvatarButton() {
  const load = useServerFn(getUserProfile);
  const { data } = useQuery({ queryKey: ["user-profile"], queryFn: () => load() });
  const photo = useAvatarUrl(data?.profile?.avatar_url);
  const initials = initialsOf(data?.profile?.name || data?.email);

  return (
    <Link
      to="/profile"
      aria-label="Open your profile"
      title="Your profile"
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-sm font-semibold text-foreground transition-colors hover:border-primary"
    >
      {photo ? (
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </Link>
  );
}

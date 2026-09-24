import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeShelf, CuriousMindMark } from "@/components/TraitBadge";
import { getMyBadges } from "@/lib/badges.functions";
import type { Trait } from "@/lib/badge-interview-content";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import {
  ALLOWED_AVATAR_TYPES,
  AVATAR_BUCKET,
  MAX_AVATAR_BYTES,
  initialsOf,
  useAvatarUrl,
} from "@/lib/avatar";
import { getUserProfile, saveUserProfile } from "@/lib/user-profile.functions";
import { IdentityCard } from "@/components/IdentityCard";
import { LANGUAGES, ROLES } from "@/lib/onboarding-content";
import { User, GraduationCap, Wrench, Briefcase, Plus, X, Check } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — PlacementAI" },
      {
        name: "description",
        content: "Add your photo, contact details, studies, skills and projects to PlacementAI.",
      },
      { property: "og:title", content: "Your profile — PlacementAI" },
      {
        property: "og:description",
        content: "Add your photo, contact details, studies, skills and projects to PlacementAI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <ProfilePage />
    </AppShell>
  ),
});

type Project = { name: string; url: string };
type ExtraLink = { label: string; url: string };

type Form = {
  name: string;
  avatar_url: string | null;
  phone: string;
  country: string;
  state: string;
  city: string;
  college: string;
  degree: string;
  specialization: string;
  graduation_year: string;
  target_role: string;
  preferred_languages: string[];
  programming_languages: string[];
  core_subjects: string[];
  additional_skills: string[];
  certificates: string[];
  projects: Project[];
  linkedin_url: string;
  additional_links: ExtraLink[];
};

const EMPTY: Form = {
  name: "",
  avatar_url: null,
  phone: "",
  country: "",
  state: "",
  city: "",
  college: "",
  degree: "",
  specialization: "",
  graduation_year: "",
  target_role: "",
  preferred_languages: [],
  programming_languages: [],
  core_subjects: [],
  additional_skills: [],
  certificates: [],
  projects: [],
  linkedin_url: "",
  additional_links: [],
};

const CATEGORIES = [
  { key: "personal", label: "Personal details", icon: User },
  { key: "academic", label: "Studies", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "experience", label: "Experience", icon: Briefcase },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

const FIELDS_BY_CATEGORY: Record<CategoryKey, (keyof Form)[]> = {
  personal: ["name", "avatar_url", "phone", "country", "state", "city"],
  academic: ["college", "degree", "specialization", "graduation_year"],
  skills: [
    "target_role",
    "preferred_languages",
    "programming_languages",
    "core_subjects",
    "additional_skills",
  ],
  experience: ["certificates", "projects", "linkedin_url", "additional_links"],
};

const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function ListEditor({
  label,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="mt-1 flex gap-2">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={add}
          aria-label={`Add to ${label}`}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:border-primary"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Nothing added yet.</p>
      )}
    </div>
  );
}

function PairEditor<T extends Project | ExtraLink>({
  label,
  items,
  keys,
  placeholders,
  empty,
  onChange,
}: {
  label: string;
  items: T[];
  keys: [keyof T & string, keyof T & string];
  placeholders: [string, string];
  empty: T;
  onChange: (next: T[]) => void;
}) {
  const update = (i: number, key: keyof T & string, value: string) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="mt-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={String(item[keys[0]] ?? "")}
              placeholder={placeholders[0]}
              onChange={(e) => update(i, keys[0], e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              value={String(item[keys[1]] ?? "")}
              placeholder={placeholders[1]}
              onChange={(e) => update(i, keys[1], e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              aria-label={`Remove entry ${i + 1}`}
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing added yet.</p>
        ) : null}
        <button
          type="button"
          onClick={() => onChange([...items, { ...empty }])}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:border-primary"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}

function ProfilePage() {
  const load = useServerFn(getUserProfile);
  const save = useServerFn(saveUserProfile);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["user-profile"], queryFn: () => load() });
  const loadBadges = useServerFn(getMyBadges);
  const { data: badgeData } = useQuery({ queryKey: ["my-badges"], queryFn: () => loadBadges() });

  const [category, setCategory] = useState<CategoryKey>("personal");
  const [form, setForm] = useState<Form>(EMPTY);
  const [saved, setSaved] = useState<CategoryKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = data?.profile;
    if (!p) return;
    setForm({
      name: p.name ?? "",
      avatar_url: p.avatar_url ?? null,
      phone: p.phone ?? "",
      country: p.country ?? "",
      state: p.state ?? "",
      city: p.city ?? "",
      college: p.college ?? "",
      degree: p.degree ?? "",
      specialization: p.specialization ?? "",
      graduation_year: p.graduation_year ?? "",
      target_role: p.target_role ?? "",
      preferred_languages: strList(p.preferred_languages),
      programming_languages: strList(p.programming_languages),
      core_subjects: strList(p.core_subjects),
      additional_skills: strList(p.additional_skills),
      certificates: strList(p.certificates),
      projects: Array.isArray(p.projects) ? (p.projects as unknown as Project[]) : [],
      linkedin_url: p.linkedin_url ?? "",
      additional_links: Array.isArray(p.additional_links)
        ? (p.additional_links as unknown as ExtraLink[])
        : [],
    });
  }, [data]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const photo = useAvatarUrl(form.avatar_url);
  const initials = useMemo(() => initialsOf(form.name || data?.email), [form.name, data?.email]);

  async function onPickPhoto(file: File) {
    setPhotoError("");
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setPhotoError("Please pick a JPG, PNG, WEBP or GIF image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setPhotoError("That image is bigger than 5 MB. Please pick a smaller one.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${uid}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) {
      setPhotoError("We couldn't upload that photo. Please try again.");
      return;
    }
    set("avatar_url", path);
    await save({ data: { avatar_url: path } });
    queryClient.invalidateQueries({ queryKey: ["user-profile"] });
  }

  async function removePhoto() {
    set("avatar_url", null);
    await save({ data: { avatar_url: null } });
    queryClient.invalidateQueries({ queryKey: ["user-profile"] });
  }

  async function saveCategory() {
    setSaving(true);
    const patch: Record<string, unknown> = {};
    for (const key of FIELDS_BY_CATEGORY[category]) patch[key] = form[key];
    try {
      await save({ data: patch as never });
      setSaved(category);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setTimeout(() => setSaved(null), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add as much or as little as you like — everything here is optional.
      </p>

      {data?.identity ? (
        <IdentityCard
          identity={data.identity}
          photo={photo}
          initials={initials}
          name={form.name}
          nameAddon={<CuriousMindMark unlocked={Boolean(badgeData?.curious_mind)} />}
        />
      ) : null}

      <section className="mt-4 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Trait badges</h2>
            <p className="text-sm text-muted-foreground">
              {(badgeData?.earned.length ?? 0) === 5
                ? "All five earned — you've unlocked the Curious Mind badge."
                : "Earn all 5 badges to unlock the Curious Mind badge."}
            </p>
          </div>
          <Link to="/badge-interview" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Take a Badge Interview
          </Link>
        </div>
        <div className="mt-4">
          <BadgeShelf earned={(badgeData?.earned ?? []) as Trait[]} />
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <nav className="flex gap-2 overflow-x-auto md:w-56 md:flex-col md:overflow-visible">
          {CATEGORIES.map((c) => {
            const active = c.key === category;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <c.icon className="h-4 w-4" /> {c.label}
              </button>
            );
          })}
        </nav>

        <section className="flex-1 rounded-lg border border-border bg-card p-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              {category === "personal" ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-lg font-semibold">
                      {photo ? (
                        <img src={photo} alt="Your profile photo" className="h-full w-full object-cover" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="rounded-md border border-border px-3 py-2 text-sm hover:border-primary"
                      >
                        {form.avatar_url ? "Change photo" : "Add a photo"}
                      </button>
                      {form.avatar_url ? (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Remove
                        </button>
                      ) : null}
                      <input
                        ref={fileRef}
                        type="file"
                        accept={ALLOWED_AVATAR_TYPES.join(",")}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void onPickPhoto(file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                  {photoError ? <p className="text-sm text-destructive">{photoError}</p> : null}

                  <Field
                    label="Full name"
                    value={form.name}
                    placeholder="Add your full name"
                    onChange={(v) => set("name", v)}
                  />
                  <label className="block">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <input
                      value={data?.email ?? ""}
                      readOnly
                      className="mt-1 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground"
                    />
                  </label>
                  <Field
                    label="Phone number"
                    value={form.phone}
                    placeholder="Add your phone number"
                    onChange={(v) => set("phone", v)}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label="Country"
                      value={form.country}
                      placeholder="Add your country"
                      onChange={(v) => set("country", v)}
                    />
                    <Field
                      label="State"
                      value={form.state}
                      placeholder="Add your state"
                      onChange={(v) => set("state", v)}
                    />
                    <Field
                      label="City"
                      value={form.city}
                      placeholder="Add your city"
                      onChange={(v) => set("city", v)}
                    />
                  </div>
                </div>
              ) : null}

              {category === "academic" ? (
                <div className="space-y-5">
                  <Field
                    label="College or university"
                    value={form.college}
                    placeholder="Add where you study"
                    onChange={(v) => set("college", v)}
                  />
                  <Field
                    label="Degree"
                    value={form.degree}
                    placeholder="Add your degree"
                    onChange={(v) => set("degree", v)}
                  />
                  <Field
                    label="Specialization"
                    value={form.specialization}
                    placeholder="Add your branch or specialization"
                    onChange={(v) => set("specialization", v)}
                  />
                  <Field
                    label="Finishing year"
                    value={form.graduation_year}
                    placeholder="Add the year you expect to finish"
                    onChange={(v) => set("graduation_year", v)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We filled these in from your setup answers — change anything that's not right.
                  </p>
                </div>
              ) : null}

              {category === "skills" ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-sm text-muted-foreground">The job you're aiming for</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => set("target_role", r.value)}
                          aria-pressed={form.target_role === r.value}
                          className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                            form.target_role === r.value
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {r.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Language used in your practice interviews
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {LANGUAGES.map((l) => {
                        const on = form.preferred_languages.includes(l.value);
                        return (
                          <button
                            key={l.value}
                            type="button"
                            aria-pressed={on}
                            onClick={() =>
                              set(
                                "preferred_languages",
                                on
                                  ? form.preferred_languages.filter((x) => x !== l.value)
                                  : [...form.preferred_languages, l.value],
                              )
                            }
                            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                              on
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {l.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Changing this updates your practice interviews straight away.
                    </p>
                  </div>
                  <ListEditor
                    label="Programming languages"
                    placeholder="Add a language, e.g. Python"
                    items={form.programming_languages}
                    onChange={(v) => set("programming_languages", v)}
                  />
                  <ListEditor
                    label="Core subjects you know"
                    placeholder="Add a subject, e.g. Databases"
                    items={form.core_subjects}
                    onChange={(v) => set("core_subjects", v)}
                  />
                  <ListEditor
                    label="Other skills"
                    placeholder="Add a skill, e.g. Public speaking"
                    items={form.additional_skills}
                    onChange={(v) => set("additional_skills", v)}
                  />
                </div>
              ) : null}

              {category === "experience" ? (
                <div className="space-y-6">
                  <ListEditor
                    label="Certificates"
                    placeholder="Add a certificate name"
                    items={form.certificates}
                    onChange={(v) => set("certificates", v)}
                  />
                  <PairEditor<Project>
                    label="Projects"
                    items={form.projects}
                    keys={["name", "url"]}
                    placeholders={["Project name", "Link to the code (optional)"]}
                    empty={{ name: "", url: "" }}
                    onChange={(v) => set("projects", v)}
                  />
                  <Field
                    label="LinkedIn"
                    value={form.linkedin_url}
                    placeholder="Add your LinkedIn link"
                    onChange={(v) => set("linkedin_url", v)}
                  />
                  <PairEditor<ExtraLink>
                    label="Other links"
                    items={form.additional_links}
                    keys={["label", "url"]}
                    placeholders={["What is it?", "Paste the link"]}
                    empty={{ label: "", url: "" }}
                    onChange={(v) => set("additional_links", v)}
                  />
                </div>
              ) : null}

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveCategory}
                  disabled={saving}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                {saved === category ? (
                  <span
                    aria-live="polite"
                    className="inline-flex items-center gap-1 text-sm text-primary"
                  >
                    <Check className="h-4 w-4" /> Saved
                  </span>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

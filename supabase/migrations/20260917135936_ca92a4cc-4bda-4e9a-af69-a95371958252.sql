ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS college text,
  ADD COLUMN IF NOT EXISTS course text,
  ADD COLUMN IF NOT EXISTS year_of_study text,
  ADD COLUMN IF NOT EXISTS personality_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS archetype text,
  ADD COLUMN IF NOT EXISTS stat_adaptability integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_resilience integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_focus integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamp with time zone;
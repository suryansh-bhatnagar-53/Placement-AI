CREATE TABLE public.badge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  top_trait text NOT NULL,
  newly_earned boolean NOT NULL DEFAULT false,
  skipped_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badge_attempts TO authenticated;
GRANT ALL ON public.badge_attempts TO service_role;
ALTER TABLE public.badge_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own badge attempts" ON public.badge_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_badges (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  earned jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  curious_mind boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
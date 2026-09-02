CREATE TABLE public.roadmap_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  action TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  practice_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_items TO authenticated;
GRANT ALL ON public.roadmap_items TO service_role;

ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own roadmap items"
ON public.roadmap_items FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX roadmap_items_user_idx ON public.roadmap_items (user_id, priority);
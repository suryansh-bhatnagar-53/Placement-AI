CREATE TABLE public.interview_role_config (
  role text PRIMARY KEY CHECK (role IN ('SE','ML','DA','PM','BA','CE')),
  title text NOT NULL,
  description text NOT NULL,
  uses_code boolean NOT NULL DEFAULT false,
  rounds jsonb NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.interview_role_config TO authenticated;
GRANT ALL ON public.interview_role_config TO service_role;
ALTER TABLE public.interview_role_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role config readable" ON public.interview_role_config FOR SELECT TO authenticated USING (true);

INSERT INTO public.interview_role_config (role, title, description, uses_code, rounds, sort_order) VALUES
('SE','Software Engineer','Builds and maintains software. Balanced on data structures, operating systems and databases.',true,'["coding","writing","case_study","domain_quiz"]',1),
('ML','ML Engineer','Turns data into working machine-learning models, with Python, algorithms and system basics.',true,'["coding","writing","case_study","domain_quiz"]',2),
('DA','Data Analyst','Finds answers in data using statistics and SQL, and explains them in plain language.',false,'["writing","case_study","behavioral","domain_quiz"]',3),
('PM','Product Manager','Decides what to build and why, balancing users, business goals and the team''s time.',false,'["writing","case_study","behavioral","domain_quiz"]',4),
('BA','Business Analyst','Connects business needs to solutions by mapping processes, gathering requirements and reading data.',false,'["writing","case_study","behavioral","domain_quiz"]',5),
('CE','Cloud Engineer','Designs and runs systems in the cloud, covering networking, DevOps and security basics.',true,'["coding","writing","case_study","domain_quiz"]',6);
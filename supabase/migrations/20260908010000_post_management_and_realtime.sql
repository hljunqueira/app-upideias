-- Migration: Post Management, Visual Diagnosis & Realtime Approvals
-- Allows content_approvals to store direct post suggestions from specialist or agent

ALTER TABLE public.content_approvals ALTER COLUMN content_idea_id DROP NOT NULL;

ALTER TABLE public.content_approvals
  ADD COLUMN IF NOT EXISTS origin text DEFAULT 'specialist' CHECK (origin IN ('agent', 'specialist')),
  ADD COLUMN IF NOT EXISTS post_media_id text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS format text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS visual_diagnosis jsonb,
  ADD COLUMN IF NOT EXISTS specialist_notes text;

CREATE INDEX IF NOT EXISTS idx_content_approvals_user_status ON public.content_approvals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_approvals_origin ON public.content_approvals(origin);

-- Enable Supabase Realtime for content_approvals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'content_approvals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.content_approvals;
  END IF;
END $$;

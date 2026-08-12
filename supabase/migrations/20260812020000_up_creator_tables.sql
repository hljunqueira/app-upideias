-- Migração Relacional UP Creator: Cursos, Trilhas, Módulos, Aulas e Progresso

CREATE TABLE IF NOT EXISTS public.learning_trails (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#ff5368',
  badge TEXT DEFAULT 'Essencial',
  recommended_order INT DEFAULT 1,
  video_intro_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  track TEXT NOT NULL,
  tag TEXT DEFAULT 'Geral',
  lesson_info TEXT,
  progress INT DEFAULT 0,
  thumbnail_url TEXT,
  video_teaser_url TEXT,
  level TEXT DEFAULT 'Iniciante',
  xp_reward INT DEFAULT 350,
  is_landing_page_featured BOOLEAN DEFAULT true,
  is_recommended_first BOOLEAN DEFAULT false,
  access_tier TEXT DEFAULT 'Grátis',
  order_index INT DEFAULT 1,
  status TEXT DEFAULT 'published',
  modules_count INT DEFAULT 1,
  lessons_count INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_provider TEXT DEFAULT 'youtube',
  duration_minutes INT DEFAULT 12,
  is_free_preview BOOLEAN DEFAULT false,
  xp_points INT DEFAULT 50,
  order_index INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percent INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  total_xp_earned INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT true,
  watched_seconds INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- RLS
ALTER TABLE public.learning_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public all learning_trails" ON public.learning_trails FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public all courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public all modules" ON public.modules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public all lessons" ON public.lessons FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "User select user_course_progress" ON public.user_course_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "User insert user_course_progress" ON public.user_course_progress FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "User select user_lesson_progress" ON public.user_lesson_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "User insert user_lesson_progress" ON public.user_lesson_progress FOR ALL TO anon, authenticated USING (true);

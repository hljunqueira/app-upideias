-- Migration: 20260812030000_notifications_table.sql
-- Tabela de notificacoes reais do sistema (Admin e Assinante)

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('admin', 'user')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    link TEXT,
    unread BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de notificacoes" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "Permitir insercao de notificacoes" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizacao de notificacoes" ON public.notifications
    FOR UPDATE USING (true);

CREATE POLICY "Permitir remocao de notificacoes" ON public.notifications
    FOR DELETE USING (true);

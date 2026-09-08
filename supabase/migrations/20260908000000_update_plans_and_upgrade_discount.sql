-- Migration: Atualização da grade oficial de planos e adição do controle de desconto de 1º ciclo
-- 1. Coluna de controle de desconto de upgrade de primeiro ciclo
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS has_used_upgrade_discount BOOLEAN DEFAULT false;

-- 2. Upsert dos 4 Planos Oficiais (Iniciante, Premium, Pro, Enterprise)
-- Desativar o antigo plano agencia se existir
UPDATE public.plans SET is_active = false WHERE slug = 'agencia';

-- Plano 1: Iniciante (R$ 54,90 / R$ 549,00)
INSERT INTO public.plans (slug, name, description, monthly_price_cents, annual_price_cents, is_featured, is_active, sort_order)
VALUES (
  'iniciante',
  'Iniciante',
  'Ideal para quem está começando e quer validar sua presença com dados reais.',
  5490,
  54900,
  false,
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price_cents = EXCLUDED.monthly_price_cents,
  annual_price_cents = EXCLUDED.annual_price_cents,
  is_featured = EXCLUDED.is_featured,
  is_active = true,
  sort_order = EXCLUDED.sort_order;

-- Plano 2: Premium (R$ 79,90 / R$ 799,00)
INSERT INTO public.plans (slug, name, description, monthly_price_cents, annual_price_cents, is_featured, is_active, sort_order)
VALUES (
  'premium',
  'Premium',
  'Para criadores que buscam consistência, planejamento visual e ritmo constante de postagens.',
  7990,
  79900,
  false,
  true,
  2
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price_cents = EXCLUDED.monthly_price_cents,
  annual_price_cents = EXCLUDED.annual_price_cents,
  is_featured = EXCLUDED.is_featured,
  is_active = true,
  sort_order = EXCLUDED.sort_order;

-- Plano 3: Pro (R$ 179,90 / R$ 1.799,00 - Destaque Mais Popular)
INSERT INTO public.plans (slug, name, description, monthly_price_cents, annual_price_cents, is_featured, is_active, sort_order)
VALUES (
  'pro',
  'Pro',
  'A ferramenta definitiva para operações sérias, múltiplos perfis e fluxo de aprovação com clientes.',
  17990,
  179900,
  true,
  true,
  3
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price_cents = EXCLUDED.monthly_price_cents,
  annual_price_cents = EXCLUDED.annual_price_cents,
  is_featured = true,
  is_active = true,
  sort_order = EXCLUDED.sort_order;

-- Plano 4: Enterprise (Sob Consulta)
INSERT INTO public.plans (slug, name, description, monthly_price_cents, annual_price_cents, is_featured, is_active, sort_order)
VALUES (
  'enterprise',
  'Enterprise',
  'Operações corporativas, grandes marcas e agências com demandas sob medida e suporte prioritário.',
  0,
  0,
  false,
  true,
  4
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price_cents = EXCLUDED.monthly_price_cents,
  annual_price_cents = EXCLUDED.annual_price_cents,
  is_featured = false,
  is_active = true,
  sort_order = EXCLUDED.sort_order;

-- 3. Atualizar / Inserir Limites em plan_limits
-- Iniciante: 1 conta Instagram, 30 dias de histórico, 1 usuário, 0 clientes
INSERT INTO public.plan_limits (plan_id, max_instagram_accounts, history_days, max_users, max_clients, max_scheduled_posts, max_ai_requests_month, max_whatsapp_messages_month)
SELECT id, 1, 30, 1, 0, 10, 0, 0
FROM public.plans WHERE slug = 'iniciante'
ON CONFLICT (plan_id) DO UPDATE SET
  max_instagram_accounts = 1,
  history_days = 30,
  max_users = 1,
  max_clients = 0,
  max_ai_requests_month = 0,
  max_whatsapp_messages_month = 0;

-- Premium: 2 contas Instagram, 60 dias de histórico, 2 usuários, 0 clientes
INSERT INTO public.plan_limits (plan_id, max_instagram_accounts, history_days, max_users, max_clients, max_scheduled_posts, max_ai_requests_month, max_whatsapp_messages_month)
SELECT id, 2, 60, 2, 0, 30, 0, 0
FROM public.plans WHERE slug = 'premium'
ON CONFLICT (plan_id) DO UPDATE SET
  max_instagram_accounts = 2,
  history_days = 60,
  max_users = 2,
  max_clients = 0,
  max_ai_requests_month = 0,
  max_whatsapp_messages_month = 0;

-- Pro: 5 contas Instagram, 90 dias de histórico, 5 usuários, 1 cliente / aprovação
INSERT INTO public.plan_limits (plan_id, max_instagram_accounts, history_days, max_users, max_clients, max_scheduled_posts, max_ai_requests_month, max_whatsapp_messages_month)
SELECT id, 5, 90, 5, 1, 100, 0, 0
FROM public.plans WHERE slug = 'pro'
ON CONFLICT (plan_id) DO UPDATE SET
  max_instagram_accounts = 5,
  history_days = 90,
  max_users = 5,
  max_clients = 1,
  max_ai_requests_month = 0,
  max_whatsapp_messages_month = 0;

-- Enterprise: Contas ilimitadas (-1), histórico ilimitado (-1), usuários ilimitados (-1), clientes ilimitados (-1)
INSERT INTO public.plan_limits (plan_id, max_instagram_accounts, history_days, max_users, max_clients, max_scheduled_posts, max_ai_requests_month, max_whatsapp_messages_month)
SELECT id, -1, -1, -1, -1, -1, 0, 0
FROM public.plans WHERE slug = 'enterprise'
ON CONFLICT (plan_id) DO UPDATE SET
  max_instagram_accounts = -1,
  history_days = -1,
  max_users = -1,
  max_clients = -1,
  max_ai_requests_month = 0,
  max_whatsapp_messages_month = 0;

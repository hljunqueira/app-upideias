-- Seed data for UP Analytics by UpIdeias

-- 1. Insert Plans
INSERT INTO plans (id, slug, name, description, monthly_price_cents, annual_price_cents, trial_days, is_featured, is_active, sort_order) VALUES
('b30349b1-5911-4700-8438-e67c9c049ee6', 'iniciante', 'Iniciante', 'Ideal para criadores e marcas iniciando no Instagram.', 2900, 29000, 7, false, true, 1),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'pro', 'Pro', 'O plano completo para crescer com análise estratégica de IA e relatórios.', 7900, 79000, 7, true, true, 2),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'agencia', 'Agência', 'Para agências e gestores que atendem múltiplos clientes e precisam de aprovação.', 19900, 199000, 7, false, true, 3)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Plan Limits
INSERT INTO plan_limits (plan_id, max_instagram_accounts, max_users, max_ai_requests_month, history_days, max_clients, max_scheduled_posts, max_whatsapp_messages_month) VALUES
-- Iniciante
('b30349b1-5911-4700-8438-e67c9c049ee6', 1, 1, 15, 15, 0, 5, 0),
-- Pro
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 3, 2, 100, 90, 0, 30, 150),
-- Agência
('6e287ff1-789a-41ab-85b4-c38d47be442d', 10, 5, 500, 180, 10, 100, 1000)
ON CONFLICT DO NOTHING;

-- 3. Insert Plan Features
INSERT INTO plan_features (plan_id, feature_key, feature_name, feature_description, is_enabled, limit_value) VALUES
-- Iniciante features
('b30349b1-5911-4700-8438-e67c9c049ee6', 'dashboard_basic', 'Dashboard Básico', 'Visualização de métricas básicas do perfil.', true, NULL),
('b30349b1-5911-4700-8438-e67c9c049ee6', 'instagram_metrics', 'Métricas de Perfil', 'Acesso a métricas do Instagram.', true, NULL),
('b30349b1-5911-4700-8438-e67c9c049ee6', 'up_creator_basic', 'UP Creator Básico', 'Acesso a cursos de introdução do UP Creator.', true, NULL),

-- Pro features
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'dashboard_full', 'Dashboard Completo', 'Visualização detalhada e relatórios dinâmicos.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'instagram_metrics', 'Métricas de Perfil', 'Acesso a métricas do Instagram.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'post_metrics', 'Métricas de Posts Individuais', 'Análise profunda por publicação.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'ai_insights', 'Diagnósticos e Insights de IA', 'Relatórios estratégicos inteligentes gerados por IA.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'content_generator', 'Gerador de Conteúdo com IA', 'Crie hooks, captions, CTAs e roteiros de Reels.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'content_calendar', 'Calendário Editorial', 'Agende e planeje posts.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'content_library', 'Biblioteca de Ideias', 'Guarde rascunhos, hashtags e CTAs.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'whatsapp_weekly_report', 'Relatório Semanal no WhatsApp', 'Resumo de métricas direto no WhatsApp.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'whatsapp_alerts', 'Alertas Inteligentes', 'Alertas de queda de alcance no WhatsApp.', true, NULL),
('2d8a56b2-6014-4112-9c12-70b55502c3bb', 'up_creator_intermediate', 'UP Creator Pro', 'Acesso a cursos estratégicos avançados.', true, NULL),

-- Agência features
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'dashboard_full', 'Dashboard Completo', 'Visualização detalhada e relatórios dinâmicos.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'instagram_metrics', 'Métricas de Perfil', 'Acesso a métricas do Instagram.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'post_metrics', 'Métricas de Posts Individuais', 'Análise profunda por publicação.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'ai_insights', 'Diagnósticos e Insights de IA', 'Relatórios estratégicos inteligentes gerados por IA.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'content_generator', 'Gerador de Conteúdo com IA', 'Crie hooks, captions, CTAs e roteiros de Reels.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'content_calendar', 'Calendário Editorial', 'Agende e planeje posts.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'content_library', 'Biblioteca de Ideias', 'Guarde rascunhos, hashtags e CTAs.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'approvals_workflow', 'Fluxo de Aprovação', 'Mande publicações para aprovação dos clientes.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'client_area', 'Área do Cliente Exclusiva', 'Área de login dedicada para aprovações rápida de posts.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'whatsapp_weekly_report', 'Relatório Semanal no WhatsApp', 'Resumo de métricas direto no WhatsApp.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'whatsapp_alerts', 'Alertas Inteligentes', 'Alertas de queda de alcance no WhatsApp.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'whatsapp_daily_tips', 'Dicas Diárias por WhatsApp', 'Recomendações e tendências diárias via WhatsApp.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'pdf_reports', 'Relatórios PDF', 'Exportação de relatórios customizados.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'up_creator_full', 'UP Creator Academy', 'Acesso completo e irrestrito a todos os cursos.', true, NULL),
('6e287ff1-789a-41ab-85b4-c38d47be442d', 'custom_branding', 'Branding Customizado', 'Logotipo da agência nos relatórios.', true, NULL)
ON CONFLICT DO NOTHING;

-- 4. UP Creator Courses
INSERT INTO up_creator_courses (id, title, description, thumbnail_url, category, required_feature_key, order_index, is_active) VALUES
('aa782ff1-789a-41ab-85b4-c38d47be4401', 'Dominando o Instagram', 'Aprenda os segredos do algoritmo e como estruturar sua marca.', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80', 'Fundamentos', 'up_creator_basic', 1, true),
('aa782ff1-789a-41ab-85b4-c38d47be4402', 'Estratégia e Métricas de Alto Impacto', 'Como analisar dados de forma inteligente para converter seguidores em vendas.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', 'Estratégia', 'up_creator_intermediate', 2, true),
('aa782ff1-789a-41ab-85b4-c38d47be4403', 'SaaS e Escala para Agências', 'Como gerenciar múltiplos clientes e estruturar relatórios automatizados de alto nível.', 'https://images.unsplash.com/photo-1552581230-c01bc0d4842d?auto=format&fit=crop&w=400&q=80', 'Agências', 'up_creator_full', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 5. UP Creator Lessons
INSERT INTO up_creator_lessons (id, course_id, title, description, video_url, thumbnail_url, duration_seconds, material_url, required_feature_key, order_index, is_active) VALUES
-- Curso 1: Dominando o Instagram
('11aa2ff1-789a-41ab-85b4-c38d47be4421', 'aa782ff1-789a-41ab-85b4-c38d47be4401', 'Introdução ao Algoritmo', 'Como funciona o algoritmo do Instagram atualmente.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80', 600, 'https://pdf-manual.com/1.pdf', 'up_creator_basic', 1, true),
('11aa2ff1-789a-41ab-85b4-c38d47be4422', 'aa782ff1-789a-41ab-85b4-c38d47be4401', 'Construindo o Posicionamento Estratégico', 'Estratégias práticas para encontrar a voz e tom da sua marca.', 'https://www.w3schools.com/html/movie.mp4', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80', 920, NULL, 'up_creator_basic', 2, true),

-- Curso 2: Estratégia e Métricas de Alto Impacto
('11aa2ff1-789a-41ab-85b4-c38d47be4431', 'aa782ff1-789a-41ab-85b4-c38d47be4402', 'Métricas de Alcance e Engajamento', 'Aprenda a diferenciar métricas de vaidade das métricas que importam.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80', 1200, 'https://pdf-manual.com/2.pdf', 'up_creator_intermediate', 1, true),
('11aa2ff1-789a-41ab-85b4-c38d47be4432', 'aa782ff1-789a-41ab-85b4-c38d47be4402', 'Diagnósticos com Inteligência Artificial', 'Como interpretar e aplicar as sugestões de IA no seu calendário editorial.', 'https://www.w3schools.com/html/movie.mp4', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', 1500, NULL, 'up_creator_intermediate', 2, true),

-- Curso 3: SaaS e Escala para Agências
('11aa2ff1-789a-41ab-85b4-c38d47be4441', 'aa782ff1-789a-41ab-85b4-c38d47be4403', 'Fluxos de Aprovação de Conteúdo', 'Como criar uma rotina profissional de validação de criativos sem estresse.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1542744173-8e0856278658?auto=format&fit=crop&w=400&q=80', 1800, 'https://pdf-manual.com/3.pdf', 'up_creator_full', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false,
    whatsapp_opt_in_at TIMESTAMP WITH TIME ZONE,
    whatsapp_opt_out_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    monthly_price_cents INTEGER NOT NULL,
    annual_price_cents INTEGER NOT NULL,
    trial_days INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. plan_limits
CREATE TABLE plan_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    max_instagram_accounts INTEGER NOT NULL DEFAULT 1,
    max_users INTEGER NOT NULL DEFAULT 1,
    max_ai_requests_month INTEGER NOT NULL DEFAULT 10,
    history_days INTEGER NOT NULL DEFAULT 30,
    max_clients INTEGER NOT NULL DEFAULT 0,
    max_scheduled_posts INTEGER NOT NULL DEFAULT 5,
    max_whatsapp_messages_month INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_plan_limits_updated_at
BEFORE UPDATE ON plan_limits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. plan_features
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    feature_description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    limit_value INTEGER,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(plan_id, feature_key)
);

CREATE TRIGGER update_plan_features_updated_at
BEFORE UPDATE ON plan_features
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_provider TEXT NOT NULL,
    payment_provider_customer_id TEXT NOT NULL,
    payment_provider_subscription_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. clients (Moved up so instagram_accounts can reference it)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. instagram_accounts
CREATE TABLE instagram_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    instagram_user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    name TEXT,
    profile_picture_url TEXT,
    account_type TEXT,
    followers_count INTEGER NOT NULL DEFAULT 0,
    media_count INTEGER NOT NULL DEFAULT 0,
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    disconnected_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'connected',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_instagram_accounts_updated_at
BEFORE UPDATE ON instagram_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. instagram_daily_metrics
CREATE TABLE instagram_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    followers_count INTEGER NOT NULL DEFAULT 0,
    reach INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    profile_views INTEGER NOT NULL DEFAULT 0,
    website_clicks INTEGER NOT NULL DEFAULT 0,
    interactions INTEGER NOT NULL DEFAULT 0,
    engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(instagram_account_id, metric_date)
);

-- 8. instagram_media
CREATE TABLE instagram_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    instagram_media_id TEXT UNIQUE NOT NULL,
    media_type TEXT NOT NULL,
    media_product_type TEXT NOT NULL,
    caption TEXT,
    permalink TEXT NOT NULL,
    thumbnail_url TEXT,
    media_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    published_weekday INTEGER NOT NULL,
    published_hour INTEGER NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_instagram_media_updated_at
BEFORE UPDATE ON instagram_media
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. instagram_media_metrics
CREATE TABLE instagram_media_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_media_id UUID NOT NULL REFERENCES instagram_media(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    reach INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    saves INTEGER NOT NULL DEFAULT 0,
    total_interactions INTEGER NOT NULL DEFAULT 0,
    engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. ai_requests
CREATE TABLE ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    instagram_account_id UUID REFERENCES instagram_accounts(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 11. ai_insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    what_improved JSONB DEFAULT '[]'::jsonb,
    what_got_worse JSONB DEFAULT '[]'::jsonb,
    opportunities JSONB DEFAULT '[]'::jsonb,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    content_suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 12. content_ideas
CREATE TABLE content_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    format TEXT NOT NULL,
    objective TEXT NOT NULL,
    niche TEXT NOT NULL,
    tone TEXT NOT NULL,
    theme TEXT NOT NULL,
    title TEXT NOT NULL,
    hook TEXT NOT NULL,
    caption TEXT NOT NULL,
    script TEXT NOT NULL,
    cta TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}'::TEXT[],
    visual_suggestion TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    planned_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_content_ideas_updated_at
BEFORE UPDATE ON content_ideas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. content_calendar
CREATE TABLE content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    content_idea_id UUID REFERENCES content_ideas(id) ON DELETE CASCADE,
    instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    planned_date DATE NOT NULL,
    planned_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_content_calendar_updated_at
BEFORE UPDATE ON content_calendar
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. content_approvals
CREATE TABLE content_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    content_idea_id UUID NOT NULL REFERENCES content_ideas(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    client_comment TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_content_approvals_updated_at
BEFORE UPDATE ON content_approvals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. content_library
CREATE TABLE content_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_content_library_updated_at
BEFORE UPDATE ON content_library
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. notification_preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    weekly_report BOOLEAN NOT NULL DEFAULT true,
    daily_tips BOOLEAN NOT NULL DEFAULT false,
    performance_alerts BOOLEAN NOT NULL DEFAULT true,
    billing_alerts BOOLEAN NOT NULL DEFAULT true,
    token_alerts BOOLEAN NOT NULL DEFAULT true,
    post_reminders BOOLEAN NOT NULL DEFAULT true,
    preferred_time TIME NOT NULL DEFAULT '09:00:00',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. whatsapp_messages
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    instagram_account_id UUID REFERENCES instagram_accounts(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_message_id TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 19. automation_events
CREATE TABLE automation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 20. sync_logs
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 21. up_creator_courses
CREATE TABLE up_creator_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT NOT NULL,
    category TEXT NOT NULL,
    required_feature_key TEXT NOT NULL DEFAULT 'up_creator_basic',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_up_creator_courses_updated_at
BEFORE UPDATE ON up_creator_courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 22. up_creator_lessons
CREATE TABLE up_creator_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES up_creator_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    material_url TEXT,
    required_feature_key TEXT NOT NULL DEFAULT 'up_creator_basic',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_up_creator_lessons_updated_at
BEFORE UPDATE ON up_creator_lessons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 23. up_creator_progress
CREATE TABLE up_creator_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES up_creator_lessons(id) ON DELETE CASCADE,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE TRIGGER update_up_creator_progress_updated_at
BEFORE UPDATE ON up_creator_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- --- INDICES FOR PERFORMANCE ---
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_instagram_accounts_user ON instagram_accounts(user_id);
CREATE INDEX idx_instagram_media_account ON instagram_media(instagram_account_id);
CREATE INDEX idx_instagram_media_published ON instagram_media(published_at);
CREATE INDEX idx_content_ideas_user ON content_ideas(user_id);
CREATE INDEX idx_content_calendar_date ON content_calendar(planned_date);
CREATE INDEX idx_content_approvals_idea ON content_approvals(content_idea_id);
CREATE INDEX idx_whatsapp_messages_user ON whatsapp_messages(user_id);
CREATE INDEX idx_up_creator_lessons_course ON up_creator_lessons(course_id);
CREATE INDEX idx_up_creator_progress_user ON up_creator_progress(user_id);


-- --- ENABLE ROW LEVEL SECURITY (RLS) ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_media_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE up_creator_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE up_creator_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE up_creator_progress ENABLE ROW LEVEL SECURITY;


-- --- RLS POLICIES ---

-- Admin Checker function helper
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Profiles
CREATE POLICY "Profiles are readable by owner and admins" ON profiles
    FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Profiles are updateable by owner and admins" ON profiles
    FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "Profiles insertable on auth signup" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR is_admin());

-- 2, 3, 4. Plans, limits, features
CREATE POLICY "Plans readable by everyone" ON plans FOR SELECT USING (true);
CREATE POLICY "Plans writeable only by admin" ON plans FOR ALL USING (is_admin());

CREATE POLICY "Limits readable by everyone" ON plan_limits FOR SELECT USING (true);
CREATE POLICY "Limits writeable only by admin" ON plan_limits FOR ALL USING (is_admin());

CREATE POLICY "Features readable by everyone" ON plan_features FOR SELECT USING (true);
CREATE POLICY "Features writeable only by admin" ON plan_features FOR ALL USING (is_admin());

-- 5. Subscriptions
CREATE POLICY "Subscriptions readable by owner and admin" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Subscriptions writeable only by admin" ON subscriptions
    FOR ALL USING (is_admin());

-- 16. Clients
CREATE POLICY "Clients manageable by owner agency and admin" ON clients
    FOR ALL USING (auth.uid() = owner_user_id OR is_admin());

-- 6. Instagram Accounts
CREATE POLICY "Instagram Accounts manageable by owner and admin" ON instagram_accounts
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 7. Instagram Daily Metrics
CREATE POLICY "Daily metrics readable by owner and admin" ON instagram_daily_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM instagram_accounts 
            WHERE instagram_accounts.id = instagram_daily_metrics.instagram_account_id
            AND (instagram_accounts.user_id = auth.uid() OR is_admin())
        )
    );
CREATE POLICY "Daily metrics manageable by admin and owner" ON instagram_daily_metrics
    FOR ALL USING (
        is_admin() OR EXISTS (
            SELECT 1 FROM instagram_accounts 
            WHERE instagram_accounts.id = instagram_daily_metrics.instagram_account_id
            AND instagram_accounts.user_id = auth.uid()
        )
    );

-- 8. Instagram Media
CREATE POLICY "Media readable by owner and admin" ON instagram_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM instagram_accounts 
            WHERE instagram_accounts.id = instagram_media.instagram_account_id
            AND (instagram_accounts.user_id = auth.uid() OR is_admin())
        )
    );
CREATE POLICY "Media manageable by admin and owner" ON instagram_media
    FOR ALL USING (
        is_admin() OR EXISTS (
            SELECT 1 FROM instagram_accounts 
            WHERE instagram_accounts.id = instagram_media.instagram_account_id
            AND instagram_accounts.user_id = auth.uid()
        )
    );

-- 9. Instagram Media Metrics
CREATE POLICY "Media metrics readable by owner and admin" ON instagram_media_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM instagram_media
            JOIN instagram_accounts ON instagram_accounts.id = instagram_media.instagram_account_id
            WHERE instagram_media.id = instagram_media_metrics.instagram_media_id
            AND (instagram_accounts.user_id = auth.uid() OR is_admin())
        )
    );
CREATE POLICY "Media metrics manageable by admin and owner" ON instagram_media_metrics
    FOR ALL USING (
        is_admin() OR EXISTS (
            SELECT 1 FROM instagram_media
            JOIN instagram_accounts ON instagram_accounts.id = instagram_media.instagram_account_id
            WHERE instagram_media.id = instagram_media_metrics.instagram_media_id
            AND instagram_accounts.user_id = auth.uid()
        )
    );

-- 10. AI Requests
CREATE POLICY "AI Requests manageable by owner and admin" ON ai_requests
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 11. AI Insights
CREATE POLICY "AI Insights manageable by owner and admin" ON ai_insights
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 12. Content Ideas
CREATE POLICY "Content ideas readable by owner, linked client, and admin" ON content_ideas
    FOR SELECT USING (
        auth.uid() = user_id 
        OR is_admin() 
        -- If user is a client, match email/phone from clients table
        OR EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = content_ideas.client_id 
            AND clients.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
    );
CREATE POLICY "Content ideas manageable by owner and admin" ON content_ideas
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 13. Content Calendar
CREATE POLICY "Calendar readable by owner, linked client, and admin" ON content_calendar
    FOR SELECT USING (
        auth.uid() = user_id 
        OR is_admin()
        OR EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = content_calendar.client_id 
            AND clients.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
    );
CREATE POLICY "Calendar manageable by owner and admin" ON content_calendar
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 14. Content Approvals
CREATE POLICY "Approvals readable and updateable by owner, client, and admin" ON content_approvals
    FOR ALL USING (
        auth.uid() = user_id 
        OR is_admin()
        OR EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = content_approvals.client_id 
            AND clients.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
    );

-- 15. Content Library
CREATE POLICY "Library manageable by owner and admin" ON content_library
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 17. Notification Preferences
CREATE POLICY "Preferences manageable by owner and admin" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 18. WhatsApp Messages
CREATE POLICY "WhatsApp logs readable by owner and admin" ON whatsapp_messages
    FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "WhatsApp logs manageable by admin" ON whatsapp_messages
    FOR ALL USING (is_admin());

-- 19. Automation Events
CREATE POLICY "Events manageable by owner and admin" ON automation_events
    FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 20. Sync Logs
CREATE POLICY "Sync logs readable by owner and admin" ON sync_logs
    FOR SELECT USING (
        is_admin() OR EXISTS (
            SELECT 1 FROM instagram_accounts
            WHERE instagram_accounts.id = sync_logs.instagram_account_id
            AND instagram_accounts.user_id = auth.uid()
        )
    );
CREATE POLICY "Sync logs writeable by admin" ON sync_logs
    FOR ALL USING (is_admin());

-- 21. UP Creator Courses
CREATE POLICY "Courses readable by authenticated users" ON up_creator_courses
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Courses manageable by admin" ON up_creator_courses
    FOR ALL USING (is_admin());

-- 22. UP Creator Lessons
CREATE POLICY "Lessons readable by authenticated users" ON up_creator_lessons
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lessons manageable by admin" ON up_creator_lessons
    FOR ALL USING (is_admin());

-- 23. UP Creator Progress
CREATE POLICY "Progress manageable by owner and admin" ON up_creator_progress
    FOR ALL USING (auth.uid() = user_id OR is_admin());

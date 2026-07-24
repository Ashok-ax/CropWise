/*
# Create AI conversations, reference data tables, and notifications

1. New Tables
- `ai_conversations` — a conversation thread per user with title and timestamps.
- `ai_messages` — individual messages within a conversation (role: user/assistant, content, farm context snapshot).
- `crop_catalog` — reference crop data (name, water req, growing period, seasons, soil suitability, investment/revenue estimates, risk, difficulty). Read-only reference for recommendation engine.
- `government_schemes` — curated government scheme entries (name, description, benefits, eligibility, category, location, source, verified date). Read-only reference.
- `knowledge_articles` — knowledge center articles (title, category, summary, content, sources, updated date). Read-only reference.
- `notifications` — user notifications (title, body, type, read status, link).
2. Security
- ai_conversations/ai_messages/notifications: owner-scoped via auth.uid() = user_id, authenticated only.
- crop_catalog/government_schemes/knowledge_articles: public read for authenticated users (shared reference content). No insert/update/delete from client (admin-managed).
*/

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON ai_conversations;
CREATE POLICY "select_own_conversations" ON ai_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON ai_conversations;
CREATE POLICY "insert_own_conversations" ON ai_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_conversations" ON ai_conversations;
CREATE POLICY "update_own_conversations" ON ai_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON ai_conversations;
CREATE POLICY "delete_own_conversations" ON ai_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_conversations_user_id_idx ON ai_conversations(user_id);

CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  farm_context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON ai_messages;
CREATE POLICY "select_own_messages" ON ai_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_messages" ON ai_messages;
CREATE POLICY "insert_own_messages" ON ai_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_messages" ON ai_messages;
CREATE POLICY "delete_own_messages" ON ai_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_messages_conversation_id_idx ON ai_messages(conversation_id);

CREATE TABLE IF NOT EXISTS crop_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  category text NOT NULL,
  water_requirement text NOT NULL,
  growing_period_days integer NOT NULL,
  suitable_seasons text[] NOT NULL DEFAULT '{}',
  suitable_soil_types text[] NOT NULL DEFAULT '{}',
  estimated_investment_per_acre numeric,
  estimated_revenue_per_acre numeric,
  risk_level text NOT NULL DEFAULT 'medium',
  difficulty text NOT NULL DEFAULT 'medium',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crop_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_crop_catalog" ON crop_catalog;
CREATE POLICY "select_crop_catalog" ON crop_catalog FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS crop_catalog_name_idx ON crop_catalog(crop_name);

CREATE TABLE IF NOT EXISTS government_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name text NOT NULL,
  description text NOT NULL,
  benefits text,
  eligibility text,
  required_documents text,
  application_process text,
  category text NOT NULL,
  farming_type text,
  location text,
  official_source text,
  last_verified date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_government_schemes" ON government_schemes;
CREATE POLICY "select_government_schemes" ON government_schemes FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS government_schemes_category_idx ON government_schemes(category);

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  sources text,
  last_updated date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_knowledge_articles" ON knowledge_articles;
CREATE POLICY "select_knowledge_articles" ON knowledge_articles FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS knowledge_articles_category_idx ON knowledge_articles(category);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

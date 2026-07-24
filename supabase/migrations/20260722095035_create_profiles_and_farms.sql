/*
# Create profiles and farms tables

1. New Tables
- `profiles` — extends auth.users with farmer-specific info (name, language, farming type, budget, onboarding state, role).
- `farms` — a farmer's digital farm record (name, location, land area, soil type, water availability, irrigation).
2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD via auth.uid() = user_id.
- profiles.id is the auth user id; policies compare against auth.uid() = id.
3. Notes
- user_id columns default to auth.uid() so client inserts omitting the owner still satisfy WITH CHECK.
- role defaults to 'farmer'; admin role is granted manually.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  age integer,
  phone text,
  preferred_language text NOT NULL DEFAULT 'en',
  location text,
  farming_types text[] NOT NULL DEFAULT '{}',
  experience text,
  primary_activity text,
  secondary_activities text[] DEFAULT '{}',
  budget numeric,
  investment_capacity numeric,
  onboarding_completed boolean NOT NULL DEFAULT false,
  role text NOT NULL DEFAULT 'farmer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  land_area numeric,
  area_unit text NOT NULL DEFAULT 'acres',
  soil_type text,
  water_availability text,
  irrigation_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_farms" ON farms;
CREATE POLICY "select_own_farms" ON farms FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_farms" ON farms;
CREATE POLICY "insert_own_farms" ON farms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_farms" ON farms;
CREATE POLICY "update_own_farms" ON farms FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_farms" ON farms;
CREATE POLICY "delete_own_farms" ON farms FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS farms_user_id_idx ON farms(user_id);

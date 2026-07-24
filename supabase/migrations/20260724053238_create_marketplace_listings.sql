/*
# Create marketplace_listings table

1. New Tables
- `marketplace_listings` — lets farmers list produce for sale (crop, dairy, poultry, fish, etc.)
  - id (uuid PK)
  - user_id (uuid, owner, defaults to auth.uid())
  - farm_id (uuid FK to farms, nullable)
  - title (text, not null) — what's being sold
  - category (text, not null) — crop, dairy, poultry, fish, livestock, other
  - quantity (numeric, not null)
  - unit (text, not null) — kg, litre, dozen, piece, ton, quintal
  - price (numeric, not null) — asking price per unit
  - description (text, nullable)
  - status (text, default 'active') — active, sold, withdrawn
  - created_at, updated_at (timestamptz)
2. Security
- Enable RLS.
- Owner-scoped CRUD: each authenticated user can only insert/update/delete their own listings.
- All authenticated users can see all active listings (marketplace is shared browsing).
*/

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  title text NOT NULL,
  category text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  price numeric NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_listings" ON marketplace_listings;
CREATE POLICY "select_all_listings" ON marketplace_listings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_listings" ON marketplace_listings;
CREATE POLICY "insert_own_listings" ON marketplace_listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_listings" ON marketplace_listings;
CREATE POLICY "update_own_listings" ON marketplace_listings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_listings" ON marketplace_listings;
CREATE POLICY "delete_own_listings" ON marketplace_listings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS marketplace_listings_user_id_idx ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx ON marketplace_listings(status);
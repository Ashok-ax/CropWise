/*
# Create livestock, poultry, dairy, and fisheries modules

1. New Tables
- `livestock` — cattle/goats/sheep records per farm (animal id, species, breed, birth/acquisition, health, vaccination).
- `poultry` — bird batches per farm (batch id, breed, count, feed, vaccination, egg production, mortality).
- `dairy_records` — daily milk production entries per livestock animal or batch.
- `fisheries` — pond/fish records per farm (pond id, species, stock count, feed, water quality, harvest).
2. Security
- RLS enabled, owner-scoped via parent farms.user_id for all four tables.
3. Notes
- These cover the multi-farming requirement: one farmer can run several activity types under one account.
*/

CREATE TABLE IF NOT EXISTS livestock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  animal_id text,
  species text NOT NULL,
  breed text,
  gender text,
  birth_date date,
  acquisition_date date,
  weight numeric,
  health_status text NOT NULL DEFAULT 'healthy',
  vaccination_status text,
  last_vaccination_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_livestock" ON livestock;
CREATE POLICY "select_own_livestock" ON livestock FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_livestock" ON livestock;
CREATE POLICY "insert_own_livestock" ON livestock FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_livestock" ON livestock;
CREATE POLICY "update_own_livestock" ON livestock FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_livestock" ON livestock;
CREATE POLICY "delete_own_livestock" ON livestock FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS livestock_farm_id_idx ON livestock(farm_id);

CREATE TABLE IF NOT EXISTS poultry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id text,
  breed text NOT NULL,
  bird_count integer NOT NULL DEFAULT 0,
  purpose text,
  feed_type text,
  feed_amount numeric,
  vaccination_status text,
  egg_production integer,
  mortality_count integer DEFAULT 0,
  acquisition_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE poultry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_poultry" ON poultry;
CREATE POLICY "select_own_poultry" ON poultry FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = poultry.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_poultry" ON poultry;
CREATE POLICY "insert_own_poultry" ON poultry FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = poultry.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_poultry" ON poultry;
CREATE POLICY "update_own_poultry" ON poultry FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = poultry.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = poultry.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_poultry" ON poultry;
CREATE POLICY "delete_own_poultry" ON poultry FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = poultry.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS poultry_farm_id_idx ON poultry(farm_id);

CREATE TABLE IF NOT EXISTS dairy_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  livestock_id uuid REFERENCES livestock(id) ON DELETE SET NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  morning_milk_litres numeric NOT NULL DEFAULT 0,
  evening_milk_litres numeric NOT NULL DEFAULT 0,
  fat_content numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dairy_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dairy_records" ON dairy_records;
CREATE POLICY "select_own_dairy_records" ON dairy_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = dairy_records.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_dairy_records" ON dairy_records;
CREATE POLICY "insert_own_dairy_records" ON dairy_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = dairy_records.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_dairy_records" ON dairy_records;
CREATE POLICY "update_own_dairy_records" ON dairy_records FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = dairy_records.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = dairy_records.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_dairy_records" ON dairy_records;
CREATE POLICY "delete_own_dairy_records" ON dairy_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = dairy_records.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS dairy_records_farm_id_idx ON dairy_records(farm_id);

CREATE TABLE IF NOT EXISTS fisheries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  pond_id text,
  fish_species text NOT NULL,
  stock_count integer NOT NULL DEFAULT 0,
  feed_type text,
  feed_amount numeric,
  water_quality_ph numeric(4,2),
  water_temperature numeric,
  oxygen_level numeric,
  stocking_date date,
  expected_harvest_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fisheries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_fisheries" ON fisheries;
CREATE POLICY "select_own_fisheries" ON fisheries FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = fisheries.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_fisheries" ON fisheries;
CREATE POLICY "insert_own_fisheries" ON fisheries FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = fisheries.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_fisheries" ON fisheries;
CREATE POLICY "update_own_fisheries" ON fisheries FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = fisheries.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = fisheries.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_fisheries" ON fisheries;
CREATE POLICY "delete_own_fisheries" ON fisheries FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = fisheries.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS fisheries_farm_id_idx ON fisheries(farm_id);

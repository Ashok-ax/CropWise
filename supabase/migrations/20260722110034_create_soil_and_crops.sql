CREATE TABLE IF NOT EXISTS soil_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  ph numeric(4,2),
  nitrogen numeric,
  phosphorus numeric,
  potassium numeric,
  organic_matter numeric,
  moisture text,
  drainage text,
  test_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE soil_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_soil_profiles" ON soil_profiles;
CREATE POLICY "select_own_soil_profiles" ON soil_profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = soil_profiles.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_soil_profiles" ON soil_profiles;
CREATE POLICY "insert_own_soil_profiles" ON soil_profiles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = soil_profiles.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_soil_profiles" ON soil_profiles;
CREATE POLICY "update_own_soil_profiles" ON soil_profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = soil_profiles.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = soil_profiles.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_soil_profiles" ON soil_profiles;
CREATE POLICY "delete_own_soil_profiles" ON soil_profiles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = soil_profiles.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS soil_profiles_farm_id_idx ON soil_profiles(farm_id);

CREATE TABLE IF NOT EXISTS crop_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  variety text,
  area numeric,
  area_unit text NOT NULL DEFAULT 'acres',
  planting_date date,
  expected_harvest_date date,
  growth_stage text,
  status text NOT NULL DEFAULT 'planned',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crop_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_crop_records" ON crop_records;
CREATE POLICY "select_own_crop_records" ON crop_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crop_records.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_crop_records" ON crop_records;
CREATE POLICY "insert_own_crop_records" ON crop_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crop_records.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_crop_records" ON crop_records;
CREATE POLICY "update_own_crop_records" ON crop_records FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crop_records.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crop_records.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_crop_records" ON crop_records;
CREATE POLICY "delete_own_crop_records" ON crop_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crop_records.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS crop_records_farm_id_idx ON crop_records(farm_id);
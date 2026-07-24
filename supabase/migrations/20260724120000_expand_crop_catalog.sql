/*
# Expand crop catalog with additional crops

1. Adds a unique index on crop_name so future inserts can safely use
   ON CONFLICT DO NOTHING (idempotent, matches project convention).
2. Inserts 16 additional crops identified from the real-world
   Crop_recommendation dataset (2,200 records, 22 crop classes) that
   were not already present in crop_catalog: apple, blackgram, coconut,
   coffee, grapes, jute, kidneybeans, lentil, mothbeans, mungbean,
   muskmelon, orange, papaya, pigeonpeas, pomegranate, watermelon.

Note: investment/revenue/growing-period figures here are general
agronomic estimates for India (same "Estimated" convention as the
original seed data) — the source dataset itself only contains
soil/climate values, not financial figures.
*/

-- Remove duplicate crop_name rows, keeping the earliest inserted row for each
DELETE FROM crop_catalog a
USING crop_catalog b
WHERE a.ctid > b.ctid
  AND a.crop_name = b.crop_name;

CREATE UNIQUE INDEX IF NOT EXISTS crop_catalog_crop_name_uidx ON crop_catalog (crop_name);

INSERT INTO crop_catalog (crop_name, category, water_requirement, growing_period_days, suitable_seasons, suitable_soil_types, estimated_investment_per_acre, estimated_revenue_per_acre, risk_level, difficulty, description)
VALUES
  ('Apple', 'fruit', 'medium', 1460, ARRAY['winter','spring'], ARRAY['loam'], 60000, 150000, 'medium', 'hard', 'Temperate perennial orchard crop suited to hill regions; first yield after 4-5 years.'),
  ('Black Gram (Urad)', 'pulse', 'low', 90, ARRAY['kharif'], ARRAY['loam','sandy loam'], 15000, 35000, 'low', 'easy', 'Short-duration kharif pulse that fixes soil nitrogen.'),
  ('Coconut', 'plantation', 'medium', 1825, ARRAY['monsoon','spring'], ARRAY['sandy','loam'], 45000, 90000, 'low', 'medium', 'Coastal perennial palm crop; first yield after about 5 years, then productive for decades.'),
  ('Coffee', 'cash', 'medium', 1095, ARRAY['monsoon','spring'], ARRAY['loam'], 70000, 140000, 'medium', 'hard', 'Shade-grown perennial cash crop suited to hilly, high-rainfall regions.'),
  ('Grapes', 'fruit', 'medium', 730, ARRAY['winter','summer'], ARRAY['loam','sandy loam'], 80000, 200000, 'high', 'hard', 'Trellised perennial vine crop with high market value; needs careful pruning and pest management.'),
  ('Jute', 'fiber', 'high', 120, ARRAY['kharif','monsoon'], ARRAY['loam','alluvial'], 18000, 38000, 'medium', 'medium', 'Fiber crop grown in high-rainfall, humid conditions; used for sacking and textiles.'),
  ('Kidney Beans (Rajma)', 'pulse', 'medium', 90, ARRAY['kharif','rabi'], ARRAY['loam'], 16000, 38000, 'low', 'easy', 'Protein-rich pulse crop grown in cooler climates.'),
  ('Lentil (Masoor)', 'pulse', 'low', 100, ARRAY['rabi'], ARRAY['loam','black'], 14000, 34000, 'low', 'easy', 'Drought-tolerant rabi pulse that improves soil fertility.'),
  ('Moth Bean', 'pulse', 'low', 75, ARRAY['kharif','summer'], ARRAY['sandy'], 10000, 25000, 'low', 'easy', 'Highly drought-tolerant pulse suited to arid, sandy soils.'),
  ('Mung Bean (Moong)', 'pulse', 'low', 65, ARRAY['kharif','summer'], ARRAY['loam','sandy loam'], 12000, 30000, 'low', 'easy', 'Fast-growing short-duration pulse, often used as a rotation crop.'),
  ('Muskmelon', 'vegetable', 'medium', 90, ARRAY['summer'], ARRAY['sandy loam'], 25000, 60000, 'high', 'medium', 'Warm-season vine crop needing well-drained soil and consistent watering.'),
  ('Orange', 'fruit', 'medium', 1095, ARRAY['winter','spring'], ARRAY['loam'], 45000, 100000, 'medium', 'medium', 'Perennial citrus crop; first yield after about 3 years.'),
  ('Papaya', 'fruit', 'medium', 270, ARRAY['spring','monsoon'], ARRAY['loam','sandy loam'], 35000, 90000, 'medium', 'easy', 'Fast-yielding fruit crop, productive within a year of planting.'),
  ('Pigeon Pea (Toor/Arhar)', 'pulse', 'low', 150, ARRAY['kharif'], ARRAY['loam','black'], 18000, 40000, 'low', 'easy', 'Deep-rooted, drought-tolerant pulse widely intercropped with cereals.'),
  ('Pomegranate', 'fruit', 'low', 730, ARRAY['spring','summer'], ARRAY['loam','sandy'], 50000, 120000, 'medium', 'medium', 'Drought-tolerant perennial fruit crop suited to semi-arid regions.'),
  ('Watermelon', 'vegetable', 'medium', 80, ARRAY['summer'], ARRAY['sandy loam'], 22000, 55000, 'high', 'medium', 'Warm-season vine crop with high water needs during fruit development.')
ON CONFLICT (crop_name) DO NOTHING;

/*
# Add unique constraints to reference-data tables

1. Problem being fixed
- `crop_catalog`, `government_schemes`, and `knowledge_articles` were seeded
  by a migration using `INSERT ... ON CONFLICT DO NOTHING`, but none of
  these tables had a unique constraint on their natural key column
  (crop_name / scheme_name / title). Without a matching unique/exclusion
  constraint, `ON CONFLICT DO NOTHING` has nothing to conflict on, so it
  silently does nothing to stop duplicates — running the seed migration
  more than once (which happened here) inserted every row twice.
2. Changes
- Add a UNIQUE constraint on `crop_catalog.crop_name`.
- Add a UNIQUE constraint on `government_schemes.scheme_name`.
- Add a UNIQUE constraint on `knowledge_articles.title`.
- Remove any duplicate rows that already exist before adding each
  constraint (keeps the earliest row per natural key).
3. Notes
- Wrapped in DO blocks with existence checks so this migration is safe to
  run more than once.
*/

-- Dedupe crop_catalog, keeping the earliest row per crop_name
DELETE FROM crop_catalog a
USING crop_catalog b
WHERE a.crop_name = b.crop_name
  AND a.id > b.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crop_catalog_crop_name_key'
  ) THEN
    ALTER TABLE crop_catalog ADD CONSTRAINT crop_catalog_crop_name_key UNIQUE (crop_name);
  END IF;
END $$;

-- Dedupe government_schemes, keeping the earliest row per scheme_name
DELETE FROM government_schemes a
USING government_schemes b
WHERE a.scheme_name = b.scheme_name
  AND a.id > b.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'government_schemes_scheme_name_key'
  ) THEN
    ALTER TABLE government_schemes ADD CONSTRAINT government_schemes_scheme_name_key UNIQUE (scheme_name);
  END IF;
END $$;

-- Dedupe knowledge_articles, keeping the earliest row per title
DELETE FROM knowledge_articles a
USING knowledge_articles b
WHERE a.title = b.title
  AND a.id > b.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'knowledge_articles_title_key'
  ) THEN
    ALTER TABLE knowledge_articles ADD CONSTRAINT knowledge_articles_title_key UNIQUE (title);
  END IF;
END $$;

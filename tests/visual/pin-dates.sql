-- Run after the seed. Columns that default to the database's now() (not the frozen clock) would show the real
-- date ("Ejam kopā kopš ..."), so every createdAt later than the frozen "now" (2026-10-22 12:00 Riga) is pinned
-- 30 days before it. Seeded values are never later than the frozen now.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'createdAt' AND data_type LIKE 'timestamp%'
  LOOP
    EXECUTE format('UPDATE %I SET %I = %L::timestamptz - interval ''30 days'' WHERE %I > %L::timestamptz',
      r.table_name, r.column_name, '2026-10-22T09:00:00Z', r.column_name, '2026-10-22T09:00:00Z');
  END LOOP;
END $$;

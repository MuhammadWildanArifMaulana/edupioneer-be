-- Migration: sync guru.nama from users.name, then drop guru.nama column
-- 1) Synchronize existing guru.nama values from users.name (in case any code still reads it)
UPDATE guru g
SET nama = u.name
FROM users u
WHERE g.user_id = u.id;

-- 2) Drop the redundant column
ALTER TABLE guru DROP COLUMN IF EXISTS nama;

-- Note: After applying this migration, code should not attempt to INSERT/UPDATE the
-- `guru.nama` column. Use the users table (users.name) as the canonical source of truth.

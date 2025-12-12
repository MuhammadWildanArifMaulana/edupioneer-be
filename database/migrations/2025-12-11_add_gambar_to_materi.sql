-- Migration: add gambar column to materi table
ALTER TABLE materi ADD COLUMN IF NOT EXISTS gambar VARCHAR(500);

-- No backfill required; existing rows will have NULL for gambar

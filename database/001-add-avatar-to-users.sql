-- Migration: add avatar_url and phone to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Optionally update existing users with NULL avatar_url
UPDATE users SET avatar_url = NULL WHERE avatar_url IS NULL;

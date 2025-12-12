import { query } from '@utils/db';

const run = async () => {
  try {
    console.log('Adding avatar_url and phone columns to users table (if not exists)...');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);');
    console.log('Migration applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
};

run();

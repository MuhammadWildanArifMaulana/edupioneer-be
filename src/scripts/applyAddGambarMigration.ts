import { query, closePool } from '../utils/db';

const run = async () => {
  try {
    console.log('[migration] Adding gambar column to materi (if not exists)...');
    await query('ALTER TABLE materi ADD COLUMN IF NOT EXISTS gambar VARCHAR(500);');
    console.log('[migration] ALTER TABLE executed. Verifying columns...');
    const res = await query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='materi' ORDER BY ordinal_position;",
    );
    console.log('[migration] Columns for materi:');
    for (const row of res.rows) {
      console.log('-', row.column_name);
    }
    console.log('[migration] Done.');
  } catch (err) {
    console.error('[migration] Error:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
};

run();

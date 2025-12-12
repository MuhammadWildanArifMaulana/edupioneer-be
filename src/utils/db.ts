import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from '../config/env';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: unknown[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
      // Only log slow queries
      console.log('[DB] Slow query', {
        text: text.substring(0, 80),
        duration,
        rows: result.rowCount,
      });
    }
    return result;
  } catch (error) {
    console.error('[DB] Query error:', {
      text,
      params,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;

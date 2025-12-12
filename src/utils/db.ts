import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from '../config/env';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.username,
  password: config.db.password,
  database: config.db.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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

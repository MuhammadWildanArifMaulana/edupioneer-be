import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from '../config/env';

// Reuse a global pool in serverless environments to avoid creating a new
// pool for every module re-evaluation which can exhaust database connections.
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // Allow caching the pool on globalThis
  var __pgPool__: Pool | undefined;
}

const createPool = () =>
  new Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    max: Number.parseInt(process.env.DB_MAX_CLIENTS || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

const pool: Pool = globalThis.__pgPool__ ?? createPool();
// cache for reuse across lambda/container warm invocations
globalThis.__pgPool__ ??= pool;

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

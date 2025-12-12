const { Pool } = require('pg');

// Read DB config from env to avoid importing TypeScript-only modules
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Enable SSL when explicitly requested by environment variables.
// Use DB_SSL=true or PGSSLMODE=require or embed `sslmode=require` in DATABASE_URL.
const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.PGSSLMODE === 'require' ||
  (process.env.DATABASE_URL && /sslmode=require/.test(process.env.DATABASE_URL));

if (useSsl) {
  // By default allow self-signed certs unless DB_REJECT_UNAUTHORIZED=false
  dbConfig.ssl = { rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false' };
}

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log('[DB] Slow query', {
        text: String(text).substring(0, 80),
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
}

async function getClient() {
  return pool.connect();
}

async function closePool() {
  await pool.end();
}

module.exports = {
  query,
  getClient,
  closePool,
  pool,
};

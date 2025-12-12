#!/usr/bin/env node
/*
  scripts/check_db.js
  DB inspector and exporter for Neon/Postgres.

  Usage:
    # ensure .env has DB_* variables or set DATABASE_URL
    node scripts/check_db.js [--json | --sql | --out=filename]

  By default writes `dump.json` and `dump.sql` in repo root.
*/
const { Pool } = require('pg');
const dotenv = require('dotenv');
const util = require('util');

dotenv.config();

const getPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });
};

const tables = [
  'users','roles','kelas','mapel','guru','siswa','guru_mapel','materi','materi_view',
  'tugas','tugas_submit','absensi','absensi_detail','diskusi','diskusi_post','nilai_mapel','pembayaran_spp'
];

const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const wantJson = args.includes('--json') || !args.includes('--sql') || !args.includes('--json');
const wantSql = args.includes('--sql') || !args.includes('--sql');
let outFile = 'dump';
const outArg = args.find((a) => a.startsWith('--out='));
if (outArg) outFile = outArg.split('=')[1] || outFile;
const outJsonPath = `${outFile}.json`;
const outSqlPath = `${outFile}.sql`;

(async () => {
  const pool = getPool();
  try {
    await pool.connect();
  } catch (err) {
    console.error('Failed to connect to DB:', err.message || err);
    process.exit(2);
  }

  console.log('Connected to DB. Checking tables...');

  const exportJson = {};
  const sqlLines = [];

  // If schema file exists in database/schema.sql include it at top of SQL dump
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    sqlLines.push('-- Schema from database/schema.sql');
    sqlLines.push(schemaSql);
    sqlLines.push('\n-- Data inserts follow');
  }

  const sqlValue = (v) => {
    if (v === null || typeof v === 'undefined') return 'NULL';
    if (typeof v === 'number') return v.toString();
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (v instanceof Date) return `'${v.toISOString()}'`;
    // For objects/arrays, stringify
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
    // string
    return `'${String(v).replace(/'/g, "''")}'`;
  };

  for (const t of tables) {
    try {
      const cntRes = await pool.query(`SELECT COUNT(*)::int AS cnt FROM ${t}`);
      const cnt = cntRes.rows[0].cnt;
      console.log(`\nTable: ${t} — count: ${cnt}`);
      exportJson[t] = { count: cnt, rows: [] };

      if (cnt > 0) {
        const sample = await pool.query(`SELECT * FROM ${t} ORDER BY created_at NULLS LAST, id LIMIT 1000`);
        exportJson[t].rows = sample.rows;

        if (wantSql) {
          for (const row of sample.rows) {
            const cols = Object.keys(row);
            const vals = cols.map((c) => sqlValue(row[c]));
            sqlLines.push(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${vals.join(',')});`);
          }
        }

        // Show small sample in console
        const showSample = sample.rows.slice(0, 5);
        console.log(util.inspect(showSample, { depth: 2, colors: true }));
      }
    } catch (err) {
      console.warn(`Could not query table ${t}:`, err.message || err);
    }
  }

  if (wantJson) {
    try {
      fs.writeFileSync(path.join(process.cwd(), outJsonPath), JSON.stringify(exportJson, null, 2));
      console.log('\nWrote JSON export to', outJsonPath);
    } catch (err) {
      console.error('Failed to write JSON export:', err.message || err);
    }
  }

  if (wantSql) {
    try {
      fs.writeFileSync(path.join(process.cwd(), outSqlPath), sqlLines.join('\n'));
      console.log('Wrote SQL export to', outSqlPath);
    } catch (err) {
      console.error('Failed to write SQL export:', err.message || err);
    }
  }

  await pool.end();
  console.log('\nDone.');
})();

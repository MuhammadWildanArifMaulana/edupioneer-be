#!/usr/bin/env node
/*
  scripts/build_import.js
  Build a destructive import SQL that recreates the public schema and
  applies the schema + data dump to make the target DB identical.

  Usage:
    node scripts/build_import.js --dump=edupioneer_dump.sql --out=edupioneer_import.sql

  WARNING: This script produces a destructive import (drops public schema).
*/
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dumpArg = args.find((a) => a.startsWith('--dump='));
const outArg = args.find((a) => a.startsWith('--out='));
const dumpPath = dumpArg ? dumpArg.split('=')[1] : path.join(process.cwd(), 'edupioneer_dump.sql');
const outPath = outArg ? outArg.split('=')[1] : path.join(process.cwd(), 'edupioneer_import.sql');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

if (!fs.existsSync(dumpPath)) {
  console.error('Dump file not found:', dumpPath);
  process.exit(2);
}

console.log('Building import SQL...');

let out = [];
out.push('-- AUTO-GENERATED IMPORT SQL - DESTRUCTIVE');
out.push('-- Drops public schema and recreates it, then applies schema and data.');
out.push('BEGIN;');
out.push('-- Drop and recreate public schema');
out.push('DROP SCHEMA IF EXISTS public CASCADE;');
out.push('CREATE SCHEMA public;');
out.push("SET search_path = public;");
out.push('-- Enable required extensions (pgcrypto for gen_random_uuid)");
out.push("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
out.push('\n-- Disable triggers during import to speed up and avoid FK issues');
out.push("SET session_replication_role = 'replica';");

// include schema.sql if available
if (fs.existsSync(schemaPath)) {
  out.push('\n-- Schema (from database/schema.sql)');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  out.push(schema);
} else {
  out.push('\n-- No database/schema.sql found; relying on dump to contain schema');
}

out.push('\n-- Data (from dump file)');
const dumpSql = fs.readFileSync(dumpPath, 'utf8');
out.push(dumpSql);

out.push('\n-- Re-enable triggers');
out.push("SET session_replication_role = 'origin';");
out.push('COMMIT;');

fs.writeFileSync(outPath, out.join('\n\n'));
console.log('Wrote import to', outPath);

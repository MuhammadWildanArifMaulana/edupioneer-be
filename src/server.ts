import moduleAlias from 'module-alias';
import path from 'path';
import 'reflect-metadata';

// Register runtime aliases so imports like '@services/..' resolve whether
// the app runs from `src/` (ts/dev/Vercel) or `dist/` (compiled build).
moduleAlias.addAliases({
  '@config': path.join(__dirname, 'config'),
  '@services': path.join(__dirname, 'services'),
  '@controllers': path.join(__dirname, 'controllers'),
  '@routes': path.join(__dirname, 'routes'),
  '@entities': path.join(__dirname, 'entities'),
  '@utils': path.join(__dirname, 'utils'),
  '@middlewares': path.join(__dirname, 'middlewares'),
});

import app from './app';
import { query } from './utils/db';
import { config } from './config/env';

// Export app for serverless platforms (Vercel will `require('../dist/server')`).
// @ts-ignore - provide CommonJS export for compatibility with Vercel's require
module.exports = app;
console.log('[SERVER] Express app exported for require()');

// Initialize DB and start listener only when running directly (not required as module)
const initServer = async () => {
  try {
    await query('SELECT 1');
    console.log('[DB] Database connection successful');

    const server = app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('[FATAL] Unhandled rejection:', reason instanceof Error ? reason.message : String(reason));
      process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[FATAL] Uncaught exception:', error.message, error.stack);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('[DB] Database connection failed:', error instanceof Error ? error.message : String(error));
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    }
    process.exit(1);
  }
};

if (require.main === module) {
  initServer().catch((error) => {
    console.error('[FATAL] Failed to initialize server:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) console.error('[FATAL] Stack:', error.stack);
    process.exit(1);
  });
} else {
  console.log('[SERVER] Required as module — skipping initServer');
}

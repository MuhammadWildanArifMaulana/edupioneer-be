// Compatibility wrapper for environments (like Vercel) that require
// a CommonJS `src/server.js` to exist. This file simply requires
// the compiled `dist/server.js` which exports the Express app
// when running in serverless (process.env.VERCEL=true).

try {
  // Prefer compiled dist version
  module.exports = require('../dist/server');
} catch (err) {
  console.error(
    'Failed to require ../dist/server from src/server.js:',
    err && err.message ? err.message : err,
  );
  // If dist is not present, rethrow so the platform sees the error
  throw err;
}

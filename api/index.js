// Simple Vercel serverless entry that re-uses the compiled Express app
// `dist/server.js` which already exports the Express `app` when running
// in Vercel (server.ts checks `process.env.VERCEL`).

const server = require('../dist/server');

// `server` is the express app exported from dist/server.js
module.exports = server;

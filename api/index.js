// Vercel serverless entry that re-uses the compiled Express app
// `dist/server.js`. Vercel invokes this file with the original request
// path (e.g., `/`). Our Express app registers routes under `/api/*`,
// so we rewrite incoming paths that don't start with `/api` to include
// the `/api` prefix. Root `/` is mapped to `/api/health`.

const app = require('../dist/server');

module.exports = (req, res) => {
	try {
		if (!req.url || typeof req.url !== 'string') {
			return app(req, res);
		}
		if (!req.url.startsWith('/api')) {
			if (req.url === '/' || req.url === '') {
				req.url = '/api/health';
			} else {
				req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
			}
		}
		return app(req, res);
	} catch (err) {
		console.error('Error in api/index.js handler rewrite:', err);
		res.statusCode = 500;
		res.end('Internal Server Error');
	}
};

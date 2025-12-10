const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    console.log('Checking /api/health...');
    const health = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('HEALTH:', health);

    console.log('Calling /api/auth/login...');
    const loginBody = JSON.stringify({ email: 'admin@edupioneer.com', password: 'admin123' });
    const login = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginBody),
        },
      },
      loginBody,
    );
    console.log('LOGIN:', login);

    const token = login.body && login.body.data && login.body.data.token;
    if (!token) {
      console.error('No token returned from login');
      process.exit(1);
    }

    console.log('Calling /api/auth/me with token (first 40 chars):', token.substring(0, 40));
    const me = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    console.log('ME:', me);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
})();

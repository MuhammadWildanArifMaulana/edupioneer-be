const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  const results = { passed: 0, failed: 0 };
  const assertEqual = (actual, expected, name) => {
    if (actual === expected) {
      console.log(`  ✓ ${name}`);
      results.passed++;
    } else {
      console.error(`  ✗ ${name} (expected ${expected}, got ${actual})`);
      results.failed++;
    }
  };

  console.log('\n=== BACKEND ENDPOINT VALIDATION ===\n');

  try {
    // Health
    console.log('Health Check:');
    const h = await request('GET', '/health');
    assertEqual(h.status, 200, 'GET /health');

    // Auth
    console.log('\nAuthentication:');
    const login = await request('POST', '/auth/login', {
      email: 'admin@edupioneer.com',
      password: 'admin123',
    });
    assertEqual(login.status, 200, 'POST /auth/login');
    const token = login.data.data?.token;
    if (!token) throw new Error('No token returned');

    const me = await request('GET', '/auth/me', null, { Authorization: `Bearer ${token}` });
    assertEqual(me.status, 200, 'GET /auth/me (with token)');

    const noAuth = await request('GET', '/auth/me');
    assertEqual(noAuth.status, 401, 'GET /auth/me (no token) → 401');

    // Protected routes
    console.log('\nProtected Endpoints:');
    const endpoints = [
      '/users',
      '/kelas',
      '/mapel',
      '/guru',
      '/siswa',
      '/materi',
      '/tugas',
      '/absensi',
      '/diskusi',
      '/nilai',
      '/spp',
    ];
    for (const ep of endpoints) {
      const res = await request('GET', ep, null, { Authorization: `Bearer ${token}` });
      assertEqual(res.status, 200, `GET ${ep}`);
    }

    // Errors
    console.log('\nError Handling:');
    const notFound = await request('GET', '/invalid', null, { Authorization: `Bearer ${token}` });
    assertEqual(notFound.status, 404, '404 Not Found');

    const badAuth = await request('GET', '/users', null, { Authorization: 'Bearer bad' });
    assertEqual(badAuth.status, 401, '401 Invalid Token');

    console.log('\n=== SUMMARY ===');
    console.log(`✓ Passed: ${results.passed}`);
    console.log(`✗ Failed: ${results.failed}`);
    console.log(
      results.failed === 0 ? '\n🎉 All endpoints validated!\n' : '\n❌ Some tests failed\n',
    );
    process.exit(results.failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  }
}

test();

// Use built-in fetch (Node 18+) to POST login
(async function () {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@edupioneer.com', password: 'admin123' }),
      // Node fetch timeout handled via AbortController if needed
    });

    const text = await res.text();
    console.log('status', res.status);
    try {
      console.log('data', JSON.parse(text));
    } catch (e) {
      console.log('raw', text);
    }
    if (!res.ok) process.exit(1);
  } catch (err) {
    console.error('request error', err.message || err);
    process.exit(1);
  }
})();

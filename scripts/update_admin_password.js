const { Client } = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'postgrecuy',
    database: 'capstone',
  });
  await client.connect();
  try {
    const h = bcrypt.hashSync('admin123', 10);
    console.log('generated hash:', h);
    await client.query('UPDATE users SET password = $1 WHERE email = $2', [
      h,
      'admin@edupioneer.com',
    ]);
    const res = await client.query('SELECT password FROM users WHERE email = $1', [
      'admin@edupioneer.com',
    ]);
    console.log('db password:', res.rows[0].password);
    console.log('compare:', bcrypt.compareSync('admin123', res.rows[0].password));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();

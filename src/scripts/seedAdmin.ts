import { query } from '@utils/db';
import { hashPassword } from '@config/bcrypt';

async function seedAdmin() {
  try {
    const email = 'admin@edupioneer.com';
    const password = 'admin123'; // Ganti dengan password yang kuat
    const name = 'Administrator';
    const role = 'admin';

    // Check if admin already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('❌ Admin sudah ada!');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert admin user
    const result = await query(
      'INSERT INTO users (email, password, name, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name, role',
      [email, hashedPassword, name, role],
    );

    const admin = result.rows[0];
    console.log('✅ Admin berhasil dibuat!');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('\n⚠️  JANGAN LUPA GANTI PASSWORD SETELAH LOGIN!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAdmin();

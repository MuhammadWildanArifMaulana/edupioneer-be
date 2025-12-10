import { query } from '@utils/db';
import { hashPassword } from '@config/bcrypt';

export const createUser = async (data: {
  email: string;
  password: string;
  name: string;
  role: 'guru' | 'siswa' | 'admin';
}) => {
  const { email, password, name, role } = data;

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert user
  const userResult = await query(
    'INSERT INTO users (email, password, name, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name, role, created_at',
    [email, hashedPassword, name, role],
  );

  const user = userResult.rows[0];

  // If role is siswa, create record in siswa table
  if (role === 'siswa') {
    await query('INSERT INTO siswa (user_id, nama) VALUES ($1, $2)', [user.id, name]);
  }

  // If role is guru, create record in guru table
  if (role === 'guru') {
    await query('INSERT INTO guru (user_id, nama) VALUES ($1, $2)', [user.id, name]);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at,
  };
};

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await query(
    'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset],
  );
  const countResult = await query('SELECT COUNT(*) as total FROM users');
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getUserById = async (id: string) => {
  const result = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [
    id,
  ]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0];
};

export const updateUser = async (id: string, data: Record<string, any>) => {
  const allowedFields = ['name', 'email'];
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      values.push(data[field]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(id);
  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, role, created_at`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
};

export const deleteUser = async (id: string) => {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0];
};

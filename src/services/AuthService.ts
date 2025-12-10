import { query } from '@utils/db';
import { hashPassword, comparePassword } from '@config/bcrypt';
import { generateToken } from '@config/jwt';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: 'guru' | 'siswa';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

export const register = async (payload: RegisterPayload) => {
  const { email, password, name, role } = payload;

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert user
  const userResult = await query(
    'INSERT INTO users (email, password, name, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name, role',
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
  };
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { email, password } = payload;

  try {
    console.log('[AUTH] Login attempt for email:', email);

    // Find user by email
    const userResult = await query(
      'SELECT id, email, password, name, role FROM users WHERE email = $1',
      [email],
    );
    console.log('[AUTH] User lookup completed, rows:', userResult.rows.length);

    if (userResult.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = userResult.rows[0];
    console.log('[AUTH] User found:', user.email, 'role:', user.role);

    // Compare password
    console.log('[AUTH] Starting password comparison...');
    const isPasswordValid = await comparePassword(password, user.password);
    console.log('[AUTH] Password validation completed:', isPasswordValid);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    console.log('[AUTH] Generating JWT token...');
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    console.log('[AUTH] Token generated successfully');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    };
  } catch (error) {
    console.error('[AUTH] Login failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
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

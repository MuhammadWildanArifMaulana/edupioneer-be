import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { config } from './env';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'guru' | 'siswa' | 'admin';
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  console.log(
    '[JWT] Generating token for user:',
    payload.email,
    'with secret length:',
    config.jwt.secret.length,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256',
  } as any);
  console.log('[JWT] Token generated successfully');
  return token;
};

export const verifyToken = (token: string): TokenPayload => {
  console.log('[JWT] Verifying token with secret length:', config.jwt.secret.length);
  const options: VerifyOptions = {
    algorithms: ['HS256'],
  };
  try {
    const decoded = jwt.verify(token, config.jwt.secret, options) as TokenPayload;
    console.log('[JWT] Token verified successfully for user:', decoded.email);
    return decoded;
  } catch (error) {
    console.error(
      '[JWT] Token verification failed:',
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    console.error('[JWT] Decode error:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

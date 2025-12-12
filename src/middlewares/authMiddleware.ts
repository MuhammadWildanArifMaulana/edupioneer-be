import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../config/jwt';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  // Multer may attach a single file or array of files to the request
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Support common header fallbacks (some clients or proxies may use
    // `x-access-token`) and keep header checks case-insensitive via
    // Express `req.headers` (already normalized to lowercase keys).
    const authHeader = (req.headers.authorization as string) || (req.headers['x-access-token'] as string);

    // Optional debug logging to inspect incoming headers when troubleshooting.
    if (!authHeader) {
      if (process.env.AUTH_DEBUG === 'true') {
        console.warn('[AUTH][DEBUG] Missing Authorization header for', req.method, req.originalUrl);
        console.warn('[AUTH][DEBUG] Request headers:', JSON.stringify(req.headers));
      }
      sendError(res, 'Missing authorization header', 401);
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      sendError(res, 'Invalid authorization header format. Use: Bearer <token>', 401);
      return;
    }

    const token = authHeader.substring(7);
    if (!token || token.trim() === '') {
      sendError(res, 'Token is missing', 401);
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Token verification failed';
    sendError(res, 'Unauthorized', 401, new Error(errorMsg));
  }
};

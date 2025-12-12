import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { sendError } from '../utils/response';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, `Forbidden: requires one of ${allowedRoles.join(', ')}`, 403);
      return;
    }

    next();
  };
};

import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as AuthService from '@services/AuthService';
import { sendSuccess, sendError } from '@utils/response';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    if (!['guru', 'siswa'].includes(role)) {
      sendError(res, 'Invalid role. Must be guru or siswa', 400);
      return;
    }

    const user = await AuthService.register({ email, password, name, role });
    sendSuccess(res, user, 'User registered successfully', 201);
  } catch (error) {
    sendError(res, 'Registration failed', 400, error);
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const result = await AuthService.login({ email, password });
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    sendError(res, 'Login failed', 401, error);
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const user = await AuthService.getUserById(req.user.id);
    sendSuccess(res, user, 'User fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch user', 500, error);
  }
};

import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as UserService from '@services/UserService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await UserService.getAllUsers(page, limit);
    sendPaginated(res, data, total, page, limit, 'Users fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch users', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    sendSuccess(res, user, 'User fetched successfully');
  } catch (error) {
    sendError(res, 'User not found', 404, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await UserService.updateUser(id, req.body);
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update user', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await UserService.deleteUser(id);
    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete user', 400, error);
  }
};

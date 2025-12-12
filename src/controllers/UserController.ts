import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as UserService from '@services/UserService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';
import cloudinary from '@config/cloudinary';

// multer will populate req.file when used as route middleware (memory storage expected)

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      sendError(res, 'Missing required fields: email, password, name, role', 400);
      return;
    }

    const user = await UserService.createUser({ email, password, name, role });
    sendSuccess(res, user, 'User created successfully', 201);
  } catch (error: any) {
    if (error.message.includes('already registered')) {
      sendError(res, error.message, 400, error);
    } else {
      sendError(res, 'Failed to create user', 500, error);
    }
  }
};

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

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    // Only allow users to update their own avatar unless admin
    if (req.user && req.user.role !== 'admin' && req.user.id !== id) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    const file = req.file as Express.Multer.File;
    // Upload using base64 data URI
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      folder: 'edupioneer/avatars',
      resource_type: 'image',
      overwrite: true,
    });

    const avatarUrl = uploadRes.secure_url;

    const user = await UserService.updateUser(id, { avatar_url: avatarUrl });
    sendSuccess(res, user, 'Avatar uploaded and user updated successfully');
  } catch (error) {
    console.error('Upload avatar error:', error);
    sendError(res, 'Failed to upload avatar', 500, error);
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

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    // Only allow owner or admin
    if (req.user && req.user.role !== 'admin' && req.user.id !== id) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    await UserService.changeUserPassword(id, current_password, new_password);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    sendError(res, 'Failed to change password', 400, error);
  }
};

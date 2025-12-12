import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as GuruService from '@services/GuruService';
import * as UserService from '@services/UserService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await GuruService.getAllGuru(page, limit);
    sendPaginated(res, data, total, page, limit, 'Guru fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch guru', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const guru = await GuruService.getGuruById(id);
    sendSuccess(res, guru, 'Guru fetched successfully');
  } catch (error) {
    sendError(res, 'Guru not found', 404, error);
  }
};

export const getMapel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mapel = await GuruService.getGuruMapel(id);
    sendSuccess(res, mapel, 'Guru mapel fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch guru mapel', 500, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_id, nama } = req.body;

    if (!user_id) {
      sendError(res, 'Missing required field: user_id', 400);
      return;
    }

    // The `guru` table only stores `user_id`. If a display name was provided,
    // update the corresponding `users` record instead.
    const guru = await GuruService.createGuru({ user_id });
    if (nama) {
      try {
        await UserService.updateUser(user_id, { name: nama });
      } catch (e) {
        // Non-fatal: if updating the user name fails, continue and return created guru
        console.warn('Failed to update user name during guru creation', e);
      }
    }
    sendSuccess(res, guru, 'Guru created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create guru', 400, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const guru = await GuruService.updateGuru(id, req.body);
    sendSuccess(res, guru, 'Guru updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update guru', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await GuruService.deleteGuru(id);
    sendSuccess(res, null, 'Guru deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete guru', 400, error);
  }
};

export const assignMapel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guru_id, mapel_id, kelas_id } = req.body;

    if (!guru_id || !mapel_id || !kelas_id) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const assignment = await GuruService.assignMapel({ guru_id, mapel_id, kelas_id });
    sendSuccess(res, assignment, 'Mapel assigned to guru successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to assign mapel', 400, error);
  }
};

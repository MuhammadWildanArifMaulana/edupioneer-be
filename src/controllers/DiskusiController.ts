import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as DiskusiService from '@services/DiskusiService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kelas_id = req.query.kelas_id as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await DiskusiService.getAllDiskusi(kelas_id, page, limit);
    sendPaginated(res, data, total, page, limit, 'Diskusi fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch diskusi', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const diskusi = await DiskusiService.getDiskusiById(id);
    sendSuccess(res, diskusi, 'Diskusi fetched successfully');
  } catch (error) {
    sendError(res, 'Diskusi not found', 404, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guru_mapel_id, kelas_id, judul, deskripsi } = req.body;

    if (!guru_mapel_id || !kelas_id || !judul) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const diskusi = await DiskusiService.createDiskusi({
      guru_mapel_id,
      kelas_id,
      judul,
      deskripsi,
    });
    sendSuccess(res, diskusi, 'Diskusi created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create diskusi', 400, error);
  }
};

export const postComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { siswa_id, isi } = req.body;

    if (!siswa_id || !isi) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const post = await DiskusiService.postDiskusi({
      diskusi_id: id,
      siswa_id,
      isi,
    });
    sendSuccess(res, post, 'Diskusi post created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to post diskusi comment', 400, error);
  }
};

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const posts = await DiskusiService.getDiskusiPosts(id);
    sendSuccess(res, posts, 'Diskusi posts fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch diskusi posts', 500, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const diskusi = await DiskusiService.updateDiskusi(id, req.body);
    sendSuccess(res, diskusi, 'Diskusi updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update diskusi', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await DiskusiService.deleteDiskusi(id);
    sendSuccess(res, null, 'Diskusi deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete diskusi', 400, error);
  }
};

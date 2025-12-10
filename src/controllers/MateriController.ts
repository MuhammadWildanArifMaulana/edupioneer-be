import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as MateriService from '@services/MateriService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guru_mapel_id = req.query.guru_mapel_id as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await MateriService.getAllMateri(guru_mapel_id, page, limit);
    sendPaginated(res, data, total, page, limit, 'Materi fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch materi', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const materi = await MateriService.getMateriById(id);
    sendSuccess(res, materi, 'Materi fetched successfully');
  } catch (error) {
    sendError(res, 'Materi not found', 404, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guru_mapel_id, judul, deskripsi, file_url } = req.body;

    if (!guru_mapel_id || !judul) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const materi = await MateriService.createMateri({
      guru_mapel_id,
      judul,
      deskripsi,
      file_url,
    });
    sendSuccess(res, materi, 'Materi created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create materi', 400, error);
  }
};

export const recordView = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { siswa_id } = req.body;

    if (!siswa_id) {
      sendError(res, 'siswa_id is required', 400);
      return;
    }

    const view = await MateriService.recordMateriView({ materi_id: id, siswa_id });
    sendSuccess(res, view, 'Materi view recorded successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to record materi view', 400, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const materi = await MateriService.updateMateri(id, req.body);
    sendSuccess(res, materi, 'Materi updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update materi', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await MateriService.deleteMateri(id);
    sendSuccess(res, null, 'Materi deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete materi', 400, error);
  }
};

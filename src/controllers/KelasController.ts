import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as KelasService from '@services/KelasService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await KelasService.getAllKelas(page, limit);
    sendPaginated(res, data, total, page, limit, 'Kelas fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch kelas', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const kelas = await KelasService.getKelasById(id);
    sendSuccess(res, kelas, 'Kelas fetched successfully');
  } catch (error) {
    sendError(res, 'Kelas not found', 404, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nama, tahun_ajaran, semester } = req.body;

    if (!nama || !tahun_ajaran || !semester) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const kelas = await KelasService.createKelas({ nama, tahun_ajaran, semester });
    sendSuccess(res, kelas, 'Kelas created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create kelas', 400, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const kelas = await KelasService.updateKelas(id, req.body);
    sendSuccess(res, kelas, 'Kelas updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update kelas', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await KelasService.deleteKelas(id);
    sendSuccess(res, null, 'Kelas deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete kelas', 400, error);
  }
};

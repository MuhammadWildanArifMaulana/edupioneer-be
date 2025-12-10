import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as NilaiService from '@services/NilaiService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const siswa_id = req.query.siswa_id as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await NilaiService.getAllNilai(siswa_id, page, limit);
    sendPaginated(res, data, total, page, limit, 'Nilai fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch nilai', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const nilai = await NilaiService.getNilaiById(id);
    sendSuccess(res, nilai, 'Nilai fetched successfully');
  } catch (error) {
    sendError(res, 'Nilai not found', 404, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { siswa_id, guru_mapel_id, nilai, semester } = req.body;

    if (!siswa_id || !guru_mapel_id || nilai === undefined || !semester) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const result = await NilaiService.createNilai({
      siswa_id,
      guru_mapel_id,
      nilai,
      semester,
    });
    sendSuccess(res, result, 'Nilai created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create nilai', 400, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const nilai = await NilaiService.updateNilai(id, req.body);
    sendSuccess(res, nilai, 'Nilai updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update nilai', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await NilaiService.deleteNilai(id);
    sendSuccess(res, null, 'Nilai deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete nilai', 400, error);
  }
};

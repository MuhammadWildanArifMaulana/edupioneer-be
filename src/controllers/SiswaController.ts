import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as SiswaService from '@services/SiswaService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await SiswaService.getAllSiswa(page, limit);
    sendPaginated(res, data, total, page, limit, 'Siswa fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch siswa', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const siswa = await SiswaService.getSiswaById(id);
    sendSuccess(res, siswa, 'Siswa fetched successfully');
  } catch (error) {
    sendError(res, 'Siswa not found', 404, error);
  }
};

export const getKelas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const siswa = await SiswaService.getSiswaById(id);
    const siswaByKelas = await SiswaService.getSiswaByKelas(siswa.kelas_id);
    sendSuccess(res, siswaByKelas, 'Siswa in kelas fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch siswa', 500, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_id, nama, kelas_id } = req.body;

    if (!user_id || !nama) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const siswa = await SiswaService.createSiswa({ user_id, nama, kelas_id });
    sendSuccess(res, siswa, 'Siswa created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create siswa', 400, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const siswa = await SiswaService.updateSiswa(id, req.body);
    sendSuccess(res, siswa, 'Siswa updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update siswa', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await SiswaService.deleteSiswa(id);
    sendSuccess(res, null, 'Siswa deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete siswa', 400, error);
  }
};

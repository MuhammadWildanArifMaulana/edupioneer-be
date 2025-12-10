import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as AbsensiService from '@services/AbsensiService';
import { sendSuccess, sendError } from '@utils/response';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guru_mapel_id, kelas_id, tanggal } = req.body;

    if (!guru_mapel_id || !kelas_id || !tanggal) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const absensi = await AbsensiService.createAbsensi({
      guru_mapel_id,
      kelas_id,
      tanggal,
    });
    sendSuccess(res, absensi, 'Absensi created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create absensi', 400, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const absensi = await AbsensiService.getAbsensiById(id);
    sendSuccess(res, absensi, 'Absensi fetched successfully');
  } catch (error) {
    sendError(res, 'Absensi not found', 404, error);
  }
};

export const recordDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { siswa_id, status } = req.body;

    if (!siswa_id || !status) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    if (!['hadir', 'izin', 'alfa'].includes(status)) {
      sendError(res, 'Invalid status. Must be hadir, izin, or alfa', 400);
      return;
    }

    const detail = await AbsensiService.recordAbsensiDetail({
      absensi_id: id,
      siswa_id,
      status,
    });
    sendSuccess(res, detail, 'Absensi detail recorded successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to record absensi detail', 400, error);
  }
};

export const getDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const detail = await AbsensiService.getAbsensiDetail(id);
    sendSuccess(res, detail, 'Absensi details fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch absensi details', 500, error);
  }
};

export const getBySiswa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const siswa_id = req.query.siswa_id as string | undefined;

    if (!siswa_id) {
      sendError(res, 'siswa_id query parameter is required', 400);
      return;
    }

    const absensi = await AbsensiService.getAbsenisiBySiswa(siswa_id);
    sendSuccess(res, absensi, 'Siswa absensi fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch siswa absensi', 500, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await AbsensiService.deleteAbsensi(id);
    sendSuccess(res, null, 'Absensi deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete absensi', 400, error);
  }
};

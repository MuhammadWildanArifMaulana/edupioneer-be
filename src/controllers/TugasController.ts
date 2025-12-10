import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as TugasService from '@services/TugasService';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kelas_id = req.query.kelas_id as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, total } = await TugasService.getAllTugas(kelas_id, page, limit);
    sendPaginated(res, data, total, page, limit, 'Tugas fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch tugas', 500, error);
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tugas = await TugasService.getTugasById(id);
    sendSuccess(res, tugas, 'Tugas fetched successfully');
  } catch (error) {
    sendError(res, 'Tugas not found', 404, error);
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guru_mapel_id, kelas_id, judul, deskripsi, deadline } = req.body;

    if (!guru_mapel_id || !kelas_id || !judul || !deadline) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const tugas = await TugasService.createTugas({
      guru_mapel_id,
      kelas_id,
      judul,
      deskripsi,
      deadline,
    });
    sendSuccess(res, tugas, 'Tugas created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create tugas', 400, error);
  }
};

export const submit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tugas_id, siswa_id, file_url, jawaban } = req.body;

    if (!tugas_id || !siswa_id) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const submission = await TugasService.submitTugas({
      tugas_id,
      siswa_id,
      file_url,
      jawaban,
    });
    sendSuccess(res, submission, 'Tugas submitted successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to submit tugas', 400, error);
  }
};

export const getSubmits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const submits = await TugasService.getTugasSubmits(id);
    sendSuccess(res, submits, 'Tugas submits fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch tugas submits', 500, error);
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tugas = await TugasService.updateTugas(id, req.body);
    sendSuccess(res, tugas, 'Tugas updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update tugas', 400, error);
  }
};

export const delete_ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await TugasService.deleteTugas(id);
    sendSuccess(res, null, 'Tugas deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete tugas', 400, error);
  }
};

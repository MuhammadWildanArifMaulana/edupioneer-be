import { Response } from 'express';
import { AuthRequest } from '@middlewares/authMiddleware';
import * as TugasService from '@services/TugasService';
import * as GuruService from '@services/GuruService';
import * as SiswaService from '@services/SiswaService';
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
    const { tugas_id: body_tugas_id, siswa_id: body_siswa_id, file_url, jawaban } = req.body;

    if (!body_tugas_id) {
      sendError(res, 'Missing required field: tugas_id', 400);
      return;
    }

    // If the requester is a siswa, map users.id -> siswa.id automatically
    let siswa_id = body_siswa_id;
    if (req.user && req.user.role === 'siswa') {
      try {
        const siswa = await SiswaService.getSiswaByUserId(req.user.id);
        siswa_id = siswa.id;
      } catch (err) {
        sendError(res, 'Siswa record not found for the authenticated user', 400, err);
        return;
      }
    }

    if (!siswa_id) {
      sendError(res, 'Missing required field: siswa_id', 400);
      return;
    }

    const submission = await TugasService.submitTugas({
      tugas_id: body_tugas_id,
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

export const getSubmissionsForGuru = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    // Map authenticated user -> guru record
    const guru = await GuruService.getGuruByUserId(req.user.id);
    const submissions = await TugasService.getSubmissionsForGuru(guru.id);
    sendSuccess(res, submissions, 'Submissions fetched successfully');
  } catch (error) {
    console.error('Error fetching submissions for guru:', error);
    sendError(res, 'Failed to fetch submissions', 500, error);
  }
};

export const updateSubmit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { file_url, jawaban } = req.body;

    if (file_url === undefined && jawaban === undefined) {
      sendError(res, 'No fields to update', 400);
      return;
    }

    // Fetch submission to verify ownership and existence
    const submission = await TugasService.getSubmissionById(id);

    if (req.user && req.user.role === 'siswa') {
      // Map authenticated user -> siswa record
      let siswa;
      try {
        siswa = await SiswaService.getSiswaByUserId(req.user.id);
      } catch (err) {
        sendError(res, 'Siswa record not found for the authenticated user', 400, err);
        return;
      }

      if (submission.siswa_id !== siswa.id) {
        sendError(res, "Forbidden: cannot modify another student's submission", 403);
        return;
      }
    }

    const updated = await TugasService.updateSubmission(id, { file_url, jawaban });
    sendSuccess(res, updated, 'Submission updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update submission', 400, error);
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

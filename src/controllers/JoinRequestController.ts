import { Request, Response } from 'express';
import * as JoinRequestService from '@services/JoinRequestService';
import { AuthRequest } from '@middlewares/authMiddleware';
import { sendSuccess, sendError } from '@utils/response';
import { getSiswaByUserId } from '@services/SiswaService';
import { getGuruByUserId } from '@services/GuruService';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const kelasId = req.params.id;
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    // find siswa by user id
    const siswa = await getSiswaByUserId(req.user.id);
    if (!siswa) return sendError(res, 'Siswa profile not found', 400);

    // if siswa already has kelas, disallow
    if (siswa.kelas_id) return sendError(res, 'Siswa already enrolled in a class', 400);

    const created = await JoinRequestService.createJoinRequest(siswa.id, kelasId);
    return sendSuccess(res, 'Request created', created);
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Error', 400);
  }
};

export const listByKelas = async (req: AuthRequest, res: Response) => {
  try {
    const kelasId = req.params.id;
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    // Verify current user is a guru who teaches this kelas or admin
    if (req.user.role !== 'admin') {
      // get guru by user id
      const guru = await getGuruByUserId(req.user.id);
      if (!guru) return sendError(res, 'Forbidden', 403);
      // verify guru teaches kelas
      const gm = await (
        await import('@utils/db')
      ).query('SELECT id FROM guru_mapel WHERE guru_id = $1 AND kelas_id = $2', [guru.id, kelasId]);
      if (gm.rows.length === 0) return sendError(res, 'Forbidden', 403);
    }

    const list = await JoinRequestService.getJoinRequestsByKelas(kelasId);
    return sendSuccess(res, 'OK', list);
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Error', 400);
  }
};

export const listForGuru = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    if (req.user.role !== 'guru' && req.user.role !== 'admin')
      return sendError(res, 'Forbidden', 403);
    const list = await JoinRequestService.getJoinRequestsForGuru(req.user.id);
    return sendSuccess(res, 'OK', list);
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Error', 400);
  }
};

export const decide = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { action } = req.body; // 'accept' or 'reject'
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    if (req.user.role !== 'guru' && req.user.role !== 'admin')
      return sendError(res, 'Forbidden', 403);
    if (!['accept', 'reject'].includes(action)) return sendError(res, 'Invalid action', 400);

    // Additional check: if guru, ensure they teach the kelas linked to the join request
    // get join request to find kelas_id
    const jr = await (
      await import('@utils/db')
    ).query('SELECT id, kelas_id FROM join_requests WHERE id = $1', [id]);
    if (jr.rows.length === 0) return sendError(res, 'Join request not found', 404);
    const kelasId = jr.rows[0].kelas_id;

    if (req.user.role !== 'admin') {
      const guru = await getGuruByUserId(req.user.id);
      const gm = await (
        await import('@utils/db')
      ).query('SELECT id FROM guru_mapel WHERE guru_id = $1 AND kelas_id = $2', [guru.id, kelasId]);
      if (gm.rows.length === 0) return sendError(res, 'Forbidden', 403);
    }

    const updated = await JoinRequestService.decideJoinRequest(id, action);
    return sendSuccess(res, 'OK', updated);
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Error', 400);
  }
};

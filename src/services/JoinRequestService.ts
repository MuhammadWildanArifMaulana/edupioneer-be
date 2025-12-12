import { query } from '../utils/db';
import { getSiswaByUserId } from './SiswaService';
import { getGuruByUserId } from './GuruService';

export const createJoinRequest = async (siswaId: string, kelasId: string) => {
  // Prevent duplicate pending/accepted requests
  const exists = await query(
    "SELECT id FROM join_requests WHERE siswa_id = $1 AND kelas_id = $2 AND status IN ('pending', 'accepted')",
    [siswaId, kelasId],
  );
  if (exists.rows.length > 0) {
    throw new Error('Join request already exists or student already enrolled');
  }

  const res = await query(
    'INSERT INTO join_requests (siswa_id, kelas_id, status) VALUES ($1, $2, $3) RETURNING id, siswa_id, kelas_id, status, created_at',
    [siswaId, kelasId, 'pending'],
  );
  return res.rows[0];
};

export const getJoinRequestsByKelas = async (kelasId: string) => {
  const res = await query(
    'SELECT jr.id, jr.siswa_id, jr.kelas_id, jr.status, jr.created_at, s.nama as siswa_nama, u.email as siswa_email, k.nama as kelas_nama FROM join_requests jr JOIN siswa s ON jr.siswa_id = s.id JOIN users u ON s.user_id = u.id JOIN kelas k ON jr.kelas_id = k.id WHERE jr.kelas_id = $1 AND jr.status = $2 ORDER BY jr.created_at',
    [kelasId, 'pending'],
  );
  return res.rows;
};

export const decideJoinRequest = async (
  joinRequestId: string,
  action: 'accept' | 'reject',
  guruUserId?: string,
) => {
  // Fetch join request
  const reqRes = await query(
    'SELECT id, siswa_id, kelas_id, status FROM join_requests WHERE id = $1',
    [joinRequestId],
  );
  if (reqRes.rows.length === 0) throw new Error('Join request not found');
  const reqRow = reqRes.rows[0];

  if (reqRow.status !== 'pending') throw new Error('Join request already processed');

  if (action === 'accept') {
    // Update siswa.kelas_id and mark request accepted in a transaction
    await query('BEGIN');
    try {
      await query('UPDATE siswa SET kelas_id = $1 WHERE id = $2', [
        reqRow.kelas_id,
        reqRow.siswa_id,
      ]);
      await query('UPDATE join_requests SET status = $1, updated_at = now() WHERE id = $2', [
        'accepted',
        joinRequestId,
      ]);
      await query('COMMIT');
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } else {
    await query('UPDATE join_requests SET status = $1, updated_at = now() WHERE id = $2', [
      'rejected',
      joinRequestId,
    ]);
  }

  const updated = await query(
    'SELECT id, siswa_id, kelas_id, status, updated_at FROM join_requests WHERE id = $1',
    [joinRequestId],
  );
  return updated.rows[0];
};

export const getJoinRequestsForGuru = async (guruUserId: string) => {
  // find guru id
  const guru = await getGuruByUserId(guruUserId).catch(() => null);
  if (!guru) throw new Error('Guru not found');

  // get kelas ids taught by guru
  const gm = await query('SELECT kelas_id FROM guru_mapel WHERE guru_id = $1', [guru.id]);
  const kelasIds = gm.rows.map((r: any) => r.kelas_id);
  if (kelasIds.length === 0) return [];

  const res = await query(
    `SELECT jr.id, jr.siswa_id, jr.kelas_id, jr.status, jr.created_at, s.nama as siswa_nama, u.email as siswa_email, k.nama as kelas_nama
      FROM join_requests jr
      JOIN siswa s ON jr.siswa_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN kelas k ON jr.kelas_id = k.id
      WHERE jr.kelas_id = ANY($1::uuid[]) AND jr.status = $2
      ORDER BY jr.created_at`,
    [kelasIds, 'pending'],
  );
  return res.rows;
};

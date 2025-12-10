import { query } from '@utils/db';

export const getAllTugas = async (kelasId?: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  let result;
  let countResult;

  if (kelasId) {
    result = await query(
      'SELECT t.id, t.guru_mapel_id, t.kelas_id, t.judul, t.deskripsi, t.deadline, t.created_at FROM tugas t WHERE t.kelas_id = $1 ORDER BY t.deadline DESC LIMIT $2 OFFSET $3',
      [kelasId, limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM tugas WHERE kelas_id = $1', [kelasId]);
  } else {
    result = await query(
      'SELECT t.id, t.guru_mapel_id, t.kelas_id, t.judul, t.deskripsi, t.deadline, t.created_at FROM tugas t ORDER BY t.deadline DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM tugas');
  }

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getTugasById = async (id: string) => {
  const result = await query(
    'SELECT id, guru_mapel_id, kelas_id, judul, deskripsi, deadline, created_at FROM tugas WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('Tugas not found');
  }
  return result.rows[0];
};

export const createTugas = async (data: {
  guru_mapel_id: string;
  kelas_id: string;
  judul: string;
  deskripsi?: string;
  deadline: string;
}) => {
  const result = await query(
    'INSERT INTO tugas (guru_mapel_id, kelas_id, judul, deskripsi, deadline, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, guru_mapel_id, kelas_id, judul, deskripsi, deadline, created_at',
    [data.guru_mapel_id, data.kelas_id, data.judul, data.deskripsi || null, data.deadline],
  );
  return result.rows[0];
};

export const submitTugas = async (data: {
  tugas_id: string;
  siswa_id: string;
  file_url?: string;
  jawaban?: string;
}) => {
  const result = await query(
    'INSERT INTO tugas_submit (tugas_id, siswa_id, file_url, jawaban, submitted_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, tugas_id, siswa_id, file_url, jawaban, submitted_at',
    [data.tugas_id, data.siswa_id, data.file_url || null, data.jawaban || null],
  );
  return result.rows[0];
};

export const getTugasSubmits = async (tugasId: string) => {
  const result = await query(
    'SELECT ts.id, ts.tugas_id, ts.siswa_id, ts.file_url, ts.jawaban, ts.submitted_at, s.nama as siswa_nama FROM tugas_submit ts JOIN siswa s ON ts.siswa_id = s.id WHERE ts.tugas_id = $1 ORDER BY ts.submitted_at DESC',
    [tugasId],
  );
  return result.rows;
};

export const updateTugas = async (id: string, data: Record<string, any>) => {
  const allowedFields = ['judul', 'deskripsi', 'deadline'];
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      values.push(data[field]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(id);
  const result = await query(
    `UPDATE tugas SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, guru_mapel_id, kelas_id, judul, deskripsi, deadline, created_at`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Tugas not found');
  }

  return result.rows[0];
};

export const deleteTugas = async (id: string) => {
  const result = await query('DELETE FROM tugas WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Tugas not found');
  }
  return result.rows[0];
};

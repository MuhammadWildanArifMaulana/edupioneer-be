import { query } from '@utils/db';

export const createDiskusi = async (data: {
  guru_mapel_id: string;
  kelas_id: string;
  judul: string;
  deskripsi?: string;
}) => {
  const result = await query(
    'INSERT INTO diskusi (guru_mapel_id, kelas_id, judul, deskripsi, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, guru_mapel_id, kelas_id, judul, deskripsi, created_at',
    [data.guru_mapel_id, data.kelas_id, data.judul, data.deskripsi || null],
  );
  return result.rows[0];
};

export const getDiskusiById = async (id: string) => {
  const result = await query(
    'SELECT id, guru_mapel_id, kelas_id, judul, deskripsi, created_at FROM diskusi WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('Diskusi not found');
  }
  return result.rows[0];
};

export const getAllDiskusi = async (kelasId?: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  let result;
  let countResult;

  if (kelasId) {
    result = await query(
      'SELECT d.id, d.guru_mapel_id, d.kelas_id, d.judul, d.deskripsi, d.created_at FROM diskusi d WHERE d.kelas_id = $1 ORDER BY d.created_at DESC LIMIT $2 OFFSET $3',
      [kelasId, limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM diskusi WHERE kelas_id = $1', [
      kelasId,
    ]);
  } else {
    result = await query(
      'SELECT d.id, d.guru_mapel_id, d.kelas_id, d.judul, d.deskripsi, d.created_at FROM diskusi d ORDER BY d.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM diskusi');
  }

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const postDiskusi = async (data: { diskusi_id: string; siswa_id: string; isi: string }) => {
  const result = await query(
    'INSERT INTO diskusi_post (diskusi_id, siswa_id, isi, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, diskusi_id, siswa_id, isi, created_at',
    [data.diskusi_id, data.siswa_id, data.isi],
  );
  return result.rows[0];
};

export const getDiskusiPosts = async (diskusiId: string) => {
  const result = await query(
    'SELECT dp.id, dp.diskusi_id, dp.siswa_id, dp.isi, dp.created_at, s.nama as siswa_nama FROM diskusi_post dp JOIN siswa s ON dp.siswa_id = s.id WHERE dp.diskusi_id = $1 ORDER BY dp.created_at DESC',
    [diskusiId],
  );
  return result.rows;
};

export const updateDiskusi = async (id: string, data: Record<string, any>) => {
  const allowedFields = ['judul', 'deskripsi'];
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
    `UPDATE diskusi SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, guru_mapel_id, kelas_id, judul, deskripsi, created_at`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Diskusi not found');
  }

  return result.rows[0];
};

export const deleteDiskusi = async (id: string) => {
  const result = await query('DELETE FROM diskusi WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Diskusi not found');
  }
  return result.rows[0];
};

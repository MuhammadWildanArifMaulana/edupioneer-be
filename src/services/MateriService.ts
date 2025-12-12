import { query } from '@utils/db';

export const getAllMateri = async (guruMapelId?: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  let result;
  let countResult;

  if (guruMapelId) {
    result = await query(
      'SELECT m.id, m.guru_mapel_id, m.judul, m.deskripsi, m.file_url, m.gambar, m.created_at FROM materi m WHERE m.guru_mapel_id = $1 ORDER BY m.created_at DESC LIMIT $2 OFFSET $3',
      [guruMapelId, limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM materi WHERE guru_mapel_id = $1', [
      guruMapelId,
    ]);
  } else {
    result = await query(
      'SELECT m.id, m.guru_mapel_id, m.judul, m.deskripsi, m.file_url, m.gambar, m.created_at FROM materi m ORDER BY m.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM materi');
  }

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getMateriById = async (id: string) => {
  const result = await query(
    'SELECT id, guru_mapel_id, judul, deskripsi, file_url, gambar, created_at FROM materi WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('Materi not found');
  }
  return result.rows[0];
};

export const createMateri = async (data: {
  guru_mapel_id: string;
  judul: string;
  deskripsi?: string;
  file_url?: string;
  gambar?: string;
}) => {
  const result = await query(
    'INSERT INTO materi (guru_mapel_id, judul, deskripsi, file_url, gambar, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, guru_mapel_id, judul, deskripsi, file_url, gambar, created_at',
    [
      data.guru_mapel_id,
      data.judul,
      data.deskripsi || null,
      data.file_url || null,
      data.gambar || null,
    ],
  );
  return result.rows[0];
};

export const recordMateriView = async (data: { materi_id: string; siswa_id: string }) => {
  const result = await query(
    'INSERT INTO materi_view (materi_id, siswa_id, viewed_at) VALUES ($1, $2, NOW()) RETURNING id, materi_id, siswa_id, viewed_at',
    [data.materi_id, data.siswa_id],
  );
  return result.rows[0];
};

export const updateMateri = async (id: string, data: Record<string, any>) => {
  const allowedFields = ['judul', 'deskripsi', 'file_url', 'gambar'];
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
    `UPDATE materi SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, guru_mapel_id, judul, deskripsi, file_url, gambar, created_at`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Materi not found');
  }

  return result.rows[0];
};

export const deleteMateri = async (id: string) => {
  const result = await query('DELETE FROM materi WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Materi not found');
  }
  return result.rows[0];
};

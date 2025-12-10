import { query } from '@utils/db';

export const getAllGuru = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await query(
    'SELECT g.id, g.user_id, g.nama, u.email, u.role FROM guru g JOIN users u ON g.user_id = u.id ORDER BY g.nama LIMIT $1 OFFSET $2',
    [limit, offset],
  );
  const countResult = await query('SELECT COUNT(*) as total FROM guru');
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getGuruById = async (id: string) => {
  const result = await query(
    'SELECT g.id, g.user_id, g.nama, u.email, u.role FROM guru g JOIN users u ON g.user_id = u.id WHERE g.id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('Guru not found');
  }
  return result.rows[0];
};

export const getGuruMapel = async (guruId: string) => {
  const result = await query(
    'SELECT gm.id, gm.guru_id, gm.mapel_id, gm.kelas_id, m.nama as mapel_nama, k.nama as kelas_nama FROM guru_mapel gm JOIN mapel m ON gm.mapel_id = m.id JOIN kelas k ON gm.kelas_id = k.id WHERE gm.guru_id = $1',
    [guruId],
  );
  return result.rows;
};

export const createGuru = async (data: { user_id: string; nama: string }) => {
  const result = await query(
    'INSERT INTO guru (user_id, nama) VALUES ($1, $2) RETURNING id, user_id, nama',
    [data.user_id, data.nama],
  );
  return result.rows[0];
};

export const updateGuru = async (id: string, data: Record<string, any>) => {
  if (data.nama === undefined) {
    throw new Error('No valid fields to update');
  }

  const result = await query(
    'UPDATE guru SET nama = $1 WHERE id = $2 RETURNING id, user_id, nama',
    [data.nama, id],
  );

  if (result.rows.length === 0) {
    throw new Error('Guru not found');
  }

  return result.rows[0];
};

export const deleteGuru = async (id: string) => {
  const result = await query('DELETE FROM guru WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Guru not found');
  }
  return result.rows[0];
};

export const assignMapel = async (data: {
  guru_id: string;
  mapel_id: string;
  kelas_id: string;
}) => {
  const result = await query(
    'INSERT INTO guru_mapel (guru_id, mapel_id, kelas_id) VALUES ($1, $2, $3) RETURNING id, guru_id, mapel_id, kelas_id',
    [data.guru_id, data.mapel_id, data.kelas_id],
  );
  return result.rows[0];
};

import { query } from '../utils/db';

export const getAllGuru = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await query(
    'SELECT g.id, g.user_id, u.name as nama, u.email, u.role FROM guru g JOIN users u ON g.user_id = u.id ORDER BY u.name LIMIT $1 OFFSET $2',
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
    'SELECT g.id, g.user_id, u.name as nama, u.email, u.role FROM guru g JOIN users u ON g.user_id = u.id WHERE g.id = $1',
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

export const getGuruByUserId = async (userId: string) => {
  const result = await query(
    'SELECT g.id, g.user_id, u.name as nama, u.email, u.role FROM guru g JOIN users u ON g.user_id = u.id WHERE g.user_id = $1',
    [userId],
  );
  if (result.rows.length === 0) {
    throw new Error('Guru not found for given user id');
  }
  return result.rows[0];
};

export const createGuru = async (data: { user_id: string }) => {
  const result = await query('INSERT INTO guru (user_id) VALUES ($1) RETURNING id, user_id', [
    data.user_id,
  ]);
  return result.rows[0];
};

export const updateGuru = async (id: string, data: Record<string, any>) => {
  // The `guru` table no longer stores a separate `nama` column.
  // Updates to the guru's name should be performed on the `users` table.
  throw new Error('No updatable fields on guru; update the corresponding user record instead');
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
  // Verify referenced records exist to provide clearer errors
  const guruRes = await query('SELECT id FROM guru WHERE id = $1', [data.guru_id]);
  if (guruRes.rows.length === 0) {
    throw new Error('Guru not found');
  }

  const mapelRes = await query('SELECT id FROM mapel WHERE id = $1', [data.mapel_id]);
  if (mapelRes.rows.length === 0) {
    throw new Error('Mapel not found');
  }

  const kelasRes = await query('SELECT id FROM kelas WHERE id = $1', [data.kelas_id]);
  if (kelasRes.rows.length === 0) {
    throw new Error('Kelas not found');
  }

  // Prevent duplicate assignment
  const exists = await query(
    'SELECT id FROM guru_mapel WHERE guru_id = $1 AND mapel_id = $2 AND kelas_id = $3',
    [data.guru_id, data.mapel_id, data.kelas_id],
  );
  if (exists.rows.length > 0) {
    throw new Error('Assignment already exists');
  }

  const result = await query(
    'INSERT INTO guru_mapel (guru_id, mapel_id, kelas_id) VALUES ($1, $2, $3) RETURNING id, guru_id, mapel_id, kelas_id',
    [data.guru_id, data.mapel_id, data.kelas_id],
  );
  return result.rows[0];
};

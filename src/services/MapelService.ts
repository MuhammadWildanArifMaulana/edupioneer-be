import { query } from '@utils/db';

export const getAllMapel = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await query('SELECT id, nama FROM mapel ORDER BY nama LIMIT $1 OFFSET $2', [
    limit,
    offset,
  ]);
  const countResult = await query('SELECT COUNT(*) as total FROM mapel');
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getMapelById = async (id: string) => {
  const result = await query('SELECT id, nama FROM mapel WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    throw new Error('Mapel not found');
  }
  return result.rows[0];
};

export const createMapel = async (data: { nama: string }) => {
  const result = await query('INSERT INTO mapel (nama) VALUES ($1) RETURNING id, nama', [
    data.nama,
  ]);
  return result.rows[0];
};

export const updateMapel = async (id: string, data: Record<string, any>) => {
  if (data.nama === undefined) {
    throw new Error('No valid fields to update');
  }

  const result = await query('UPDATE mapel SET nama = $1 WHERE id = $2 RETURNING id, nama', [
    data.nama,
    id,
  ]);

  if (result.rows.length === 0) {
    throw new Error('Mapel not found');
  }

  return result.rows[0];
};

export const deleteMapel = async (id: string) => {
  const result = await query('DELETE FROM mapel WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Mapel not found');
  }
  return result.rows[0];
};

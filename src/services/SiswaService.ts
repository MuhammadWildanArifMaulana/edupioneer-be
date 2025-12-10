import { query } from '@utils/db';

export const getAllSiswa = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await query(
    'SELECT s.id, s.user_id, s.nama, s.kelas_id, u.email, k.nama as kelas_nama FROM siswa s JOIN users u ON s.user_id = u.id LEFT JOIN kelas k ON s.kelas_id = k.id ORDER BY s.nama LIMIT $1 OFFSET $2',
    [limit, offset],
  );
  const countResult = await query('SELECT COUNT(*) as total FROM siswa');
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getSiswaById = async (id: string) => {
  const result = await query(
    'SELECT s.id, s.user_id, s.nama, s.kelas_id, u.email, k.nama as kelas_nama FROM siswa s JOIN users u ON s.user_id = u.id LEFT JOIN kelas k ON s.kelas_id = k.id WHERE s.id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('Siswa not found');
  }
  return result.rows[0];
};

export const getSiswaByUserId = async (userId: string) => {
  const result = await query(
    'SELECT s.id, s.user_id, s.nama, s.kelas_id, u.email, k.nama as kelas_nama FROM siswa s JOIN users u ON s.user_id = u.id LEFT JOIN kelas k ON s.kelas_id = k.id WHERE s.user_id = $1',
    [userId],
  );
  if (result.rows.length === 0) {
    throw new Error('Siswa not found for this user');
  }
  return result.rows[0];
};

export const createSiswa = async (data: { user_id: string; nama: string; kelas_id?: string }) => {
  const result = await query(
    'INSERT INTO siswa (user_id, nama, kelas_id) VALUES ($1, $2, $3) RETURNING id, user_id, nama, kelas_id',
    [data.user_id, data.nama, data.kelas_id || null],
  );
  return result.rows[0];
};

export const updateSiswa = async (id: string, data: Record<string, any>) => {
  const allowedFields = ['nama', 'kelas_id'];
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
    `UPDATE siswa SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, user_id, nama, kelas_id`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Siswa not found');
  }

  return result.rows[0];
};

export const deleteSiswa = async (id: string) => {
  const result = await query('DELETE FROM siswa WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Siswa not found');
  }
  return result.rows[0];
};

export const getSiswaByKelas = async (kelasId: string) => {
  const result = await query(
    'SELECT s.id, s.user_id, s.nama, u.email FROM siswa s JOIN users u ON s.user_id = u.id WHERE s.kelas_id = $1 ORDER BY s.nama',
    [kelasId],
  );
  return result.rows;
};

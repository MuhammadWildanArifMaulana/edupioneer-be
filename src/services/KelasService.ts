import { query } from '@utils/db';

export const getAllKelas = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await query(
    'SELECT id, nama, tahun_ajaran, semester FROM kelas ORDER BY tahun_ajaran DESC LIMIT $1 OFFSET $2',
    [limit, offset],
  );
  const countResult = await query('SELECT COUNT(*) as total FROM kelas');
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getKelasById = async (id: string) => {
  const result = await query('SELECT id, nama, tahun_ajaran, semester FROM kelas WHERE id = $1', [
    id,
  ]);
  if (result.rows.length === 0) {
    throw new Error('Kelas not found');
  }
  return result.rows[0];
};

export const createKelas = async (data: {
  nama: string;
  tahun_ajaran: string;
  semester: number;
}) => {
  const result = await query(
    'INSERT INTO kelas (nama, tahun_ajaran, semester) VALUES ($1, $2, $3) RETURNING id, nama, tahun_ajaran, semester',
    [data.nama, data.tahun_ajaran, data.semester],
  );
  return result.rows[0];
};

export const updateKelas = async (id: string, data: Record<string, any>) => {
  const allowedFields = ['nama', 'tahun_ajaran', 'semester'];
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
    `UPDATE kelas SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, nama, tahun_ajaran, semester`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Kelas not found');
  }

  return result.rows[0];
};

export const deleteKelas = async (id: string) => {
  const result = await query('DELETE FROM kelas WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Kelas not found');
  }
  return result.rows[0];
};

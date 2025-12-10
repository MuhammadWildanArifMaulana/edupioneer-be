import { query } from '@utils/db';

export const getAllNilai = async (siswaId?: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  let result;
  let countResult;

  if (siswaId) {
    result = await query(
      'SELECT n.id, n.siswa_id, n.guru_mapel_id, n.nilai, n.semester, m.nama as mapel_nama FROM nilai_mapel n JOIN guru_mapel gm ON n.guru_mapel_id = gm.id JOIN mapel m ON gm.mapel_id = m.id WHERE n.siswa_id = $1 ORDER BY n.semester DESC LIMIT $2 OFFSET $3',
      [siswaId, limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM nilai_mapel WHERE siswa_id = $1', [
      siswaId,
    ]);
  } else {
    result = await query(
      'SELECT n.id, n.siswa_id, n.guru_mapel_id, n.nilai, n.semester, m.nama as mapel_nama FROM nilai_mapel n JOIN guru_mapel gm ON n.guru_mapel_id = gm.id JOIN mapel m ON gm.mapel_id = m.id ORDER BY n.semester DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );
    countResult = await query('SELECT COUNT(*) as total FROM nilai_mapel');
  }

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getNilaiById = async (id: string) => {
  const result = await query(
    'SELECT id, siswa_id, guru_mapel_id, nilai, semester FROM nilai_mapel WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('Nilai not found');
  }
  return result.rows[0];
};

export const createNilai = async (data: {
  siswa_id: string;
  guru_mapel_id: string;
  nilai: number;
  semester: number;
}) => {
  const result = await query(
    'INSERT INTO nilai_mapel (siswa_id, guru_mapel_id, nilai, semester) VALUES ($1, $2, $3, $4) RETURNING id, siswa_id, guru_mapel_id, nilai, semester',
    [data.siswa_id, data.guru_mapel_id, data.nilai, data.semester],
  );
  return result.rows[0];
};

export const updateNilai = async (id: string, data: Record<string, any>) => {
  const allowedFields = ['nilai', 'semester'];
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
    `UPDATE nilai_mapel SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, siswa_id, guru_mapel_id, nilai, semester`,
    values,
  );

  if (result.rows.length === 0) {
    throw new Error('Nilai not found');
  }

  return result.rows[0];
};

export const deleteNilai = async (id: string) => {
  const result = await query('DELETE FROM nilai_mapel WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Nilai not found');
  }
  return result.rows[0];
};

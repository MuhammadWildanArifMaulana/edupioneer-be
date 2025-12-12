import { query } from '@utils/db';

export const createAbsensi = async (data: {
  guru_mapel_id: string;
  kelas_id: string;
  tanggal: string;
}) => {
  const result = await query(
    'INSERT INTO absensi (guru_mapel_id, kelas_id, tanggal, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, guru_mapel_id, kelas_id, tanggal, created_at',
    [data.guru_mapel_id, data.kelas_id, data.tanggal],
  );
  return result.rows[0];
};

export const getAbsensiById = async (id: string) => {
  const result = await query(
    'SELECT id, guru_mapel_id, kelas_id, tanggal, created_at FROM absensi WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('Absensi not found');
  }
  return result.rows[0];
};

export const recordAbsensiDetail = async (data: {
  absensi_id: string;
  siswa_id: string;
  status: 'hadir' | 'izin' | 'alfa';
}) => {
  const result = await query(
    'INSERT INTO absensi_detail (absensi_id, siswa_id, status) VALUES ($1, $2, $3) RETURNING id, absensi_id, siswa_id, status',
    [data.absensi_id, data.siswa_id, data.status],
  );
  return result.rows[0];
};

export const getAbsensiDetail = async (absensiId: string) => {
  const result = await query(
    'SELECT ad.id, ad.absensi_id, ad.siswa_id, ad.status, s.nama as siswa_nama FROM absensi_detail ad JOIN siswa s ON ad.siswa_id = s.id WHERE ad.absensi_id = $1 ORDER BY s.nama',
    [absensiId],
  );
  return result.rows;
};

export const getAbsenisiBySiswa = async (siswaId: string) => {
  const result = await query(
    'SELECT a.id, a.tanggal, ad.status, gm.id as guru_mapel_id FROM absensi a JOIN absensi_detail ad ON a.id = ad.absensi_id JOIN guru_mapel gm ON a.guru_mapel_id = gm.id WHERE ad.siswa_id = $1 ORDER BY a.tanggal DESC',
    [siswaId],
  );
  return result.rows;
};

export const getAllAbsensi = async (kelasId: string | undefined, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  if (kelasId) {
    const result = await query(
      'SELECT id, guru_mapel_id, kelas_id, tanggal, created_at FROM absensi WHERE kelas_id = $1 ORDER BY tanggal DESC LIMIT $2 OFFSET $3',
      [kelasId, limit, offset],
    );
    const countRes = await query('SELECT COUNT(*) as total FROM absensi WHERE kelas_id = $1', [
      kelasId,
    ]);
    const total = Number(countRes.rows[0]?.total || '0');
    return { data: result.rows, total };
  }
  const result = await query(
    'SELECT id, guru_mapel_id, kelas_id, tanggal, created_at FROM absensi ORDER BY tanggal DESC LIMIT $1 OFFSET $2',
    [limit, offset],
  );
  const countRes = await query('SELECT COUNT(*) as total FROM absensi');
  const total = Number(countRes.rows[0]?.total || '0');
  return { data: result.rows, total };
};

export const deleteAbsensi = async (id: string) => {
  const result = await query('DELETE FROM absensi WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw new Error('Absensi not found');
  }
  return result.rows[0];
};

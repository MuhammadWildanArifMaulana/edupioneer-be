import { query } from '@utils/db';

export const createPaymentSPP = async (data: {
  siswa_id: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  metode_pembayaran: string;
}) => {
  const result = await query(
    'INSERT INTO pembayaran_spp (siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING id, siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status',
    [data.siswa_id, data.bulan, data.tahun, data.jumlah, data.metode_pembayaran, 'paid'],
  );
  return result.rows[0];
};

export const getSPPBySiswa = async (siswaId: string, tahun?: number) => {
  let result;

  if (tahun) {
    result = await query(
      'SELECT id, siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status FROM pembayaran_spp WHERE siswa_id = $1 AND tahun = $2 ORDER BY bulan DESC',
      [siswaId, tahun],
    );
  } else {
    result = await query(
      'SELECT id, siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status FROM pembayaran_spp WHERE siswa_id = $1 ORDER BY tahun DESC, bulan DESC',
      [siswaId],
    );
  }

  return result.rows;
};

export const getSPPById = async (id: string) => {
  const result = await query(
    'SELECT id, siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status FROM pembayaran_spp WHERE id = $1',
    [id],
  );
  if (result.rows.length === 0) {
    throw new Error('SPP payment not found');
  }
  return result.rows[0];
};

export const getAllSPP = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await query(
    'SELECT p.id, p.siswa_id, p.bulan, p.tahun, p.jumlah, p.metode_pembayaran, p.tanggal_bayar, p.status, s.nama as siswa_nama FROM pembayaran_spp p JOIN siswa s ON p.siswa_id = s.id ORDER BY p.tanggal_bayar DESC LIMIT $1 OFFSET $2',
    [limit, offset],
  );
  const countResult = await query('SELECT COUNT(*) as total FROM pembayaran_spp');
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const updateSPPStatus = async (id: string, status: string) => {
  const result = await query(
    'UPDATE pembayaran_spp SET status = $1 WHERE id = $2 RETURNING id, siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status',
    [status, id],
  );

  if (result.rows.length === 0) {
    throw new Error('SPP payment not found');
  }

  return result.rows[0];
};

import { Router, Request, Response } from 'express';
import { query } from '@utils/db';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';

const router = Router();

// All admin endpoints require authentication
router.use(authMiddleware);

// Helper to build simple paginated list
async function listTable(res: Response, table: string, page = 1, limit = 200) {
  const offset = (page - 1) * limit;
  // choose ordering column depending on table (not all tables have created_at)
  const orderByMap: Record<string, string> = {
    roles: 'created_at',
    guru_mapel: 'created_at',
    tugas_submit: 'submitted_at',
    materi_view: 'viewed_at',
    diskusi_post: 'created_at',
    absensi_detail: 'id',
  };

  const orderBy = orderByMap[table] || 'created_at';

  const q = `SELECT * FROM ${table} ORDER BY ${orderBy} DESC LIMIT $1 OFFSET $2`;
  const result = await query(q, [limit, offset]);
  // get total count for pagination
  const countQ = `SELECT COUNT(*) as total FROM ${table}`;
  const countRes = await query(countQ);
  const total = Number.parseInt(countRes.rows[0]?.total || '0');
  return res.json({ data: result.rows, total });
}

// Helper to get by id
async function getById(res: Response, table: string, id: string) {
  const q = `SELECT * FROM ${table} WHERE id = $1`;
  const result = await query(q, [id]);
  if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' });
  return res.json(result.rows[0]);
}

// Helper to delete
async function deleteById(res: Response, table: string, id: string) {
  const q = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
  const result = await query(q, [id]);
  if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' });
  return res.json({ success: true });
}

// Expose endpoints for a small set of admin-managed tables
const TABLES = [
  'roles',
  'guru_mapel',
  'materi',
  'tugas_submit',
  'materi_view',
  'diskusi_post',
  'absensi_detail',
];

// List endpoints
TABLES.forEach((table) => {
  router.get(`/${table}`, async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 200;
      return await listTable(res, table, page, limit);
    } catch (err) {
      console.error('[admin] list error', table, err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  router.get(`/${table}/:id`, async (req: Request, res: Response) => {
    try {
      return await getById(res, table, req.params.id);
    } catch (err) {
      console.error('[admin] getById error', table, err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Create
  router.post(`/${table}`, roleMiddleware(['admin']), async (req: Request, res: Response) => {
    try {
      // Build dynamic insert from keys (simple, assumes fields map 1:1)
      const keys = Object.keys(req.body || {});
      if (keys.length === 0) return res.status(400).json({ message: 'No data provided' });
      const cols = keys.join(', ');
      const params = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map((k) => req.body[k]);
      const q = `INSERT INTO ${table} (${cols}) VALUES (${params}) RETURNING *`;
      const result = await query(q, values);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('[admin] create error', table, err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Update
  router.put(`/${table}/:id`, roleMiddleware(['admin']), async (req: Request, res: Response) => {
    try {
      const keys = Object.keys(req.body || {});
      if (keys.length === 0) return res.status(400).json({ message: 'No data provided' });
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = keys.map((k) => req.body[k]);
      values.push(req.params.id);
      const q = `UPDATE ${table} SET ${sets} WHERE id = $${values.length} RETURNING *`;
      const result = await query(q, values);
      if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' });
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('[admin] update error', table, err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete
  router.delete(`/${table}/:id`, roleMiddleware(['admin']), async (req: Request, res: Response) => {
    try {
      return await deleteById(res, table, req.params.id);
    } catch (err) {
      console.error('[admin] delete error', table, err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
});

export default router;

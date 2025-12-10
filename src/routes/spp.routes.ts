import { Router } from 'express';
import * as SPPController from '@controllers/SPPController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', SPPController.getAll);

router.get('/:id', SPPController.getById);

router.get('/siswa-payments', SPPController.getBySiswa);

router.post(
  '/pay',
  roleMiddleware(['siswa']),
  validateRequest([
    { field: 'siswa_id', type: 'string', required: true },
    { field: 'bulan', type: 'number', required: true },
    { field: 'tahun', type: 'number', required: true },
    { field: 'jumlah', type: 'number', required: true },
    { field: 'metode_pembayaran', type: 'string', required: true },
  ]),
  SPPController.pay,
);

router.put('/:id/status', roleMiddleware(['admin']), SPPController.updateStatus);

export default router;

import { Router } from 'express';
import * as AbsensiController from '@controllers/AbsensiController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', AbsensiController.getBySiswa);

router.get('/:id', AbsensiController.getById);

router.get('/:id/detail', AbsensiController.getDetail);

router.post(
  '/',
  roleMiddleware(['guru']),
  validateRequest([
    { field: 'guru_mapel_id', type: 'string', required: true },
    { field: 'kelas_id', type: 'string', required: true },
    { field: 'tanggal', type: 'string', required: true },
  ]),
  AbsensiController.create,
);

router.post(
  '/:id/detail',
  roleMiddleware(['guru']),
  validateRequest([
    { field: 'siswa_id', type: 'string', required: true },
    { field: 'status', type: 'string', required: true },
  ]),
  AbsensiController.recordDetail,
);

router.delete('/:id', roleMiddleware(['guru', 'admin']), AbsensiController.delete_);

export default router;

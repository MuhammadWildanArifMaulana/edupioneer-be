import { Router } from 'express';
import * as NilaiController from '@controllers/NilaiController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', NilaiController.getAll);

router.get('/:id', NilaiController.getById);

router.post(
  '/',
  roleMiddleware(['guru']),
  validateRequest([
    { field: 'siswa_id', type: 'string', required: true },
    { field: 'guru_mapel_id', type: 'string', required: true },
    { field: 'nilai', type: 'number', required: true },
    { field: 'semester', type: 'number', required: true },
  ]),
  NilaiController.create,
);

router.put(
  '/:id',
  roleMiddleware(['guru']),
  validateRequest([
    { field: 'nilai', type: 'number' },
    { field: 'semester', type: 'number' },
  ]),
  NilaiController.update,
);

router.delete('/:id', roleMiddleware(['guru', 'admin']), NilaiController.delete_);

export default router;

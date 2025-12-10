import { Router } from 'express';
import * as SiswaController from '@controllers/SiswaController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', SiswaController.getAll);

router.get('/:id', SiswaController.getById);

router.get('/:id/kelas', SiswaController.getKelas);

router.post(
  '/',
  roleMiddleware(['admin']),
  validateRequest([
    { field: 'user_id', type: 'string', required: true },
    { field: 'nama', type: 'string', required: true, minLength: 3 },
  ]),
  SiswaController.create,
);

router.put(
  '/:id',
  roleMiddleware(['admin']),
  validateRequest([
    { field: 'nama', type: 'string', minLength: 3 },
    { field: 'kelas_id', type: 'string' },
  ]),
  SiswaController.update,
);

router.delete('/:id', roleMiddleware(['admin']), SiswaController.delete_);

export default router;

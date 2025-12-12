import { Router } from 'express';
import * as KelasController from '../controllers/KelasController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', KelasController.getAll);

router.get('/:id', KelasController.getById);

router.post(
  '/',
  roleMiddleware(['guru', 'admin']),
  validateRequest([
    { field: 'nama', type: 'string', required: true, minLength: 2 },
    { field: 'tahun_ajaran', type: 'string', required: true },
    { field: 'semester', type: 'number', required: true },
  ]),
  KelasController.create,
);

router.put(
  '/:id',
  roleMiddleware(['guru', 'admin']),
  validateRequest([
    { field: 'nama', type: 'string', minLength: 2 },
    { field: 'tahun_ajaran', type: 'string' },
    { field: 'semester', type: 'number' },
  ]),
  KelasController.update,
);

router.delete('/:id', roleMiddleware(['admin']), KelasController.delete_);

export default router;

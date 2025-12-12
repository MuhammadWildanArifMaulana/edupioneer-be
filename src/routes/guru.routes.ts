import { Router } from 'express';
import * as GuruController from '../controllers/GuruController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', GuruController.getAll);

router.get('/:id', GuruController.getById);

router.get('/:id/mapel', GuruController.getMapel);

router.post(
  '/',
  roleMiddleware(['admin']),
  validateRequest([
    { field: 'user_id', type: 'string', required: true },
    { field: 'nama', type: 'string', required: true, minLength: 3 },
  ]),
  GuruController.create,
);

router.put(
  '/:id',
  roleMiddleware(['admin']),
  validateRequest([{ field: 'nama', type: 'string', minLength: 3 }]),
  GuruController.update,
);

router.delete('/:id', roleMiddleware(['admin']), GuruController.delete_);

router.post(
  '/assign-mapel',
  roleMiddleware(['admin']),
  validateRequest([
    { field: 'guru_id', type: 'string', required: true },
    { field: 'mapel_id', type: 'string', required: true },
    { field: 'kelas_id', type: 'string', required: true },
  ]),
  GuruController.assignMapel,
);

export default router;

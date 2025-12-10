import { Router } from 'express';
import * as MateriController from '@controllers/MateriController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', MateriController.getAll);

router.get('/:id', MateriController.getById);

router.post(
  '/',
  roleMiddleware(['guru']),
  validateRequest([
    { field: 'guru_mapel_id', type: 'string', required: true },
    { field: 'judul', type: 'string', required: true, minLength: 3 },
  ]),
  MateriController.create,
);

router.post('/:id/view', MateriController.recordView);

router.put('/:id', roleMiddleware(['guru']), MateriController.update);

router.delete('/:id', roleMiddleware(['guru', 'admin']), MateriController.delete_);

export default router;

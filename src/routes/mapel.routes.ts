import { Router } from 'express';
import * as MapelController from '../controllers/MapelController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', MapelController.getAll);

router.get('/:id', MapelController.getById);

router.post(
  '/',
  roleMiddleware(['guru', 'admin']),
  validateRequest([{ field: 'nama', type: 'string', required: true, minLength: 2 }]),
  MapelController.create,
);

router.put(
  '/:id',
  roleMiddleware(['guru', 'admin']),
  validateRequest([{ field: 'nama', type: 'string', minLength: 2 }]),
  MapelController.update,
);

router.delete('/:id', roleMiddleware(['admin']), MapelController.delete_);

export default router;

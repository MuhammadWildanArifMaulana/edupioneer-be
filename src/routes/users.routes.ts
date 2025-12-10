import { Router } from 'express';
import * as UserController from '@controllers/UserController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(['admin']),
  validateRequest([
    { field: 'email', type: 'email' },
    { field: 'password', type: 'string', minLength: 6 },
    { field: 'name', type: 'string', minLength: 3 },
    { field: 'role', type: 'string' },
  ]),
  UserController.create,
);

router.get('/', UserController.getAll);

router.get('/:id', UserController.getById);

router.put(
  '/:id',
  validateRequest([
    { field: 'email', type: 'email' },
    { field: 'name', type: 'string', minLength: 3 },
  ]),
  UserController.update,
);

router.delete('/:id', roleMiddleware(['admin']), UserController.delete_);

export default router;

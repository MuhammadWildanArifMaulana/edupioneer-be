import { Router } from 'express';
import * as UserController from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

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
    { field: 'phone', type: 'string', required: false },
  ]),
  UserController.update,
);

// Change password endpoint
router.put(
  '/:id/password',
  validateRequest([
    { field: 'current_password', type: 'string', required: true, minLength: 6 },
    { field: 'new_password', type: 'string', required: true, minLength: 6 },
  ]),
  UserController.changePassword,
);

// Upload avatar (multipart/form-data) - expects field name `avatar`
router.put('/:id/avatar', upload.single('avatar'), UserController.uploadAvatar);

router.delete('/:id', roleMiddleware(['admin']), UserController.delete_);

export default router;

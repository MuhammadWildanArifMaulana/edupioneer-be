import { Router } from 'express';
import * as AuthController from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/register',
  validateRequest([
    { field: 'email', type: 'email', required: true },
    { field: 'password', type: 'string', required: true, minLength: 6 },
    { field: 'name', type: 'string', required: true, minLength: 3 },
    { field: 'role', type: 'string', required: true },
  ]),
  AuthController.register,
);

router.post(
  '/login',
  validateRequest([
    { field: 'email', type: 'email', required: true },
    { field: 'password', type: 'string', required: true },
  ]),
  AuthController.login,
);

router.get('/me', authMiddleware, AuthController.me);

export default router;

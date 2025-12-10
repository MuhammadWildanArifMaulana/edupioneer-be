import { Router } from 'express';
import * as TugasController from '@controllers/TugasController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', TugasController.getAll);

router.get('/:id', TugasController.getById);

router.get('/:id/submits', TugasController.getSubmits);

router.post(
  '/',
  roleMiddleware(['guru']),
  validateRequest([
    { field: 'guru_mapel_id', type: 'string', required: true },
    { field: 'kelas_id', type: 'string', required: true },
    { field: 'judul', type: 'string', required: true, minLength: 3 },
    { field: 'deadline', type: 'string', required: true },
  ]),
  TugasController.create,
);

router.post(
  '/submit',
  roleMiddleware(['siswa']),
  validateRequest([
    { field: 'tugas_id', type: 'string', required: true },
    { field: 'siswa_id', type: 'string', required: true },
  ]),
  TugasController.submit,
);

router.put('/:id', roleMiddleware(['guru']), TugasController.update);

router.delete('/:id', roleMiddleware(['guru', 'admin']), TugasController.delete_);

export default router;

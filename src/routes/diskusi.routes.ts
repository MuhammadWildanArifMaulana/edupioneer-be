import { Router } from 'express';
import * as DiskusiController from '@controllers/DiskusiController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { validateRequest } from '@middlewares/validateRequest';

const router = Router();

router.use(authMiddleware);

router.get('/', DiskusiController.getAll);

router.get('/:id', DiskusiController.getById);

router.get('/:id/posts', DiskusiController.getPosts);

router.post(
  '/',
  roleMiddleware(['guru']),
  validateRequest([
    { field: 'guru_mapel_id', type: 'string', required: true },
    { field: 'kelas_id', type: 'string', required: true },
    { field: 'judul', type: 'string', required: true, minLength: 3 },
  ]),
  DiskusiController.create,
);

router.post(
  '/:id/post',
  roleMiddleware(['siswa']),
  validateRequest([
    { field: 'siswa_id', type: 'string', required: true },
    { field: 'isi', type: 'string', required: true, minLength: 1 },
  ]),
  DiskusiController.postComment,
);

router.put('/:id', roleMiddleware(['guru']), DiskusiController.update);

router.delete('/:id', roleMiddleware(['guru', 'admin']), DiskusiController.delete_);

export default router;

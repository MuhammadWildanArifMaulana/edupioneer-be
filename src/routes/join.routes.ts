import { Router } from 'express';
import * as JoinController from '../controllers/JoinRequestController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Student: create join request for a kelas
router.post('/kelas/:id/join-requests', JoinController.create);

// Guru/Admin: list pending requests for a kelas
router.get('/kelas/:id/join-requests', JoinController.listByKelas);

// Guru: list all pending requests for all kelas they teach
router.get('/guru/me/join-requests', JoinController.listForGuru);

// Decide a join request (accept/reject)
router.put('/join-requests/:id', JoinController.decide);

export default router;

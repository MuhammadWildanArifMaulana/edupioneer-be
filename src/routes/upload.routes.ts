import { Router } from 'express';
import multer from 'multer';
import UploadController from '../controllers/UploadController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// keep files in memory and stream to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/uploads - upload a file (admin or guru)
router.post(
  '/uploads',
  authMiddleware,
  roleMiddleware(['admin', 'guru']),
  upload.single('file'),
  UploadController.uploadFile,
);

export default router;

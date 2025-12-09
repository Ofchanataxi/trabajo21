// 1. Importa 'uploadTemp' en lugar de 'upload'
import { uploadTemp } from '../../../../file-management/infrastructure/file/MulterConfig';
import { Router } from 'express';
import authMiddleware from '../../../../user-management/infraestructure/incoming/routes/authMiddleware';
import { processDocument } from '../controllers/PythonProxyController';

const router = Router();

router.post(
  '/procesar',
  authMiddleware,
  uploadTemp.fields([
    { name: 'file', maxCount: 1 },
    { name: 'mtc_files', maxCount: 20 },
  ]),
  processDocument,
);

export default router;

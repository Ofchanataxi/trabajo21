// src/interfaces/routes/zipRoutes.ts
import { Router } from 'express';
import { upload, readFile } from '../../infrastructure/file/MulterConfig';
import { ZipController } from '../controllers/ZipController';

const router = Router();
const zipController = new ZipController();

router.post('/upload-zip', upload.single('file'), (req, res) =>
  zipController.uploadAndExtract(req, res),
);

router.post('/check-signs', readFile.single('file'), (req, res) =>
  zipController.testFileSigns(req, res),)

export default router;

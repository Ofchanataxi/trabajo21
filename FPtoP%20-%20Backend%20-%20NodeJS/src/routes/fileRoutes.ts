import { Router } from 'express';
import multer from 'multer';
import { OilWellController } from '../oilController';

const router = Router();
const upload = multer(); // Configuración básica de multer

const oilWellController = new OilWellController();

// Ruta para subir archivos
router.post(
  '/upload',
  upload.single('file'),
  oilWellController.uploadFile.bind(oilWellController),
);

export default router;

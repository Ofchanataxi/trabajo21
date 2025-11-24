import { Router } from 'express';
import { SignsController } from '../controllers/SignsController';
import { upload, uploadTemp } from '../../infrastructure/file/MulterConfig';
import { ExtractValidCertificates } from '../../application/use-cases/extract_valid_certificates';
import { ExtractCertificatesService } from '../../../../shared/infrastructure/Services/ExtractCertificatesService';
import { FileManagementController } from '../controllers/FileManagementController';

const router = Router();
const FileManagement = new FileManagementController();

const signsController = new SignsController(
  new ExtractValidCertificates(new ExtractCertificatesService()),
);

/**
 * @swagger
 * tags:
 *   - name: Signs
 *     description: Rutas para operaciones con firmas dentro
 * /signs/extract-certificates-from-zip:
 *   post:
 *     summary: Retorna los certificados encontrados en un zip con PDFs firmados
 *     description: |
 *         Se puede obtener:
 *         - Certificados Root CA
 *         - Certificados intermedios Sub CA
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: El archivo ZIP que contiene los PDFs firmados
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Signs
 *     responses:
 *       200:
 *         description: Zip con certificados principales e intermedios
 *       204:
 *         description: No se encontraron certificados
 *       400:
 *         description: Error sin documento adjunto o archivo enviado no es .zip
 *       500:
 *         description: Error al buscar certificados
 *
 */
router.post(
  '/extract-certificates-from-zip',
  upload.single('file'),
  async (req, res) =>
    await signsController.extractCertificatesFromZip(req, res),
);

router.post(
  '/verify-sign',
  uploadTemp.single('file'),
  async (req, res) => await FileManagement.verifySign(req, res),
);

export default router;

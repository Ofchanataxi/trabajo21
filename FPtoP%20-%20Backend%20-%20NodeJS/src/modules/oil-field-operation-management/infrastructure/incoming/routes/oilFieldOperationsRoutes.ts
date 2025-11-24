import express from 'express';
import { GetAllPendingWells } from '../../../application/use-cases/GetAllPendingWells';
import { GetPendingWellInformation } from '../../../application/use-cases/GetPendingWellInformation';
import { SequelizeWellRepository } from '../../../../well-management/infrastructure/database/repositories/SequelizeWellRepository';
import { GetAllRejectWells } from '../../../application/use-cases/GetAllRejectedWells';
import { GetAllApprovedWells } from '../../../application/use-cases/GetAllApprovedWells';
import { PostApproveWell } from '../../../application/use-cases/PostApproveWell';
import { PostRejectedWell } from '../../../application/use-cases/PostRejectedWell';
import { SequelizeWellInformationRepository } from '../../database/repositories/SequelizeWellInformationRepository';
import { GetOilfieldOperations } from '../../../application/use-cases/GetOilFieldOperations';
import { GetElementReleases } from '../../../application/use-cases/GetElementReleases';
import { ApprovalInformation } from '../../../../well-management/infrastructure/incoming/services/approvalInformation';
import { GetRejectReleases } from '../../../application/use-cases/QAQC/GetRejectReleases';
import { PostElementReleaseStatus } from '../../../application/use-cases/PostElementReleaseStatus';
import { SequelizeWellStatusRepository } from '../../database/repositories/SequelizerWellStatusRepository';
import { GetAcceptReleases } from '../../../application/use-cases/QAQC/GetAcceptReleases';
import { OilfieldOperationController } from '../controllers/oilFieldOperationController';
import { SequelizeOilFieldOperationRepository } from '../../database/repositories/SequelizeReleaseRepository';
import { GetSegmentRejectReleases } from '../../../application/use-cases/Logistic/GetSegmentRejectReleases';
import { GetSegmentApproveReleases } from '../../../application/use-cases/Logistic/GetSegmentApproveReleases';
import { GetSegmentPendingReleases } from '../../../application/use-cases/Logistic/GetSegmentPendingReleases';
import { GetSegmentDraftReleases } from '../../../application/use-cases/Logistic/GetSegmentDraftReleases';
import { PostUploadWellDataFromFile } from '../../../application/use-cases/Logistic/PostUploadWellDataFromFile';
import { WellFileData } from '../../database/repositories/WellFileData';
import { PostNewAttributeElements } from '../../../application/use-cases/Logistic/PostNewAttributeElement';
import { PostNewAttributeList } from '../../../application/use-cases/Logistic/PostNewAttributeList';
import { PostNewStandardElementError } from '../../../application/use-cases/Logistic/PostNewStandardElementError';
import { PostNewErrorExtensionDocuments } from '../../../application/use-cases/Logistic/PostNewErrorExtensionDocuments';
import { GetRequieredExtensionDocuments } from '../../../application/use-cases/Logistic/GetRequieredExtensionDocuments';

const router = express.Router();
const releasesRepository = new SequelizeOilFieldOperationRepository();
const wellInformationRepository = new SequelizeWellInformationRepository(
  new ApprovalInformation(),
);
const WellDataFromFile = new WellFileData();
const wellStatusRepository = new SequelizeWellStatusRepository();
const oilFieldOperationController = new OilfieldOperationController(
  new GetAllPendingWells(),
  new GetPendingWellInformation(),
  new GetAllRejectWells(),
  new GetAllApprovedWells(),
  new PostApproveWell(),
  new PostRejectedWell(),
  new GetOilfieldOperations(wellInformationRepository),
  new GetElementReleases(wellInformationRepository),
  new GetRejectReleases(releasesRepository),
  new PostElementReleaseStatus(wellStatusRepository),
  new GetAcceptReleases(releasesRepository),
  new GetSegmentApproveReleases(releasesRepository),
  new GetSegmentRejectReleases(releasesRepository),
  new GetSegmentPendingReleases(releasesRepository),
  new GetSegmentDraftReleases(releasesRepository),
  new PostUploadWellDataFromFile(WellDataFromFile),
  new PostNewAttributeElements(WellDataFromFile),
  new PostNewAttributeList(WellDataFromFile),
  new PostNewStandardElementError(WellDataFromFile),
  new PostNewErrorExtensionDocuments(WellDataFromFile),
  new GetRequieredExtensionDocuments(WellDataFromFile),
);

// For approval
router.get('/wells/pending-approve/', (req, res, next) =>
  oilFieldOperationController.getPendingWellInfo(req, res, next),
);

router.get('/wells/rejected-approve/all', (req, res, next) =>
  oilFieldOperationController.getRejectWells(req, res, next),
);

router.get('/wells/accepted-approve/all', (req, res, next) =>
  oilFieldOperationController.getApprovedWells(req, res, next),
);

router.get('/wells/pending-approve/all', (req, res, next) =>
  oilFieldOperationController.getPendingWells(req, res, next),
);

router.post('/wells/approve/', (req, res, next) =>
  oilFieldOperationController.approveWell(req, res, next),
);

router.post('/wells/reject/', (req, res, next) =>
  oilFieldOperationController.rejectWell(req, res, next),
);

/**
 * @swagger
 * tags:
 *   - name: Oil Field Operations
 *     description: Rutas para operaciones de pozos
 * /api/wells/oilFieldOperations:
 *   get:
 *     summary: Obtiene todos las operaciones en pozo
 *     description: |
 *         Se debe filtra según el estado de la operación usando el parametro releaseStatus y las siguientes opciones:
 *         - 1 = En edicion
 *         - 2 = En revision QAQC
 *         - 3 = En revision PEC
 *         - 4 = Entregado
 *     parameters:
 *       - in: query
 *         name: releaseStatus
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filtra las operaciones por su estatus
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Oil Field Operations
 *     responses:
 *       200:
 *         description: Lista de operaciones
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/wells/oilFieldOperations',
  async (req, res, next) =>
    await oilFieldOperationController.OilfieldOperations(req, res, next),
);

/**
 * @swagger
 * tags:
 *   - name: QAQC
 *     description: Rutas para el rol de calidad
 * /api/wells/qaqc/elementReleases:
 *   get:
 *     summary: Obtiene la informacion de un release (Operacion de pozo)
 *     description: |
 *         Se debe utilizar el releaseId
 *     parameters:
 *       - in: query
 *         name: releaseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filtra el release
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - QAQC
 *     responses:
 *       200:
 *         description: Informacion enviada al release
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/wells/qaqc/elementReleases',
  async (req, res, next) =>
    await oilFieldOperationController.ElementReleases(req, res, next),
);

/**
 * @swagger
 * tags:
 *   - name: QAQC
 *     description: Rutas para el rol de calidad
 * /api/wells/qaqc/oilfieldOperations/rejected:
 *   get:
 *     summary: Obtiene todas las operaciones de pozo rechazadas
 *     description: |
 *         Operaciones de pozos rechazadas por QAQC
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - QAQC
 *     responses:
 *       200:
 *         description: Releases de operaciones de pozo rechazadas
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/wells/qaqc/oilfieldOperations/rejected',
  async (req, res, next) => await oilFieldOperationController.RejectByQAQC(req, res, next),
);

/**
 * @swagger
 * tags:
 *   - name: QAQC
 *     description: Rutas para el rol de calidad
 * /api/wells/qaqc/oilfieldOperations/approved:
 *   get:
 *     summary: Obtiene todas las operaciones de pozo aceptadas
 *     description: |
 *         Operaciones de pozos aceptadas por QAQC
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - QAQC
 *     responses:
 *       200:
 *         description: Releases de operaciones de pozo aceptadas
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/wells/qaqc/oilfieldOperations/approved',
  async (req, res, next) => await oilFieldOperationController.ApprovedByQAQC(req, res, next),
);

router.post('/wells/qaqc/ReleaseStateHistory', async (req, res, next) => {
  return await oilFieldOperationController.changeReleaseStatus(req, res, next);
});

/**
 * @swagger
 * tags:
 *   - name: Segment
 *     description: Rutas para Segmento
 * /api/segment/oilfieldOperations/approved:
 *   get:
 *     summary: Obtiene todas las operaciones de pozo aceptadas para un segmento
 *     description: |
 *         Se debe filtra según el segmento:
 *         - 1: Logistica
 *         - 2: ALS
 *         - 3: Completion
 *         - 4: Cameron
 *         - 5: IWC
 *     parameters:
 *       - in: query
 *         name: segmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filtra el segmento
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Segment
 *     responses:
 *       200:
 *         description: Releases de operaciones de pozo aceptadas
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/segment/oilfieldOperations/approved',
  async (req, res, next) => await oilFieldOperationController.segmentApprovedSubmissions(req, res, next),
);

/**
 * @swagger
 * tags:
 *   - name: Segment
 *     description: Rutas para Segmento
 * /api/segment/oilfieldOperations/rejected:
 *   get:
 *     summary: Obtiene todas las operaciones de pozo rechazadas para un segmento
 *     description: |
 *         Se debe filtra según el segmento:
 *         - 1: Logistica
 *         - 2: ALS
 *         - 3: Completion
 *         - 4: Cameron
 *         - 5: IWC
 *     parameters:
 *       - in: query
 *         name: segmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filtra el segmento
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Segment
 *     responses:
 *       200:
 *         description: Releases de operaciones de pozo rechazadas
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/segment/oilfieldOperations/rejected',
  async (req, res, next) => await oilFieldOperationController.segmentRejectedSubmissions(req, res, next),
);

/**
 * @swagger
 * tags:
 *   - name: Segment
 *     description: Rutas para Segmento
 * /api/segment/oilfieldOperations/pending:
 *   get:
 *     summary: Obtiene todas las operaciones de pozo pendientes por aprobar para un segmento
 *     description: |
 *         Se debe filtra según el segmento:
 *         - 1: Logistica
 *         - 2: ALS
 *         - 3: Completion
 *         - 4: Cameron
 *         - 5: IWC
 *     parameters:
 *       - in: query
 *         name: segmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filtra el segmento
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Segment
 *     responses:
 *       200:
 *         description: Releases de operaciones de pozo pendientes por aprobar
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/segment/oilfieldOperations/pending',
  async (req, res, next) => await oilFieldOperationController.segmentPendingSubmissions(req, res, next),
);

/**
 * @swagger
 * tags:
 *   - name: Segment
 *     description: Rutas para Segmento
 * /api/segment/oilfieldOperations/drafts:
 *   get:
 *     summary: Obtiene todas las operaciones de pozo en edicion para un segmento
 *     description: |
 *         Se debe filtra según el segmento:
 *         - 1: Logistica
 *         - 2: ALS
 *         - 3: Completion
 *         - 4: Cameron
 *         - 5: IWC
 *     parameters:
 *       - in: query
 *         name: segmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filtra el segmento
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Segment
 *     responses:
 *       200:
 *         description: Releases de operaciones de pozo en edicion (draft)
 *       500:
 *         description: Hubo un error al buscar la informacion
 */
router.get(
  '/segment/oilfieldOperations/drafts',
  async (req, res, next) => await oilFieldOperationController.segmentDraftSubmissions(req, res, next),
);

router.get('/getExtensionDocuments', async (req, res, next) => {
  return await oilFieldOperationController.requieredExtensionDocuments(
    req,
    res,
    next,
  );
});

router.post('/logistic/oilfieldOperations/UploadWellDataFromFile', async (req, res, next) => {
  return await oilFieldOperationController.uploadWellDataFromFile(req, res, next);
});

router.post('/logistic/oilfieldOperations/newElment', async (req, res, next) => {
  return await oilFieldOperationController.newAttributeElement(req, res, next);
});

router.post('/logistic/oilfieldOperations/newAttribute', async (req, res, next) => {
  return await oilFieldOperationController.newAttributeList(req, res, next);
});

router.post('/logistic/oilfieldOperations/newStandardElementError', async (req, res, next) => {
  return await oilFieldOperationController.newStandardElementError(req, res, next);
});

router.post(
  '/logistic/oilfieldOperations/newErrorExtensionDocuments',
  async (req, res, next) => {
    return await oilFieldOperationController.newErrorExtensionDocuments(
      req,
      res,
      next,
    );
  },
);

export default router;

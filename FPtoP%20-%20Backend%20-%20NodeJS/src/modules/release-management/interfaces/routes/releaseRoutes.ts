// src/interfaces/routes/zipRoutes.ts
import { Router } from 'express';
import { ReleaseController } from '../controller/releaseController';

const router = Router();
const releaseController = new ReleaseController();

router.post('/elements-of-release', (req, res) =>
  releaseController.getElementsOfRelease(req, res),
);

router.post('/update-release-state', (req, res) =>
  releaseController.updateReleaseState(req, res),
);

router.post('/get-meta-data-releases-by-state', (req, res) =>
  releaseController.getMetaDataReleasesByState(req, res),
);

router.get('/get-meta-data-active-wells', (req, res) =>
  releaseController.getMetaDataActiveWells(req, res),
);

router.post('/get-release-data', (req, res) =>
  releaseController.getReleaseData(req, res),
);

router.delete('/delete-release-data', (req, res) =>
  releaseController.deleteReleaseData(req, res),
);

router.post('/get-release-history', (req, res) =>
  releaseController.getReleaseHistory(req, res),
);

router.get('/get-files-of-release', (req, res) =>
  releaseController.getFilesOfRelease(req, res),
);

router.get('/get-files-of-release-to-return', (req, res) =>
  releaseController.getFilesOfReleaseToReturn(req, res),
);

router.get('/get-files-of-release-to-detained', (req, res) =>
  releaseController.getFilesOfReleaseToDetained(req, res),
);

router.get('/get-release', (req, res) =>
  releaseController.getReleases(req, res),
);

router.get('/get-standard-condition', (req, res) =>
  releaseController.getStandardCondition(req, res),
);

export default router;

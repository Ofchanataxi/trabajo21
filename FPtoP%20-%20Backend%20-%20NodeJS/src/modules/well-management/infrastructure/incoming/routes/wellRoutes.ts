import express from 'express';
import { WellsController } from '../controller/wellsController';
import { GetAllWells } from '../../../application/use-cases/GetAllWells';

const router = express.Router();
const getAllWells = new GetAllWells();
const wellController = new WellsController(getAllWells);

// Wells in general
router.get('/wells', (req, res) => wellController.getWells(req, res));
router.post(
  '/save-oilfieldOperationRelease',
  async (req, res) =>
    await wellController.saveOilfieldOperationRelease(req, res),
);

export default router;

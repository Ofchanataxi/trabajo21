// interfaces/api/routes/wellRoutes.ts
import { Router } from 'express';
import { WellController } from '../controllers/WellController';
import { GetAllWells } from '../../../application/use-cases/GetAllWells';

const router = Router();

const getAllWells = new GetAllWells();
const wellController = new WellController(getAllWells);

router.get('/wells', (req, res) => wellController.getWells(req, res));

export default router;

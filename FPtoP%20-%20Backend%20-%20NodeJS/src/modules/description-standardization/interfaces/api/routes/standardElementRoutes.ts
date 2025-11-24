import { Router } from 'express';
import { StandardElementController } from '../controllers/StandardElementController';
import { SequelizeStandardElementRepository } from '../../../infraestructure/database/repositories/SequelizeStandardElementRepository';
import { GetStandardElementsByBusinessLine } from '../../../application/use-cases/GetStandardElementsByBusinessLine';

const router = Router();

const elementRepository = new SequelizeStandardElementRepository();
const getElementsByBusinessLine = new GetStandardElementsByBusinessLine(
  elementRepository,
);
const standardElementController = new StandardElementController(
  getElementsByBusinessLine,
);

router.get('/business-lines/:businessLineId/elements', (req, res) =>
  standardElementController.getElements(req, res),
);

router.get('/elements/:id/attributes', (req, res) =>
  standardElementController.getElementAttributes(req, res),
);

router.post('/standardVerification', (req, res) =>
  standardElementController.verifyStandard(req, res),
);

export default router;

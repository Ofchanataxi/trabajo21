// src/interfaces/routes/zipRoutes.ts
import { Router } from 'express';
import { BusinessLineController } from '../controller/businessLineController';

const router = Router();
const businessLineController = new BusinessLineController();

router.get('/business-line/get-all', (req, res) =>
  businessLineController.getAll(req, res),
);

router.post('/business-line/create', (req, res) =>
  businessLineController.create(req, res),
);

router.post('/business-line/update', (req, res) =>
  businessLineController.update(req, res),
);

export default router;

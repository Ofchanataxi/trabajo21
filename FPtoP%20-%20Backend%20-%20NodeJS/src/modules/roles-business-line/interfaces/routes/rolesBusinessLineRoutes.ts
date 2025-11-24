import { Router } from 'express';
import { RolesBusinessLineController } from '../controller/rolesBusinessLineController';

const router = Router();
const rolesBusinessLineController = new RolesBusinessLineController();

router.get('/roles-business-line/get-all/', (req, res) =>
  rolesBusinessLineController.getAll(req, res),
);

export default router;

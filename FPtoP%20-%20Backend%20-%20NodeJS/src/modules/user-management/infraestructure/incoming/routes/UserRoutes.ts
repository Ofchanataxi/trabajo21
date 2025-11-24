import express from 'express';
import AuthController from '../controller/authController';
import authMiddleware from './authMiddleware';
import { UserManagementController } from '../controller/userManagementController';

const router = express.Router();
const userManagementController = new UserManagementController();

router.get('/signin', (req, res, next) =>
  AuthController.signin(req, res, next),
);

router.get('/acquireToken', (req, res, next) =>
  AuthController.acquireToken(req, res, next),
);

router.post('/redirect', (req, res, next) =>
  AuthController.handleRedirect(req, res, next),
);

router.get('/signout', (req, res, next) =>
  AuthController.signout(req, res, next),
);

router.get('/status', authMiddleware, (req, res, next) => {
  AuthController.status(req, res, next);
});

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Rutas para operaciones con autenticacion
 * /auth/userData:
 *   get:
 *     summary: Obtiene los datos del usuario al hacer login
 *     description: |
 *         Se puede obtener:
 *         - Nombres, apellidos, bussiness line, correo
 *         - Grupo de accesso
 *         - Permiso a paginas
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Necesario especificar usuario
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       500:
 *         description: Hubo un error al obtener los datos del usuario
 */
router.get(
  '/userData',
  async (req, res, next) => await AuthController.userData(req, res, next),
);

router.post('/user-management/create', (req, res) =>
  userManagementController.create(req, res),
);

router.post('/user-management/getByID', (req, res) =>
  userManagementController.getByID(req, res),
);

router.get('/user-management/getCurrentUserSession', (req, res) =>
  userManagementController.getCurrentUserSession(req, res),
);


export default router;

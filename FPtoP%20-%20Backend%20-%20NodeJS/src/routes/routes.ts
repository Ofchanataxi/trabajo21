// src/routes/routes.ts
import { Request, Response, NextFunction, Application } from 'express';
import createError from 'http-errors';

import UserRoutes from '../modules/user-management/infraestructure/incoming/routes/UserRoutes';
import authMiddleware from '../modules/user-management/infraestructure/incoming/routes/authMiddleware';
//import swaggerUi from 'swagger-ui-express';
import fileRoutes from '../routes/fileRoutes';
import ReleaseRoutes from '../modules/release-management/interfaces/routes/releaseRoutes';
import oilFieldOperationsRoutes from '../modules/oil-field-operation-management/infrastructure/incoming/routes/oilFieldOperationsRoutes';
import standardElementRoutes from '../modules/description-standardization/interfaces/api/routes/standardElementRoutes';
import wellsRoutes from '../modules/well-management/infrastructure/incoming/routes/wellRoutes';
import zipRoutes from '../modules/file-management/interfaces/routes/zipRoutes';
import FileManagementRoutes from '../modules/file-management/interfaces/routes/FileManagementRoutes';
import notificationRoutes from '../modules/notification-management/infraestructure/incoming/routes/NotificationRoutes';
import signsRoutes from '../modules/file-management/interfaces/routes/SignsRoutes';
import {
  xmlController,
  xmlFileUpload,
} from '../modules/field-module/interfaces/api/controllers/xmlController';
import dynamicRoutes from '../modules/field-module/interfaces/api/routes/dynamicRoutes';
import iwcRoutes from '../modules/field-module/interfaces/api/routes/iwcRoutes';
import runBesRoutes from '../modules/run-bes-module/interfaces/api/routes/runBesRoutes';
import SharePointRoutes from '../modules/file-management/interfaces/routes/SharePointRoutes';
import BusinessLineRoutes from '../modules/business-line/interfaces/routes/businessLineRoutes';
import RolesBusinessLineRoutes from '../modules/roles-business-line/interfaces/routes/rolesBusinessLineRoutes';
import CatalogRoutes from '../modules/catalog-management/interfaces/routes/catalogRoutes';
import pythonRoutes from '../modules/field-module/interfaces/api/routes/pythonRoutes';
export function registerRoutes(app: Application) {
  //app.use('/api-docs', swaggerUi.serve, swaggerUi.setup());

  app.get('/', (req: Request, res: Response) =>
    res.json({ message: 'Bienvenido al API de SHAYA' }),
  );

  app.use('/api', SharePointRoutes);
  app.use('/python', pythonRoutes);
  app.use('/api', BusinessLineRoutes);
  app.use('/api', RolesBusinessLineRoutes);
  app.use('/files', authMiddleware, fileRoutes);
  app.use('/auth', UserRoutes);
  app.use('/api', authMiddleware, ReleaseRoutes);
  app.use('/api', authMiddleware, oilFieldOperationsRoutes);
  app.use('/api', authMiddleware, standardElementRoutes);
  app.use('/api', authMiddleware, wellsRoutes);
  app.use('/api', authMiddleware, zipRoutes);
  app.use('/api', authMiddleware, FileManagementRoutes);
  app.use('/api', authMiddleware, notificationRoutes);
  app.use('/signs', signsRoutes);
  app.use('/api', authMiddleware, CatalogRoutes);

  //Field Module
  app.post(
    '/field-upload-xml',
    xmlFileUpload,
    (req: Request, res: Response) => {
      xmlController.uploadXmlFile(req, res);
    },
  );
  app.use('/field', dynamicRoutes);
  app.use('/api', iwcRoutes);
  app.use('/run-bes', runBesRoutes);
  app.get('/debug-session', (req, res) => {
    console.log('🧠 Sesión actual:', req.session);

    // if (!req.session.views) {
    //   req.session.views = 1;
    // } else {
    //   req.session.views++;
    // }

    res.json({
      message: 'Sesión activa',
      // sessionID: req.sessionID,
      // views: req.session.views,
      session: req.session,
    });
  });

  app.get(/.*/, (_req, res) => {
    res.status(200).send('🩺 Servidor activo - Ruta genérica capturada');
  });
  //Error Handler
  // Middleware para manejar rutas no encontradas (404)
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404, 'No encontrado'));
  });

  // Middleware de manejo de errores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Error atrapado por middleware:', err);

    const errorResponse = {
      message: err.message || 'Error interno del servidor',
      ...(req.app.get('env') === 'development' && { stack: err.stack }),
    };

    res.status(err.status || 500).json(errorResponse);
  });
}

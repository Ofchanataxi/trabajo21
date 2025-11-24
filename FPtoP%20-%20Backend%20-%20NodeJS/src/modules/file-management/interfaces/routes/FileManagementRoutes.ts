import { Router } from 'express';
import { FileManagementController } from '../controllers/FileManagementController';
import { uploadTemp } from '../../infrastructure/file/MulterConfig';

const router = Router();
const FileManagement = new FileManagementController();
const urlName = '/file-upload';

router.post(
  urlName + '/release',
  uploadTemp.single('file'), //Necesito borrar los archivos temporales que se generan
  async (req, res) => await FileManagement.uploadFileOfRelease(req, res),
);

router.post(
  urlName + '/elementRelease',
  uploadTemp.single('file'), //Necesito borrar los archivos temporales que se generan
  async (req, res) => await FileManagement.uploadFileOfElementRelease(req, res),
);

router.post(
  urlName + '/oilfieldOperation',
  uploadTemp.single('file'), //Necesito borrar los archivos temporales que se generan
  async (req, res) =>
    await FileManagement.uploadFileOfOilfieldOperation(req, res),
);

router.post(
  '/get-documents-of-element',
  async (req, res) => await FileManagement.getDocumentsOfElement(req, res),
);

router.post(
  urlName + '/obtain-sheets',
  uploadTemp.single('file'), //Necesito borrar los archivos temporales que se generan
  async (req, res) => await FileManagement.obtainSheets(req, res),
);

router.post(
  urlName + '/obtain-elements-of-sheet',
  uploadTemp.single('file'), //Necesito borrar los archivos temporales que se generan
  async (req, res) => await FileManagement.obtainElementsOfSheet(req, res),
);

router.post(
  urlName + '/delete-file-of-release',
  async (req, res) => await FileManagement.deleteFileOfRelease(req, res),
);

router.post(
  urlName + '/obtain-file',
  async (req, res) => await FileManagement.obtainFile(req, res),
);


router.post(
  urlName + '/delete-file-of-element-release',
  async (req, res) => await FileManagement.deleteFileOfElementRelease(req, res),
);

router.post(
  urlName + '/delete-file-of-oilfield-operation',
  async (req, res) =>
    await FileManagement.deleteFileOfOilfieldOperation(req, res),
);

router.post(
  urlName + '/reload-release',
  async (req, res) => await FileManagement.reloadFileOfRelease(req, res),
);

export default router;

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request, Response } from 'express';
import { XmlTransformService } from '../../../application/services/xmlTransformService';
import { parseAndSaveJsonToDB, parseAndSaveJsonToDBnoEnsambles } from '../../../application/services/jsonToRowsService';
import { processRows } from '../../../application/services/processRows';
//import { processAndSaveJson } from '../../../application/services/saveJsonService';
//import { fieldMapping } from '../../../infrastructure/config/fieldMappingConfig';

const xmlTransformService = new XmlTransformService();
const upload = multer({ dest: '../../../uploads/' });

export class XmlController {
  async uploadXmlFile(req: Request, res: Response) {
    try {
      // Handle the possibility of req.file being undefined
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }

      const filePath = '../../../uploads/' + req.file.filename;
      const { wellId, idOilFielOperations, modifiedby } = req.body;

      const jsonResult = await xmlTransformService.transformXmlToJson(filePath);

      const { ensambles, ...jsonWithoutEnsambles } = jsonResult;
      const jsonOnlyEnsambles = { ensambles };

      await parseAndSaveJsonToDBnoEnsambles(
        jsonWithoutEnsambles,
        'fieldModule',
        idOilFielOperations,
        modifiedby,
      );

      await parseAndSaveJsonToDB(
        jsonOnlyEnsambles,
        'fieldModule',
        idOilFielOperations,
        modifiedby,
      );
      await processRows(idOilFielOperations);
      ///////////////////////////////await processAndSaveJson(jsonResult, fieldMapping, wellId);

      res.json(jsonResult);

      // Cleanup: remove the uploaded XML file
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error processing the file:', error);
      res.status(500).send('An error occurred while processing the file.');
    }
  }
}

export const xmlController = new XmlController();

// Middleware for handling file uploads
export const xmlFileUpload = upload.single('file');

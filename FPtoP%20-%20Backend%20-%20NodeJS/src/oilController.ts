import { Request, Response } from 'express';
import { manageOilWell } from './caseOil';
import { FileService } from './shared/infrastructure/Storage/StorageFileService';
import { StorageFactory } from './shared/infrastructure/Storage/StorageFactory';
import { SignService } from './shared/infrastructure/Services/CheckSignService';

const storageProvider = 'azure'; // Puede ser 'azure' o 's3'
const storageStrategy = StorageFactory.getStrategy(storageProvider);
const fileService = new FileService(storageStrategy);
const signService = new SignService();

export class OilWellController {
  async uploadFile(req: Request, res: Response): Promise<Response> {
    //console.log('Recibo el archivo');

    const { file } = req; // Aquí multer coloca el archivo
    const { fileName, oilWellId } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    try {
      const fileUrl = await manageOilWell(fileService, file.buffer, fileName);
      const fileSigns = await signService.CheckDocument(file);
      const { content, ...signsInformation } = fileSigns;
      return res.json({ fileUrl, signsInformation });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}

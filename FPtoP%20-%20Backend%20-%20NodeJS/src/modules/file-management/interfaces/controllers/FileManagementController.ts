// src/interfaces/controllers/ZipController.ts
import { Request, Response } from 'express';
import { FileService } from '../../../../shared/infrastructure/Storage/StorageFileService';
import { StorageFactory } from '../../../../shared/infrastructure/Storage/StorageFactory';
import { FileManagementService } from '../../application/services/FileManagementService';
import { ExcelFileService } from '../../application/services/ExcelFileService';
import * as fs from 'fs';
import { SignService } from '../../../../shared/infrastructure/Services/CheckSignService';

export class FileManagementController {
  private fileService: FileService;
  private containerName = 'shaya';
  private storageProvider: 'azure' | 's3' = 'azure';
  private FileManagementService: FileManagementService;
  private excelFileService: ExcelFileService;
  private signService = new SignService();

  constructor() {
    const storageStrategy = StorageFactory.getStrategy(this.storageProvider);
    this.fileService = new FileService(storageStrategy);
    this.FileManagementService = new FileManagementService();
    this.excelFileService = new ExcelFileService();
  }

  public async uploadFileOfRelease(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const { file } = req; // Aquí multer coloca el archivo
    const { idRelease, idStandardFileTypesOfRelease } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    try {
      /**
       * Step 1: It is neccesary to know, the name of the future folder
       */
      let nameFolder: string = '';
      nameFolder =
        await this.FileManagementService.getNameOfFolderToSaveRelease(
          idRelease,
        );

      /**
       * Step 2: With the name of the future folder and the file, we need to store them in the storage provider
       */

      const responseUpload = await this.fileService.uploadFile(
        this.containerName,
        file.buffer,
        nameFolder + '/' + file.originalname,
      );

      /**
       * Step 3: Verify if the document has signs
       */
      const fileSigns = await this.signService.CheckDocument(file);
      const { content, ...signsInformation } = fileSigns || {};

      /**
       * Step 4: After confirming that the file was saved in the storage provider, we need to create the record in the database
       */

      const saveResponse = await this.FileManagementService.saveRecordOfRelease(
        idRelease,
        idStandardFileTypesOfRelease,
        file,
        responseUpload,
      );
      return res.json({ saveResponse, signsInformation });
    } catch (error: any) {
      console.error('FileManagementController uploadFileOfRelease, error:');
      console.error(error.message);
      // Eliminar el archivo subido
      return res.status(500).json({ message: error.message });
    }
  }

  public async verifySign(req: Request, res: Response): Promise<Response> {
    console.log('Verify Sign');
    const { file } = req; // Aquí multer coloca el archivo
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    try {
      /**
       * Step 3: Verify if the document has signs
       */
      const fileSigns = await this.signService.CheckDocument(file);
      const { ...signsInformation } = fileSigns || {};

      return res.json({ signsInformation });
    } catch (error: any) {
      console.error('FileManagementController verifySign, error:');
      console.error(error.message);
      // Eliminar el archivo subido
      return res.status(500).json({ message: error.message });
    }
  }

  public async uploadFileOfElementRelease(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const { file } = req; // Aquí multer coloca el archivo
    const { idElementRelease, idStandardElementsRequiredFiles } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    try {
      /**
       * Step 1: It is neccesary to know, the name of the future folder
       */
      let nameFolder: string = '';
      nameFolder =
        await this.FileManagementService.getNameOfFolderToSaveElementRelease(
          idElementRelease,
        );

      /**
       * Step 2: With the name of the future folder and the file, we need to store them in the storage provider
       */

      const responseUpload = await this.fileService.uploadFile(
        this.containerName,
        file.buffer,
        nameFolder + '/' + file.originalname,
      );

      /**
       * Step 3: Verify if the document has signs
       */
      const fileSigns = await this.signService.CheckDocument(file);
      const { content, ...signsInformation } = fileSigns || {};

      /**
       * Step 4: After confirming that the file was saved in the storage provider, we need to create the record in the database
       */

      const saveResponse =
        await this.FileManagementService.saveRecordOfElementRelease(
          idElementRelease,
          idStandardElementsRequiredFiles,
          file,
          responseUpload,
        );
      return res.json({ saveResponse, signsInformation });
    } catch (error: any) {
      console.error(
        'FileManagementController uploadFileOfElementRelease, error:',
      );
      console.error(error.message);
      // Eliminar el archivo subido
      return res.status(500).json({ message: error.message });
    }
  }

  public async uploadFileOfOilfieldOperation(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const { file } = req; // Aquí multer coloca el archivo
    const { idOilfieldOperations, idStandardFileTypesOfOilfieldOperations } =
      req.body;

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    try {
      /**
       * Step 1: It is neccesary to know, the name of the future folder
       */
      let nameFolder: string = '';
      nameFolder =
        await this.FileManagementService.getNameOfFolderToSaveOilfieldOperation(
          idOilfieldOperations,
        );

      /**
       * Step 2: With the name of the future folder and the file, we need to store them in the storage provider
       */

      const responseUpload = await this.fileService.uploadFile(
        this.containerName,
        file.buffer,
        nameFolder + '/' + file.originalname,
      );

      /**
       * Step 3: Verify if the document has signs
       */
      const fileSigns = await this.signService.CheckDocument(file);
      const { content, ...signsInformation } = fileSigns || {};

      /**
       * Step 4: After confirming that the file was saved in the storage provider, we need to create the record in the database
       */

      const saveResponse =
        await this.FileManagementService.saveRecordOfOilfieldOperation(
          idOilfieldOperations,
          idStandardFileTypesOfOilfieldOperations,
          file,
          responseUpload,
        );
      return res.json({ saveResponse, signsInformation });
    } catch (error: any) {
      console.error(
        'FileManagementController uploadFileOfElementRelease, error:',
      );
      console.error(error.message);
      // Eliminar el archivo subido
      return res.status(500).json({ message: error.message });
    }
  }

  public async getDocumentsOfElement(req: Request, res: Response) {
    const { idStandardElements, idStandardCondition } = req.body;

    try {
      const saveResponse =
        await this.FileManagementService.getDocumentsOfElement(
          idStandardElements,
          idStandardCondition,
        );
      return res.json(saveResponse);
    } catch (error: any) {
      console.error('FileManagementController getDocumentsOfElement, error:');
      console.error(error.message);
      // Eliminar el archivo subido
      return res.status(500).json({ message: error.message });
    }
  }

  public async obtainSheets(req: Request, res: Response) {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    } else {
      try {
        const response = await this.excelFileService.obtainSheets(file.buffer);
        return res.json(response);
      } catch (error: any) {
        console.error('FileManagementController obtainSheets, error:');
        console.error(error.message);
        // Eliminar el archivo subido
        return res.status(500).json({ message: error.message });
      }
    }
  }
  public async obtainElementsOfSheet(req: Request, res: Response) {
    const { file } = req; // Aquí multer coloca el archivo
    const { sheetSelected } = req.body;

    //console.log('file 2 ');
    //console.log(file);
    //let response: any;
    try {
      const response = await this.excelFileService.readElements(
        file,
        sheetSelected,
        'C',
        10,
        'C5',
      );
      return res.json(response);
    } catch (error: any) {
      console.error('FileManagementController obtainSheets, error:');
      console.error(error.message);
      // Eliminar el archivo subido
      return res.status(500).json({ message: error.message });
    }
  }

  public async retrySendFile(
    res: Response,
    retries: number = 3,
    delay: number = 1000, // Retraso entre reintentos
    filePath: any,
    idStoredFiles: any,
    fileName: any,
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const fileResponse: string = await this.fileService.obtainFile(
          this.containerName,
          filePath,
          idStoredFiles,
          fileName,
        );

        await new Promise<void>((resolve, reject) => {
          res.sendFile(fileResponse, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log('Archivo enviado exitosamente del intento ' + i);
        return fileResponse; // Salir si se envió exitosamente
      } catch (err) {
        console.error(`Error al enviar archivo (intento ${i + 1}):`, err);
        console.error(filePath);
        if (i < retries - 1) {
          console.log('Reintentando...');
          await new Promise(resolve => setTimeout(resolve, delay)); // Retraso antes de reintentar
        } else {
          throw err; // Lanzar el error después del último intento
        }
      }
    }
  }

  public async obtainFile(req: Request, res: Response) {
    const { filePath, idStoredFiles, fileName } = req.body;

    try {
      try {
        // Intentar enviar el archivo con reintentos
        const fileResponse = await this.retrySendFile(
          res,
          3,
          2000,
          filePath,
          idStoredFiles,
          fileName,
        ); // 3 intentos con 1 segundo de espera

        // Eliminar el archivo temporal después de enviarlo
        fs.unlink(fileResponse, unlinkErr => {
          if (unlinkErr)
            console.error('Error al eliminar el archivo temporal:', unlinkErr);
          else console.log('Archivo temporal eliminado correctamente.');
        });
      } catch (sendError) {
        console.error('Error definitivo al enviar el archivo:', sendError);
        res.status(500).send('Error al enviar el archivo');
      }
    } catch (error) {
      console.error('Error al acceder al archivo:', error);
      res.status(500).send('Error al leer el archivo');
    }
  }

  public async deleteFileOfRelease(req: Request, res: Response) {
    // eslint-disable-next-line prefer-const
    let { idStoredFiles } = req.body;

    if (!idStoredFiles) {
      return res.status(400).json({ message: 'Error enviando informacion' });
    } else {
      try {
        const response = {
          idStoredFiles,
        };

        //Primero borro de la base de datos, luego del storage accounts
        const result =
          await this.FileManagementService.deleteFileOfRelease(idStoredFiles);

        await this.fileService.deleteFile(result.filePath);

        return res.json(response);
      } catch (error: any) {
        console.error('FileManagementController deleteFile, error:');
        console.error(error.message);
        return res.status(500).json({ message: error.message });
      }
    }
  }

  public async deleteFileOfElementRelease(req: Request, res: Response) {
    // eslint-disable-next-line prefer-const
    let { idStoredFiles } = req.body;

    if (!idStoredFiles) {
      return res.status(400).json({ message: 'Error enviando informacion' });
    } else {
      try {
        const response = {
          idStoredFiles,
        };

        //Primero borro de la base de datos, luego del storage accounts
        const result =
          await this.FileManagementService.deleteFileOfElementRelease(
            idStoredFiles,
          );

        await this.fileService.deleteFile(result.filePath);

        return res.json(response);
      } catch (error: any) {
        console.error('FileManagementController deleteFile, error:');
        console.error(error.message);
        return res.status(500).json({ message: error.message });
      }
    }
  }

  public async deleteFileOfOilfieldOperation(req: Request, res: Response) {
    // eslint-disable-next-line prefer-const
    let { idStoredFiles } = req.body;

    if (!idStoredFiles) {
      return res.status(400).json({ message: 'Error enviando informacion' });
    } else {
      try {
        const response = {
          idStoredFiles,
        };

        //Primero borro de la base de datos, luego del storage accounts
        const result =
          await this.FileManagementService.deleteFileOfOilfieldOperation(
            idStoredFiles,
          );

        await this.fileService.deleteFile(result.filePath);

        return res.json(response);
      } catch (error: any) {
        console.error('FileManagementController deleteFile, error:');
        console.error(error.message);
        return res.status(500).json({ message: error.message });
      }
    }
  }

  public async reloadFileOfRelease(req: Request, res: Response): Promise<Response> {
    const { idRelease } = req.body;

    if (!idRelease) {
    return res.status(400).json({ message: 'idRelease is required' });
    }

    try {
    const filesData = await this.FileManagementService.getFilesOfRelease(idRelease);
    return res.json(filesData);
    } catch (error: any) {
    console.error('FileManagementController reloadFileOfRelease, error:');
    console.error(error.message);
    return res.status(500).json({ message: error.message });
    }
  }
}

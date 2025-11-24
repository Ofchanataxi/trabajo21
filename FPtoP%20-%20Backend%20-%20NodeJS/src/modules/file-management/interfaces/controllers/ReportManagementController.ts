// src/interfaces/controllers/ZipController.ts
import { Request, Response } from 'express';
import { FileService } from '../../../../shared/infrastructure/Storage/StorageFileService';
import { StorageFactory } from '../../../../shared/infrastructure/Storage/StorageFactory';
import { FileManagementService } from '../../application/services/FileManagementService';
import { ExcelFileService } from '../../application/services/ExcelFileService';
import * as fs from 'fs';
import { SignService } from '../../../../shared/infrastructure/Services/CheckSignService';
import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

export class ReportManagementController {
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

  public async uploadReport(
    file: Buffer,
    nameFolder: string,
    fileName: string,
    idOilFielOperations: string,
  ): Promise<{ success: boolean; filePath: string }> {
    if (!file) {
      throw new Error('File is required');
    }
    const db = createDatabase('POSTGRESQL');
    try {
      const filePath = `${nameFolder}/${fileName}`;

      try {
        const sql = `
                    SELECT "filePath"
                    FROM public."StoredFiles"
                    WHERE 
                      "fileName" = $1
                      AND "filePath" LIKE '%' || $2::text
                      AND "fileExtension" = $3
                  `;

        const params = [fileName, filePath, idOilFielOperations + '/xlsx'];

        try {
          const result = await db.query(sql, params);

          if (result.data.length > 0) {
            const pathToDelete = result.data[0].filePath;
            await this.fileService.deleteFile(pathToDelete);
          } else {
            console.log('No matching file found');
          }
        } catch (error: any) {
          console.error('Error while deleting file:', error);
        }
      } catch (error: any) {
        console.log(error);
      }
      const responseUpload = await this.fileService.uploadFile(
        this.containerName,
        file,
        filePath,
      );
      await db.query('BEGIN');
      const objStoredFile = {
        fileName: fileName,
        filePath: responseUpload.url,
        size: file.length,
        fileExtension: idOilFielOperations + '/xlsx',
        idStorageProvider: 1, // This is the ID of the Azure Provider
      };

      const deleteStoredFilesQuery = `
        delete from public."StoredFiles" where (
          "fileName" = $1
          and "filePath" like concat('%',$2::text) 
          and "fileExtension" = $3
          and "idStorageProvider" = 1)
      `;

      const deleteFileValues = [
        objStoredFile.fileName,
        objStoredFile.filePath,
        objStoredFile.fileExtension,
      ];

      await db.query(deleteStoredFilesQuery, deleteFileValues);
      await db.query('COMMIT');

      const insertStoredFilesQuery = `
        INSERT INTO public."StoredFiles"(
          "fileName", "filePath", size, "fileExtension", "idStorageProvider", "createdTimestamp")
        VALUES ($1, $2, $3, $4, 1, NOW())
        RETURNING "id";
      `;

      const storedFileValues = [
        objStoredFile.fileName,
        objStoredFile.filePath,
        objStoredFile.size,
        objStoredFile.fileExtension,
      ];

      const responseStoredFiles = await db.query(
        insertStoredFilesQuery,
        storedFileValues,
      );
      await db.query('COMMIT');
      return {
        success: true,
        filePath,
      };
    } catch (error: any) {
      await db.query('ROLLBACK');
      console.error('uploadReport error:', error.message);
      throw new Error(`Upload failed: ${error.message}`);
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
}

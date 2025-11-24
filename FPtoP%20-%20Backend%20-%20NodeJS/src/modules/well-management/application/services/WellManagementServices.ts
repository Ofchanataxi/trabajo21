import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

export class WellManagementService {
  constructor() {}

  public sanitizeFileName(fileName: string) {
    // Definir los caracteres no permitidos para nombres de carpetas
    const invalidChars = /[/\\:*?",<>|]/g;

    // Reemplazar los caracteres no permitidos por guiones bajos o eliminarlos
    const sanitizedFileName = fileName.replace(invalidChars, '_');

    return sanitizedFileName;
  }

  public async getNameOfFolderToSave(
    idElementRelease: number,
  ): Promise<string> {
    const db = createDatabase('POSTGRESQL');
    const response = await db.query(
      `SELECT op."id" AS "idOilfieldOperations", op."operationNumber", w."wellShortName", otp."operationCode", sbl."name" AS "businessLineName", sbl."id" AS "idStandardBusinessLines", er."id" AS "idElementRelease", er."pecDescription" FROM public."ElementRelease" er 
      JOIN public."StandardElements" se ON er."idStandardElements" = se.id
      JOIN public."StandardBusinessLines" sbl ON se."idStandardBusinessLines" = sbl.id
      JOIN public."Release" r ON er."idRelease" = r.id
      JOIN public."OilfieldOperations" op ON r."idOilfieldOperations" = op.id
      JOIN public."Well" w ON op."idWell" = w.id
      JOIN public."OilfieldTypeOperations" otp ON op."idOilfieldTypeOperations" = otp.id
      WHERE er.id = ${idElementRelease}`,
    );

    await db.disconnect();

    const { data, totalRows } = response;
    if (totalRows === 0) {
      throw new Error('No se encuentra el identificador del elemento');
    }

    const element = data[0];
    const mapBusinessLines: any = {
      '1': '1.- LOGISTICA',
      '2': '2.- COMPLETION',
      '3': '3.- ALS',
      '4': '4.- CAMERON',
    };
    const nameFolderBusinessLine =
      mapBusinessLines[element.idStandardBusinessLines];

    const nameFolder = `${element.wellShortName} ${element.operationCode}#${element.operationNumber}`;
    //const idOilfieldOperations = element.idOilfieldOperations;

    const finalPath = `${nameFolder}/SOPORTES/${nameFolderBusinessLine}/${this.sanitizeFileName(element.pecDescription)}`;

    return finalPath;
  }

  public async saveRecordOfElementRelease(
    idElementRelease: number,
    idStandardElementsRequiredFiles: number,
    file: any,
    responseUpload: any,
  ): Promise<any> {
    const objStoredFile = {
      fileName: file.originalname,
      filePath: responseUpload.url,
      size: file.size,
      fileExtension: file.mimetype,
      idStorageProvider: 1, // This is the ID of the Azure Provider
    };

    const objFileOfElementsRelease = {
      idElementRelease: idElementRelease,
      idStandardElementsRequiredFiles: idStandardElementsRequiredFiles,
    };

    let response = {};
    const db = createDatabase('POSTGRESQL');
    // Iniciar una transacción
    await db.query('BEGIN');

    try {
      // Primer INSERT para StoredFiles, con RETURNING para obtener el id
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
      const idStoredFiles = responseStoredFiles.data[0].id; // Obtenemos el id generado
      response = { ...response, idStoredFiles: idStoredFiles };

      // Segundo INSERT para FilesOfElementsRelease, usando el idStoredFiles
      const insertFilesOfElementsReleaseQuery = `
        INSERT INTO public."FilesOfElementsRelease"(
          "idElementRelease", "idStoredFiles", "idStandardElementsRequiredFiles")
        VALUES ($1, $2, $3)
        RETURNING "id";
      `;

      const filesOfElementsReleaseValues = [
        objFileOfElementsRelease.idElementRelease,
        idStoredFiles, // Usar el id obtenido del primer insert
        objFileOfElementsRelease.idStandardElementsRequiredFiles,
      ];

      const responseFilesOfElementsRelease = await db.query(
        insertFilesOfElementsReleaseQuery,
        filesOfElementsReleaseValues,
      );

      const idFilesOfElementsRelease =
        responseFilesOfElementsRelease.data[0].id;
      response = {
        ...response,
        idFilesOfElementsRelease: idFilesOfElementsRelease,
      };

      // Si todo va bien, hacemos el commit de la transacción
      await db.query('COMMIT');
    } catch (error: any) {
      // Si hay un error, hacemos rollback de la transacción
      await db.query('ROLLBACK');
      console.error('Error en la transacción:', error.message);
    }

    await db.disconnect();

    return response;
  }

  public async saveOilfieldOperationRelease(
    wellName: string,
    oilfieldTypeOperations: string,
    woNumber: number,
    worig: string,
    longWellName: string,
    jobStartDate: string,
    jobEndDate: string,
    idBusinessLine: number,
    idUser: number,
  ): Promise<object> {
    /**
     * First, I need to validate whether the record exists
     */

    const db = createDatabase('POSTGRESQL');
    const query = `SELECT * FROM CreateNewRelease('${worig}', '${wellName}', '${longWellName}', '${oilfieldTypeOperations}', ${woNumber}, '${jobEndDate}', '${jobStartDate}','${idBusinessLine}', ${idUser})`;
    //console.log('Voy a ejecutar');
    //console.log(query);
    const response = await db.query(query);

    await db.disconnect();

    return response;
  }
}

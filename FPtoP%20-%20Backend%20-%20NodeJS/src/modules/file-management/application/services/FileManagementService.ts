import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

export class FileManagementService {
  constructor() {}

  public sanitizeFileName(fileName: string) {
    // Definir los caracteres no permitidos para nombres de carpetas
    const invalidChars = /[/\\:*?",<>|]/g;

    // Reemplazar los caracteres no permitidos por guiones bajos o eliminarlos
    const sanitizedFileName = fileName.replace(invalidChars, '_');

    return sanitizedFileName;
  }

  public async getNameOfFolderToSaveRelease(
    idRelease: number,
  ): Promise<string> {
    const db = createDatabase('POSTGRESQL');
    const response = await db.query(
      `SELECT op."id" AS "idOilfieldOperations", op."operationNumber", w."wellShortName", otp."operationCode", sbl."name" AS "businessLineName", sbl."id" AS "idStandardBusinessLines", r."id" AS "idRelease"
      FROM public."Release" r
      JOIN public."StandardBusinessLines" sbl ON r."idBusinessLine" = sbl.id
      JOIN public."OilfieldOperations" op ON r."idOilfieldOperations" = op.id
      JOIN public."Well" w ON op."idWell" = w.id
      JOIN public."OilfieldTypeOperations" otp ON op."idOilfieldTypeOperations" = otp.id
      WHERE r.id = ${idRelease}`,
    );

    await db.disconnect();

    const { data, totalRows } = response;
    if (totalRows === 0) {
      throw new Error('No se encuentra el identificador del elemento 2');
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

    const finalPath = `${nameFolder}/SOPORTES/${nameFolderBusinessLine}/${element.idRelease}`;

    return finalPath;
  }

  public async getNameOfFolderToSaveOilfieldOperation(
    idOilfieldOperations: number,
  ): Promise<string> {
    const db = createDatabase('POSTGRESQL');
    const response = await db.query(
      `SELECT op."id" AS "idOilfieldOperations", op."operationNumber", w."wellShortName", otp."operationCode"
      FROM public."OilfieldOperations" op
      JOIN public."Well" w ON op."idWell" = w.id
      JOIN public."OilfieldTypeOperations" otp ON op."idOilfieldTypeOperations" = otp.id
      WHERE op.id = ${idOilfieldOperations}`,
    );

    await db.disconnect();

    const { data, totalRows } = response;
    if (totalRows === 0) {
      throw new Error('No se encuentra el identificador del elemento 2');
    }

    const element = data[0];

    const nameFolder = `${element.wellShortName} ${element.operationCode}#${element.operationNumber}`;
    //const idOilfieldOperations = element.idOilfieldOperations;

    const finalPath = `${nameFolder}`;

    return finalPath;
  }

  public async getNameOfFolderToSaveElementRelease(
    idElementRelease: number,
  ): Promise<string> {
    const db = createDatabase('POSTGRESQL');
    const response = await db.query(
      `SELECT op."id" AS "idOilfieldOperations", op."operationNumber", w."wellShortName", otp."operationCode", sbl."name" AS "businessLineName", sbl."id" AS "idStandardBusinessLines", er."id" AS "idElementRelease", er."pecDescription", r.id AS "idRelease" FROM public."ElementRelease" er 
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
      throw new Error('No se encuentra el identificador del elemento 2');
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

    const finalPath = `${nameFolder}/SOPORTES/${nameFolderBusinessLine}/${element.idRelease}/ID${idElementRelease}-${this.sanitizeFileName(element.pecDescription)}`;

    return finalPath;
  }

  public async saveRecordOfRelease(
    idRelease: number,
    idStandardFileTypesOfRelease: number,
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
        INSERT INTO public."FilesOfRelease"(
        "idRelease", "idStoredFiles", "idStandardFileTypesOfRelease")
        VALUES ($1, $2, $3)
        RETURNING "id";        
      `;

      const filesOfElementsReleaseValues = [
        idRelease,
        idStoredFiles, // Usar el id obtenido del primer insert
        idStandardFileTypesOfRelease,
      ];

      const responseFilesOfElementsRelease = await db.query(
        insertFilesOfElementsReleaseQuery,
        filesOfElementsReleaseValues,
      );

      const idFilesOfRelease = responseFilesOfElementsRelease.data[0].id;
      response = {
        ...response,
        idFilesOfRelease: idFilesOfRelease,
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

  public async saveRecordOfOilfieldOperation(
    idOilfieldOperations: number,
    idStandardFileTypesOfOilfieldOperations: number,
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

    const objFileOfOilfieldOperation = {
      idOilfieldOperations: idOilfieldOperations,
      idStandardFileTypesOfOilfieldOperations:
        idStandardFileTypesOfOilfieldOperations,
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

      // Segundo INSERT para FilesOfOilfieldOperations, usando el idStoredFiles
      const insertFilesOfOilfieldOperationsQuery = `
        INSERT INTO public."FilesOfOilfieldOperations"(
          "idOilfieldOperations", "idStoredFiles", "idStandardFileTypesOfOilfieldOperations")
        VALUES ($1, $2, $3)
        RETURNING "id";
      `;

      const filesOfOilfieldOperationValues = [
        objFileOfOilfieldOperation.idOilfieldOperations,
        idStoredFiles, // Usar el id obtenido del primer insert
        objFileOfOilfieldOperation.idStandardFileTypesOfOilfieldOperations,
      ];

      const responseFilesOfOilfieldOperation = await db.query(
        insertFilesOfOilfieldOperationsQuery,
        filesOfOilfieldOperationValues,
      );

      const idFilesOfElementsRelease =
        responseFilesOfOilfieldOperation.data[0].id;
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

  public async getDocumentsOfElement(
    idStandardElements: number,
    idStandardCondition: number,
  ): Promise<object> {
    const db = createDatabase('POSTGRESQL');
    const response = await db.query(
      `SELECT sef."id" AS "idStandardElementsRequiredFiles", sef."name", sef."fileExtension", sef."multipleFiles", sef."idStandardElements", sef."required", sef."required_signatures", sef."total_people_required_to_sign" FROM public."StandardElements" se
      JOIN public."StandardElementsRequiredFiles" sef ON sef."idStandardElements" = se.id
      WHERE se."id" = ${idStandardElements} AND sef."idStandardCondition" = ${idStandardCondition}`,
    );

    await db.disconnect();

    return response;
  }

  public deleteFileOfElementRelease = async (idStoredFiles: number) => {
    const db = createDatabase('POSTGRESQL');
    await db.query('BEGIN'); // Iniciar la transacción
    try {
      // 1. Obtener el path antes de eliminar
      const result = await db.query(
        `SELECT "filePath" FROM public."StoredFiles" 
        WHERE id = $1;`,
        [idStoredFiles],
      );

      const { data, totalRows } = result;

      if (totalRows === 0) {
        throw new Error('Archivo no encontrado');
      }

      const filePath = data[0].filePath;

      await db.query(
        `DELETE FROM public."FilesOfElementsRelease" 
        WHERE "idStoredFiles" = $1;`,
        [idStoredFiles],
      );

      await db.query(
        `DELETE FROM public."StoredFiles" 
        WHERE id = $1;`,
        [idStoredFiles],
      );

      await db.query('COMMIT'); // Confirmar la transacción
      await db.disconnect();

      return { message: 'Eliminación exitosa', filePath: filePath };
    } catch (error: any) {
      await db.query('ROLLBACK'); // Deshacer cambios si hay error
      throw new Error(error.message);
    }
  };

  public deleteFileOfOilfieldOperation = async (idStoredFiles: number) => {
    const db = createDatabase('POSTGRESQL');
    await db.query('BEGIN'); // Iniciar la transacción
    try {
      // 1. Obtener el path antes de eliminar
      const result = await db.query(
        `SELECT "filePath" FROM public."StoredFiles" 
        WHERE id = $1;`,
        [idStoredFiles],
      );

      const { data, totalRows } = result;

      if (totalRows === 0) {
        throw new Error('Archivo no encontrado');
      }

      const filePath = data[0].filePath;

      await db.query(
        `DELETE FROM public."FilesOfOilfieldOperations" 
        WHERE "idStoredFiles" = $1;`,
        [idStoredFiles],
      );

      await db.query(
        `DELETE FROM public."StoredFiles" 
        WHERE id = $1;`,
        [idStoredFiles],
      );

      await db.query('COMMIT'); // Confirmar la transacción
      await db.disconnect();

      return { message: 'Eliminación exitosa', filePath: filePath };
    } catch (error: any) {
      await db.query('ROLLBACK'); // Deshacer cambios si hay error
      throw new Error(error.message);
    }
  };

  public deleteFileOfRelease = async (idStoredFiles: number) => {
    const db = createDatabase('POSTGRESQL');
    await db.query('BEGIN'); // Iniciar la transacción
    try {
      // 1. Obtener el path antes de eliminar
      const result = await db.query(
        `SELECT "filePath" FROM public."StoredFiles" 
        WHERE id = $1;`,
        [idStoredFiles],
      );

      const { data, totalRows } = result;

      if (totalRows === 0) {
        throw new Error('Archivo no encontrado');
      }

      const filePath = data[0].filePath;

      await db.query(
        `DELETE FROM public."FilesOfRelease" 
        WHERE "idStoredFiles" = $1;`,
        [idStoredFiles],
      );

      await db.query(
        `DELETE FROM public."StoredFiles" 
        WHERE id = $1;`,
        [idStoredFiles],
      );

      await db.query('COMMIT'); // Confirmar la transacción
      await db.disconnect();

      return { message: 'Eliminación exitosa', filePath: filePath };
    } catch (error: any) {
      await db.query('ROLLBACK'); // Deshacer cambios si hay error
      throw new Error(error.message);
    }
  };

  public async getFilesOfRelease(idRelease: number): Promise<object> {
    const db = createDatabase('POSTGRESQL');
    const query = `
    SELECT
      sf.id AS "idStoredFiles",
      sf."fileName",
      sf."filePath",
      sf.size,
      sf."fileExtension",
      fr."idStandardFileTypesOfRelease"
    FROM public."FilesOfRelease" fr
    JOIN public."StoredFiles" sf ON fr."idStoredFiles" = sf.id
    WHERE fr."idRelease" = $1;
    `;
    const response = await db.query(query, [idRelease]);
    await db.disconnect();
    return response;
 }
}

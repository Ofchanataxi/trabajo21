import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

export class ReleaseService {
  constructor() {}

  public obtainElementsOfRelease = async (idRelease: number) => {
  try {
    const db = createDatabase('POSTGRESQL');
    
    const elementsResponse = await db.query(
      `SELECT er.*, sc.condition, scc."couplingCondition" FROM public."ElementRelease" er
       JOIN public."StandardCondition" sc ON sc.id = er."idCondition"
       LEFT JOIN public."StandardCouplingCondition" scc ON scc.id = er."idCouplingCondition"
       WHERE er."idRelease" = ${idRelease}`
    );

    const elementFilesResponse = await db.query(
      `SELECT 
         fer."id" AS "idFilesOfElementsRelease", fer."idElementRelease", fer."idStoredFiles", fer."idStandardElementsRequiredFiles",
         er."idRelease",
         sf.*
       FROM public."FilesOfElementsRelease" fer
       JOIN public."ElementRelease" er ON er.id = fer."idElementRelease"
       JOIN public."StoredFiles" sf ON sf.id = fer."idStoredFiles"
       WHERE er."idRelease" = ${idRelease}`
    );

    const releaseDocumentsResponse = await db.query(
      `SELECT 
         fr.id AS "idFilesOfRelease",
         fr."idRelease",
         fr."idStoredFiles",
         sftr.name AS "fileTypeName", -- Nombre del tipo de documento (ej: "Guía")
         sftr."fileExtension" AS "requiredExtension",
         sftr.required,
         sf."fileName",
         sf."filePath",
         sf.size,
         sf."fileExtension"
       FROM public."FilesOfRelease" fr
       JOIN public."StoredFiles" sf ON sf.id = fr."idStoredFiles"
       JOIN public."StandardFileTypesOfRelease" sftr ON sftr.id = fr."idStandardFileTypesOfRelease"
       WHERE fr."idRelease" = ${idRelease}`
    );


    const groupedByElementRelease = elementFilesResponse.data.reduce((acc, file) => {
      if (!acc[file.idElementRelease]) {
        acc[file.idElementRelease] = {};
      }
      if (!acc[file.idElementRelease][file.idStandardElementsRequiredFiles]) {
        acc[file.idElementRelease][file.idStandardElementsRequiredFiles] = [];
      }
      acc[file.idElementRelease][file.idStandardElementsRequiredFiles].push(file);
      return acc;
    }, {});

    await db.disconnect();

    const elementsData = elementsResponse.data.map(element => {
      return {
        ...element,
        savedDocuments: groupedByElementRelease[element.id] || null,
      };
    });
    console.log('releaseDocumentsResponse', releaseDocumentsResponse.data);
    console.log('elementsData', elementsData);

    

    return {
      success: true, 
      data: elementsData, 
      releaseDocuments: releaseDocumentsResponse.data 
    };

  } catch (error: any) {
    throw new Error(error.message);
  }
};

  public updateReleaseState = async (
    idReleaseState: number,
    idRelease: number,
    idCreatedBy: number,
    changeReason: string,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');
      const query = `UPDATE public."Release"
        SET "idReleaseState" = ${idReleaseState},
        "idCreatedBy" = ${idCreatedBy},
        "changeReason" = '${changeReason}'
        WHERE id = ${idRelease}`;
      const response = await db.query(query);

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getMetaDataReleasesByState = async (
    idReleaseState: number,
    idBusinessLine: null | number = null,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');

      let query = `
      SELECT 
          r1.*,
          COUNT(rsh.id) AS total_reviews
      FROM (
          SELECT
              oo."operationNumber",
              oto."operationCode",
              w."wellName",
              w."wellShortName",
              rig."name" AS "rigName",
              sbl."name" AS "businessLineName",
              sbl.id AS "idBusinessLine",
              rsh."idNewReleaseState",
              rsh."idPreviousState",
              rsh."changeTimestamp" AS "lastChangedStateTimestamp",
              u."firstName",
              u."lastName",
              u."email",
              oo.id AS "idOilfieldOperations",
              r.id AS "idRelease"
          FROM public."Release" r
          LEFT JOIN public."OilfieldOperations" oo ON r."idOilfieldOperations" = oo.id
          LEFT JOIN public."OilfieldTypeOperations" oto ON oo."idOilfieldTypeOperations" = oto.id
          LEFT JOIN public."Well" w ON oo."idWell" = w.id
          LEFT JOIN public."Rig" rig ON oo."idRig" = rig.id
          LEFT JOIN public."StandardBusinessLines" sbl ON r."idBusinessLine" = sbl.id
          LEFT JOIN (
              SELECT DISTINCT ON ("idRelease") * 
              FROM public."ReleaseStateHistory" 
              ORDER BY "idRelease", "changeTimestamp" DESC
          ) rsh ON rsh."idRelease" = r.id
          LEFT JOIN public."Users" u ON rsh."idChangedBy" = u.id
          WHERE r."idReleaseState" = ${idReleaseState}
          `;
      if (idBusinessLine !== null) {
        query = query + `AND sbl.id = ${idBusinessLine}`;
      }

      query = query + ' ORDER BY rsh."changeTimestamp" DESC';

      query =
        query +
        `
      ) r1
      LEFT JOIN public."ReleaseStateHistory" rsh ON rsh."idRelease" = r1."idRelease"
      GROUP BY 
          r1."operationNumber", r1."operationCode", r1."wellName", r1."wellShortName",
          r1."rigName", r1."businessLineName", r1."idBusinessLine", r1."idNewReleaseState",
          r1."idPreviousState", r1."lastChangedStateTimestamp", r1."firstName", r1."lastName",
          r1."email", r1."idOilfieldOperations", r1."idRelease";
      `;
      // let query = `SELECT
      //     oo."operationNumber",
      //     oto."operationCode",
      //     w."wellName",
      //     w."wellShortName",
      //     rig."name" AS "rigName",
      //     sbl."name" AS "businessLineName",
      //     sbl.id AS "idBusinessLine",
      //     rsh."idNewReleaseState",
      //     rsh."idPreviousState",
      //     rsh."changeTimestamp" AS "lastChangedStateTimestamp",
      //     u."firstName",
      //     u."lastName",
      //     u."email",
      //     oo.id AS "idOilfieldOperations",
      //     r.id AS "idRelease"
      //     FROM public."Release" r
      //     LEFT JOIN public."OilfieldOperations" oo ON r."idOilfieldOperations" = oo.id
      //     LEFT JOIN public."OilfieldTypeOperations" oto ON oo."idOilfieldTypeOperations" = oto.id
      //     LEFT JOIN public."Well" w ON oo."idWell" = w.id
      //     LEFT JOIN public."Rig" rig ON oo."idRig" = rig.id
      //     LEFT JOIN public."StandardBusinessLines" sbl ON r."idBusinessLine" = sbl.id
      //     LEFT JOIN (SELECT DISTINCT ON ("idRelease") * FROM public."ReleaseStateHistory" ORDER BY "idRelease", "changeTimestamp" DESC) rsh ON rsh."idRelease" = r.id
      //     LEFT JOIN public."Users" u ON rsh."idChangedBy" = u.id
      //     WHERE r."idReleaseState" = ${idReleaseState}
      //     `;

      const response = await db.query(query);

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getReleaseData = async (idRelease: number) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const response = await db.query(
        `SELECT id, "idBusinessLine", "timestamp", "idReleaseState", "idOilfieldOperations", "idCreatedBy" FROM public."Release" r WHERE r.id = ${idRelease}`,
      );

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public deleteReleaseData = async (idRelease: number) => {
    const db = createDatabase('POSTGRESQL');
    await db.query('BEGIN'); // Iniciar la transacción
    try {
      await db.query(
        `DELETE FROM public."FilesOfElementsRelease"
         WHERE "idElementRelease" IN (
            SELECT id FROM public."ElementRelease"
            WHERE "idRelease" = $1
         );`,
        [idRelease],
      );

      await db.query(
        `DELETE FROM public."FilesOfRelease"
         WHERE "idRelease" = $1;`,
        [idRelease],
      );

      await db.query(
        `DELETE FROM public."StoredFiles"
         WHERE id IN (
            SELECT DISTINCT "idStoredFiles"
            FROM public."FilesOfRelease"
            WHERE "idRelease" = $1
            UNION
            SELECT DISTINCT "idStoredFiles"
            FROM public."FilesOfElementsRelease"
            WHERE "idElementRelease" IN (
                SELECT id FROM public."ElementRelease" WHERE "idRelease" = $1
            )
         );`,
        [idRelease],
      );

      // Eliminar registros en ElementDetail antes de eliminar ElementRelease
      await db.query(
        `DELETE FROM public."ElementDetail"
         WHERE "idElementRelease" IN (
            SELECT id FROM public."ElementRelease"
            WHERE "idRelease" = $1
         );`,
        [idRelease],
      );

      await db.query(
        `DELETE FROM public."ElementRelease"
         WHERE "idRelease" = $1;`,
        [idRelease],
      );

      await db.query(
        `DELETE FROM public."Release"
         WHERE id = $1;`,
        [idRelease],
      );

      await db.query('COMMIT'); // Confirmar la transacción
      await db.disconnect();

      return { message: 'Eliminación exitosa' };
    } catch (error: any) {
      await db.query('ROLLBACK'); // Deshacer cambios si hay error
      throw new Error(error.message);
    }
  };

  public getMetaDataActiveWells = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
          SELECT 
            oo.id AS operation_id,
            oo."idOilfieldTypeOperations",
            oo."idWell",
            oo."operationNumber",
            oo."startDateTime",
            oo."endDateTime",
            oo."idRig",
            oo."idOilfieldOperationsState",

            w."wellName",
            w."wellShortName",

            ots.name AS operation_state_name,

            oto."operationType",
            oto."operationDescription",
            oto."operationCode",
            oto."avocetName",

            COUNT(r.id) AS release_count, -- Contar el número de releases asociados

            rig.name AS rig_name,
            rig.emr AS rig_emr

        FROM public."OilfieldOperations" oo
        LEFT JOIN public."Well" w 
            ON oo."idWell" = w.id
        LEFT JOIN public."OilfieldOperationsState" ots 
            ON oo."idOilfieldOperationsState" = ots.id
        LEFT JOIN public."OilfieldTypeOperations" oto 
            ON oo."idOilfieldTypeOperations" = oto.id
        LEFT JOIN public."Release" r 
            ON oo.id = r."idOilfieldOperations"
        LEFT JOIN public."Rig" rig
            ON oo."idRig" = rig.id

        GROUP BY 
            oo.id, 
            oo."idOilfieldTypeOperations", 
            oo."idWell", 
            oo."operationNumber", 
            oo."startDateTime", 
            oo."endDateTime", 
            oo."idRig", 
            oo."idOilfieldOperationsState",
            w."wellName",
            w."wellShortName",
            ots.name,
            oto."operationType",
            oto."operationDescription",
            oto."operationCode",
            oto."avocetName",
            rig.name,
            rig.emr
            ORDER BY oo.id ASC;
        `;

      const response = await db.query(query);

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getReleaseHistory = async (idRelease: number) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const response = await db.query(
        `SELECT 
          rsh."idRelease",
          rsh.id AS "idReleaseStateHistory",
          rsh."idNewReleaseState",
          rsh."idPreviousState",
          rsh."changeTimestamp",
          rsh."changeReason",
          u.id AS "idUsers",
          u."firstName",
          u."lastName",
          u."email",
          bl.id AS "idStandardBusinessLines",
          bl."name",
          rst."isForward",
          rs1.name AS "etapaInicio",
          rs2.name AS "etapaFin"
        FROM public."ReleaseStateHistory" rsh
        JOIN public."Users" u ON u.id = rsh."idChangedBy"
        LEFT JOIN public."ReleaseState" rs1 ON rs1.id = rsh."idPreviousState"
        LEFT JOIN public."ReleaseState" rs2 ON rs2.id = rsh."idNewReleaseState"
        JOIN public."StandardBusinessLines" bl ON bl.id = u."idBusinessLine"
        LEFT JOIN public."ReleaseStateTransition" rst ON rst."idNewReleaseState" IS NOT DISTINCT FROM rsh."idNewReleaseState" AND rst."idPreviousState" IS NOT DISTINCT FROM rsh."idPreviousState"
        WHERE rsh."idRelease" = ${idRelease}
        ORDER BY rsh.id DESC`,
      );

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getFilesOfRelease = async (idRelease: number) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
            sf.id AS "StoredFileID",
            sf."fileName",
            sf."filePath",
            sf.size AS "FileSize",
            sf."fileExtension",
            sf."idStorageProvider",
            sf."createdTimestamp",
            COALESCE(r.id, er."idRelease") AS "idRelease",
            er.id AS "idElementRelease",
            er."pecDescription",
            fer.id AS "FilesOfReleaseID",
            sftor."idStandardBusinessLines",
            sftor.id AS "idTally", 
            r."idReleaseState" 
        FROM 
            public."StoredFiles" sf
        LEFT JOIN 
            public."FilesOfRelease" fer ON sf.id = fer."idStoredFiles"
        LEFT JOIN 
            public."StandardFileTypesOfRelease" sftor ON fer."idStandardFileTypesOfRelease" = sftor.id
        LEFT JOIN 
            public."Release" r ON fer."idRelease" = r.id
        LEFT JOIN 
            public."FilesOfElementsRelease" fer_er ON sf.id = fer_er."idStoredFiles"
        LEFT JOIN 
            public."ElementRelease" er ON fer_er."idElementRelease" = er.id
        WHERE 
            COALESCE(r.id, er."idRelease") = $1;  
      `;

      const response = await db.query(query, [idRelease]); // Pasar idRelease como parámetro

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getFilesOfReleaseToReturn = async (idRelease: number) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `  
          SELECT 
              sf.id AS "StoredFileID",
              sf."fileName",
              sf."filePath",
              sf.size AS "FileSize",
              sf."fileExtension",
              sf."idStorageProvider",
              sf."createdTimestamp",
              COALESCE(r.id, er."idRelease") AS "idRelease",
              er.id AS "idElementRelease",
              er."pecDescription",
              fer.id AS "FilesOfReleaseID",
              sftor."idStandardBusinessLines",
              sftor.id AS "idTally", 
              r."idReleaseState"
          FROM 
              public."StoredFiles" sf
          LEFT JOIN 
              public."FilesOfRelease" fer ON sf.id = fer."idStoredFiles"
          LEFT JOIN 
              public."StandardFileTypesOfRelease" sftor ON fer."idStandardFileTypesOfRelease" = sftor.id
          LEFT JOIN 
              public."Release" r ON fer."idRelease" = r.id
          LEFT JOIN 
              public."FilesOfElementsRelease" fer_er ON sf.id = fer_er."idStoredFiles"
          LEFT JOIN 
              public."ElementRelease" er ON fer_er."idElementRelease" = er.id
          WHERE 
              COALESCE(r.id, er."idRelease") = $1
              AND (
                  er.id NOT IN (
                      SELECT et."element_id" 
                      FROM public."ElementTally" et
                  )
              )
      `;

      const response = await db.query(query, [idRelease]); // Pasar idRelease como parámetro

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };


  public getFilesOfReleaseToDetained = async (idRelease: number) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
          sf.id AS "StoredFileID",
          sf."fileName",
          sf."filePath",
          sf.size AS "FileSize",
          sf."fileExtension",
          sf."idStorageProvider",
          sf."createdTimestamp",
          COALESCE(r.id, er."idRelease") AS "idRelease",
          er.id AS "idElementRelease",
          er."pecDescription",
          fer.id AS "FilesOfReleaseID",
          sftor."idStandardBusinessLines",
          sftor.id AS "idTally", 
          r."idReleaseState"
      FROM 
          public."StoredFiles" sf
      LEFT JOIN 
          public."FilesOfRelease" fer ON sf.id = fer."idStoredFiles"
      LEFT JOIN 
          public."StandardFileTypesOfRelease" sftor ON fer."idStandardFileTypesOfRelease" = sftor.id
      LEFT JOIN 
          public."Release" r ON fer."idRelease" = r.id
      LEFT JOIN 
          public."FilesOfElementsRelease" fer_er ON sf.id = fer_er."idStoredFiles"
      LEFT JOIN 
          public."ElementRelease" er ON fer_er."idElementRelease" = er.id
      WHERE 
          COALESCE(r.id, er."idRelease") = $1
          AND er.id IN (
              SELECT et."element_id"
              FROM public."ElementTally" et
          );
      `;

      const response = await db.query(query, [idRelease]); // Pasar idRelease como parámetro

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
  public getReleases = async (idOilfieldOperations: number) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
          r.id AS "ReleaseID",
          r."idBusinessLine",
          sbl.name,
          r."timestamp",
          r."idReleaseState",
          r."idOilfieldOperations",
          r."idCreatedBy"
        FROM 
          public."Release" r
        LEFT JOIN public."StandardBusinessLines" sbl
          ON r."idBusinessLine" = sbl.id
        WHERE 
          r."idOilfieldOperations" = $1;
      `;

      const response = await db.query(query, [idOilfieldOperations]); // Pasar idRelease como parámetro

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getStandardCondition = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT id, condition
	        FROM public."StandardCondition";
      `;

      const response = await db.query(query);
      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
}

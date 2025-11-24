import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

interface StandardElement {
  id: number;
  name: string;
  idStandardBusinessLines: number;
  idStandardWellSections: number;
  verified: boolean;
  idStandardWellInfrastructureType: number;
  showRunBES: boolean;
  needSerialNumber: boolean;
}

interface updateExtensionDocuments {
  id: number;
  name: string;
  fileExtension: string;
  multipleFiles: number;
  useDocumentoHabilitante: number;
  useDossier: number;
  idStandardElements: number;
  required: number;
  required_signatures: boolean;
  total_people_required_to_sign: number;
  idStandardCondition: number;
}
interface DBQueryResult {
  rowCount?: number;
  data?: any[];
}

interface documentId {
  id: number;
}

export class CatalogServices {
  private readonly privilegedUserIds = [
    1, 2, 14, 47, 50, 51, 52, 66, 62, 9, 65, 59, 54,
  ];

  constructor() {}

  private async _canDelete(
    db: any,
    idUser: number,
    context: {
      idStandardElement?: number;
      idStandardAttribute?: number;
      idStandardAttributeOption?: number;
      idSynonym?: number;
    },
  ): Promise<boolean> {
    if (this.privilegedUserIds.includes(idUser)) {
      return true;
    }

    const getElementIdQuery = `
      SELECT id FROM public."StandardElements" WHERE id = $1
      UNION
      SELECT "idStandardElement" FROM public."StandardAttributes" WHERE id = $2
      UNION
      SELECT sa."idStandardElement" FROM public."StandardAttributeOptions" sao JOIN public."StandardAttributes" sa ON sao."idStandardAttribute" = sa.id WHERE sao.id = $3
      UNION
      SELECT "idStandardElements" FROM public."StandardElementsSynonyms" WHERE id = $4
    `;

    const elementIdResult = await db.query(getElementIdQuery, [
      context.idStandardElement || null,
      context.idStandardAttribute || null,
      context.idStandardAttributeOption || null,
      context.idSynonym || null,
    ]);

    if (elementIdResult.totalRows === 0) {
      return true;
    }
    const idStandardElement = elementIdResult.data[0].id;

    const checkForbiddenDependenciesQuery = `
      SELECT
        EXISTS (SELECT 1 FROM public."ElementRelease" WHERE "idStandardElements" = $1) AS has_release,
        EXISTS (SELECT 1 FROM public."WellHistoricalInfrastructureElements" WHERE "idStandardElements" = $1) AS has_historical,
        EXISTS (
          SELECT 1 FROM public."ElementDetail" ed
          JOIN public."StandardAttributeOptions" sao ON ed."idStandardAttributeOptions" = sao.id
          JOIN public."StandardAttributes" sa ON sao."idStandardAttribute" = sa.id
          WHERE sa."idStandardElement" = $1
        ) AS has_detail
    `;

    const checkResult = await db.query(checkForbiddenDependenciesQuery, [
      idStandardElement,
    ]);
    const forbidden = checkResult.data[0];

    return !(
      forbidden.has_release ||
      forbidden.has_historical ||
      forbidden.has_detail
    );
  }

  public getStandardBusinessLine = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT id, name 
        FROM public."StandardBusinessLines";
      `;

      const response = await db.query(query);
      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getStandardElements = async (
    searchTerm: string,
    selectedId: number | null = null,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');
      const businessLineId = selectedId || null;

      let query = `
      SELECT
        se.name,
        se.id,
        se.image,
        se."idStandardBusinessLines",
        arf.required_files,
        syn.synonyms, -- Columna con sinónimos agregados
        sao.value AS option_value,
        sao.id AS option_id,
        sao.option_verified,
        sa.id AS "idStandardAttribute",
        sa.name AS attribute_name,
        sa."idStandardAttributeTypes",
        sa."orderInDescription",
        sa.required,
        sa."alwaysShow",
        sa."measurementUnit",
        sa.verified AS attribute_verified,
        sa."useInGroupBy",
        sa."showRunBES"
      FROM public."StandardElements" se
      LEFT JOIN (
        SELECT
          serf."idStandardElements",
          STRING_AGG(serf.name || ' (' || serf."fileExtension" || ')', ', ' ORDER BY serf.name) AS required_files
        FROM public."StandardElementsRequiredFiles" serf
        GROUP BY serf."idStandardElements"
      ) arf ON arf."idStandardElements" = se.id
      LEFT JOIN (
          -- Subconsulta para agregar sinónimos y evitar duplicados
          SELECT
              ses."idStandardElements",
              STRING_AGG(ses.synonym, ', ') AS synonyms
          FROM public."StandardElementsSynonyms" ses
          GROUP BY ses."idStandardElements"
      ) syn ON syn."idStandardElements" = se.id
      LEFT JOIN public."StandardAttributes" sa
        ON sa."idStandardElement" = se.id
      LEFT JOIN LATERAL (
        SELECT
          sao_inner.id, sao_inner."idStandardAttribute", sao_inner.value, sao_inner.verified AS option_verified
        FROM public."StandardAttributeOptions" sao_inner
        WHERE sao_inner."idStandardAttribute" = sa.id
        UNION ALL
        SELECT NULL::INTEGER, sa.id, NULL::TEXT, NULL::BOOLEAN
        WHERE NOT EXISTS (
          SELECT 1 FROM public."StandardAttributeOptions" sao_check WHERE sao_check."idStandardAttribute" = sa.id
        )
      ) sao ON TRUE
      `;

      const values: (string | number)[] = [`%${searchTerm}%`];
      if (businessLineId !== null && businessLineId !== undefined) {
        query += `WHERE ((se.name ILIKE $1 OR syn.synonyms ILIKE $1) AND se."idStandardBusinessLines" = $2) ORDER BY se.name, sa."orderInDescription";`;
        values.push(businessLineId);
      } else {
        query += `WHERE (se.name ILIKE $1 OR syn.synonyms ILIKE $1) ORDER BY se.name, sa."orderInDescription";`;
      }

      const result = await db.query(query, values);

      await db.disconnect();
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getStandardWellSections = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
            id, 
            name
        FROM public."StandardWellSections";
      `;

      const response = await db.query(query);
      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getStandardWellInfrastructureType = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
            id, 
            name, 
            "description"
        FROM public."StandardWellInfrastructureType";
      `;

      const response = await db.query(query);
      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public addStandarElement = async (
    name: string,
    idStandardBusinessLines: number,
    idStandardWellSections: number,
    verified: boolean,
    idStandardWellInfrastructureType: number,
    showRunBES: boolean,
    needSerialNumber: boolean,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        INSERT INTO public."StandardElements"(
          name, 
          "idStandardBusinessLines", 
          "idStandardWellSections", 
          verified, 
          "idStandardWellInfrastructureType", 
          "showRunBES",
          "needSerialNumber"

        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name;
      `;

      const values = [
        name,
        idStandardBusinessLines,
        idStandardWellSections,
        verified ? 1 : 0, // boolean -> number
        idStandardWellInfrastructureType,
        showRunBES ? 1 : 0, // boolean -> number
        needSerialNumber ? 1 : 0,
      ];

      const result = await db.query(query, values);

      await db.disconnect();
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getStandardElementById = async (element: { id: number }) => {
    try {
      const db = createDatabase('POSTGRESQL');

      let query = `
        SELECT
          se.id,
          se.name,
          se."idStandardBusinessLines",
          sbl.name AS standard_business_line_name,
          se."idStandardWellSections",
          sws.name AS standard_well_section_name,
          se.verified,
          se."idStandardWellInfrastructureType",
          swit.name AS standard_well_infrastructure_type_name,
          swit.description AS standard_well_infrastructure_type_description,
          swit."showDiagram" AS standard_well_infrastructure_type_show_diagram,
          swit."groupByDiameter" AS standard_well_infrastructure_type_group_by_diameter,
          se."showRunBES",
          se."needSerialNumber"
      FROM
          public."StandardElements" AS se
      LEFT JOIN
          public."StandardBusinessLines" AS sbl
          ON se."idStandardBusinessLines" = sbl.id
      LEFT JOIN
          public."StandardWellSections" AS sws
          ON se."idStandardWellSections" = sws.id
      LEFT JOIN
          public."StandardWellInfrastructureType" AS swit
          ON se."idStandardWellInfrastructureType" = swit.id
      WHERE
          se.id = $1;
      `;

      const values = [element.id]; // Correctly assign the id from element to an array for the query

      const result = await db.query(query, values);

      return result;
      await db.disconnect();
    } catch (error: any) {
      console.error('Error fetching standard element:', error); // Log the error for debugging
      throw new Error(`Failed to retrieve standard element: ${error.message}`);
    }
  };

  public UpdateStandardElement = async (element: {
    id: number;
    name: string;
    idStandardBusinessLines: number;
    idStandardWellSections: number;
    verified: boolean;
    idStandardWellInfrastructureType: number;
    showRunBES: boolean;
    needSerialNumber: boolean;
  }) => {
    const db = createDatabase('POSTGRESQL');

    try {
      const query = `
          UPDATE public."StandardElements"
          SET
            name = $1,
            "idStandardBusinessLines" = $2,
            "idStandardWellSections" = $3,
            verified = $4,
            "idStandardWellInfrastructureType" = $5,
            "showRunBES" = $6,
            "needSerialNumber" = $7
          WHERE id = $8;
        `;

      const values = [
        element.name,
        element.idStandardBusinessLines,
        element.idStandardWellSections,
        element.verified ? 1 : 0,
        element.idStandardWellInfrastructureType,
        element.showRunBES ? 1 : 0,
        element.needSerialNumber ? 1 : 0,
        element.id,
      ];

      await db.query(query, values);
      await db.disconnect();
      return { message: 'Elemento estándar actualizado correctamente' };
    } catch (error: any) {
      await db.disconnect();
      throw new Error(error.message);
    }
  };

  public addOrUpdateStandardElementImage = async (
    idStandardElement: number,
    imageBase64: string,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');
      const query = `
        UPDATE public."StandardElements"
        SET image = DECODE($1, 'base64')
        WHERE id = $2;
      `;
      
      const values = [imageBase64, idStandardElement];
      await db.query(query, values);
      await db.disconnect();
      return { message: 'Imagen guardada correctamente.' };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public deleteStandardElementImage = async (idStandardElement: number) => {
    try {
      const db = createDatabase('POSTGRESQL');
      const query = `
        UPDATE public."StandardElements"
        SET image = NULL
        WHERE id = $1;
      `;
      
      const values = [idStandardElement];
      await db.query(query, values);
      await db.disconnect();
      return { message: 'Imagen eliminada correctamente.' };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getStandardAttributeTypes = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
            id, 
            type
        FROM public."StandardAttributeTypes";
      `;

      const response = await db.query(query);
      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public editStandardAttributes = async (
    attributes: {
      name: string;
      idStandardElement: number;
      orderInDescription: number;
    }[],
  ) => {
    const db = createDatabase('POSTGRESQL');

    try {
      for (const attr of attributes) {
        const query = `
                  UPDATE public."StandardAttributes"
                  SET "orderInDescription" = $3
                  WHERE name = $1 AND "idStandardElement" = $2;
              `;

        const values = [
          attr.name,
          attr.idStandardElement,
          attr.orderInDescription,
        ];

        await db.query(query, values); // Ejecutamos cada UPDATE
      }

      await db.disconnect();
      return { message: 'Actualización exitosa' };
    } catch (error: any) {
      await db.disconnect();
      throw new Error(error.message);
    }
  };

  public addStandarElementsSynonyms = async (
    idStandardElements: number,
    synonym: string,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        INSERT INTO public."StandardElementsSynonyms"(
          "idStandardElements", 
          "synonym"
        ) VALUES ($1, $2)
        RETURNING id, synonym;
      `;

      const values = [idStandardElements, synonym];

      const result = await db.query(query, values);

      await db.disconnect();
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public editStandarElementSynonym = async (id: number, synonym: string) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        UPDATE public."StandardElementsSynonyms"
        SET "synonym" = $1
        WHERE id = $2
        RETURNING id, "idStandardElements", synonym;
      `;

      const values = [synonym, id];

      const result = await db.query(query, values);

      if (result.totalRows === 0) {
        throw new Error(`Synonym with ID ${id} not found.`);
      }

      await db.disconnect();
      return result.data[0];
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public deleteStandarElementSynonym = async (id: number, idUser: number) => {
    const db = createDatabase('POSTGRESQL');
    try {
      const canDelete = await this._canDelete(db, idUser, { idSynonym: id });
      if (!canDelete) {
        throw new Error(
          'Permiso denegado. El elemento al que pertenece este sinónimo tiene dependencias críticas.',
        );
      }

      const query = `DELETE FROM public."StandardElementsSynonyms" WHERE id = $1 RETURNING id;`;
      const result = await db.query(query, [id]);
      if (result.totalRows === 0) {
        throw new Error(`Synonym with ID ${id} not found.`);
      }
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await db.disconnect();
    }
  };

  public getSynonymsByElementId = async (elementId: number) => {
    try {
      const db = createDatabase('POSTGRESQL');
      const query = `
        SELECT 
          id,
          "idStandardElements",
          synonym
        FROM public."StandardElementsSynonyms"
        WHERE "idStandardElements" = $1
        ORDER BY id;
      `;
      const values = [elementId];
      const result = await db.query(query, values);
      await db.disconnect();
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public deleteAttributeOption = async (
    idStandardAttributeOption: number,
    idUser: number,
  ) => {
    const db = createDatabase('POSTGRESQL');
    try {
      const canDelete = await this._canDelete(db, idUser, {
        idStandardAttributeOption,
      });
      if (!canDelete) {
        throw new Error(
          'Permiso denegado. El elemento al que pertenece esta opción tiene dependencias críticas.',
        );
      }

      const deleteDependenciesQuery = `DELETE FROM public."ElementDetail" WHERE "idStandardAttributeOptions" = $1;`;
      await db.query(deleteDependenciesQuery, [idStandardAttributeOption]);

      const deleteQuery = `DELETE FROM public."StandardAttributeOptions" WHERE id = $1;`;
      await db.query(deleteQuery, [idStandardAttributeOption]);

      return { message: 'Opción eliminada correctamente' };
    } catch (error: any) {
      throw new Error(`Error al eliminar la opción: ${error.message}`);
    } finally {
      await db.disconnect();
    }
  };

  public updateAttributeOption = async (
    idStandardAttribute: number,
    option: {
      option_id: number;
      option_value: string;
      option_verified: boolean;
    },
  ) => {
    const db = createDatabase('POSTGRESQL');

    try {
      db.query('BEGIN;');
      const res = await db.query(
        'SELECT * FROM public."StandardAttributeOptions" WHERE value = $1 AND "idStandardAttribute" = $2 AND id != $3',
        [option.option_value, idStandardAttribute, option.option_id],
      );

      if (res.data[0]) {
        return {
          message: 'Ya existe una opción con ese nombre.',
          status: 'warning',
        };
      } else {
        const query = `
          UPDATE public."StandardAttributeOptions"
          SET value = $1, verified = $2
          WHERE id = $3;
        `;

        const values = [
          option.option_value,
          option.option_verified ? 1 : 0,
          option.option_id,
        ];

        await db.query(query, values);

        await db.query('COMMIT');
        return {
          message: 'Opción actualizada correctamente',
          status: 'success',
        };
      }
    } catch (error: any) {
      await db.query('ROLLBACK');
      throw new Error(error.message);
    } finally {
      db.disconnect();
    }
  };

  public updateAttribute = async (
    idStandardElement: number,
    attribute: {
      id: number;
      name: string;
      idStandardAttributeTypes: number;
      required: boolean;
      alwaysShow: boolean;
      verified: boolean;
      useInGroupBy: boolean;
      measurementUnit: string;
      showRunBES: boolean;
    },
  ) => {
    const db = createDatabase('POSTGRESQL');

    try {
      db.query('BEGIN;');

      const res = await db.query(
        'SELECT * FROM "StandardAttributes" WHERE name ILIKE $1 AND "idStandardElement" = $2 AND id != $3',
        [attribute.name, idStandardElement, attribute.id],
      );
      if (res.data[0]) {
        return {
          message: 'Ya existe un atributo con ese nombre.',
          status: 'warning',
        };
      } else {
        const query = `
          UPDATE public."StandardAttributes"
          SET name = $1, "idStandardAttributeTypes" = $2, required = $3, "alwaysShow" = $4, verified = $5, "useInGroupBy" = $6, "measurementUnit" = $7, "showRunBES" = $8
          WHERE id = $9;
        `;

        const values = [
          attribute.name,
          attribute.idStandardAttributeTypes,
          attribute.required ? 1 : 0,
          attribute.alwaysShow ? 1 : 0,
          attribute.verified ? 1 : 0,
          attribute.useInGroupBy ? 1 : 0,
          attribute.measurementUnit,
          attribute.showRunBES ? 1 : 0,
          attribute.id,
        ];

        await db.query(query, values);
        await db.query('COMMIT');
        return {
          message: 'Atributo actualizado correctamente',
          status: 'success',
        };
      }
    } catch (error: any) {
      await db.query('ROLLBACK');
      throw new Error(error.message);
    } finally {
      db.disconnect();
    }
  };

  public deleteAttribute = async (
    idStandardElement: number,
    idStandardAttribute: number,
    attributeOrderInDescription: number,
    idUser: number,
  ) => {
    const db = createDatabase('POSTGRESQL');
    try {
      const canDelete = await this._canDelete(db, idUser, {
        idStandardAttribute,
      });
      if (!canDelete) {
        throw new Error(
          'Permiso denegado. El elemento al que pertenece este atributo tiene dependencias críticas.',
        );
      }

      const deleteDetailsQuery = `DELETE FROM public."ElementDetail" WHERE "idStandardAttributeOptions" IN (SELECT id FROM public."StandardAttributeOptions" WHERE "idStandardAttribute" = $1);`;
      await db.query(deleteDetailsQuery, [idStandardAttribute]);

      const deleteOptionsQuery = `DELETE FROM public."StandardAttributeOptions" WHERE "idStandardAttribute" = $1;`;
      await db.query(deleteOptionsQuery, [idStandardAttribute]);

      const deleteAttributeQuery = `DELETE FROM public."StandardAttributes" WHERE "id" = $1;`;
      await db.query(deleteAttributeQuery, [idStandardAttribute]);

      const updateOrderQuery = `UPDATE public."StandardAttributes" SET "orderInDescription" = "orderInDescription" - 1 WHERE "idStandardElement" = $1 AND "orderInDescription" > $2;`;
      await db.query(updateOrderQuery, [
        idStandardElement,
        attributeOrderInDescription,
      ]);

      return { message: 'Atributo eliminado correctamente' };
    } catch (error: any) {
      throw new Error(`Error al eliminar el atributo: ${error.message}`);
    } finally {
      await db.disconnect();
    }
  };

  public deleteStandardElement = async (
    idStandardElement: number,
    idUser: number,
  ) => {
    const db = createDatabase('POSTGRESQL');
    try {
      const canDelete = await this._canDelete(db, idUser, {
        idStandardElement,
      });
      if (!canDelete) {
        throw new Error(
          'Permiso denegado. El elemento tiene dependencias críticas (Releases, Históricos o Details) y no puede ser eliminado por este usuario.',
        );
      }

      await db.query('BEGIN');

      const deleteElementDetailQuery = `DELETE FROM public."ElementDetail" USING public."StandardAttributes", public."StandardAttributeOptions" WHERE "ElementDetail"."idStandardAttributeOptions" = "StandardAttributeOptions".id AND "StandardAttributeOptions"."idStandardAttribute" = "StandardAttributes".id AND "StandardAttributes"."idStandardElement" = $1`;
      await db.query(deleteElementDetailQuery, [idStandardElement]);
      const deleteFilesOfReleaseQuery = `DELETE FROM public."FilesOfElementsRelease" WHERE "idElementRelease" IN (SELECT id FROM public."ElementRelease" WHERE "idStandardElements" = $1)`;
      await db.query(deleteFilesOfReleaseQuery, [idStandardElement]);
      const deleteTallyQuery = `DELETE FROM public."ElementTally" WHERE "element_id" IN (SELECT id FROM public."ElementRelease" WHERE "idStandardElements" = $1)`;
      await db.query(deleteTallyQuery, [idStandardElement]);
      const deleteElementReleaseQuery = `DELETE FROM public."ElementRelease" WHERE "idStandardElements" = $1`;
      await db.query(deleteElementReleaseQuery, [idStandardElement]);
      const deleteWellHistoricalQuery = `DELETE FROM public."WellHistoricalInfrastructureElements" WHERE "idStandardElements" = $1`;
      await db.query(deleteWellHistoricalQuery, [idStandardElement]);

      const deleteSynonymsQuery = `DELETE FROM public."StandardElementsSynonyms" WHERE "idStandardElements" = $1`;
      await db.query(deleteSynonymsQuery, [idStandardElement]);
      const deleteRequiredFilesQuery = `DELETE FROM public."StandardElementsRequiredFiles" WHERE "idStandardElements" = $1`;
      await db.query(deleteRequiredFilesQuery, [idStandardElement]);
      const deleteOptionsQuery = `DELETE FROM public."StandardAttributeOptions" WHERE "idStandardAttribute" IN (SELECT id FROM public."StandardAttributes" WHERE "idStandardElement" = $1)`;
      await db.query(deleteOptionsQuery, [idStandardElement]);
      const deleteAttributesQuery = `DELETE FROM public."StandardAttributes" WHERE "idStandardElement" = $1`;
      await db.query(deleteAttributesQuery, [idStandardElement]);
      const deleteElementQuery = `DELETE FROM public."StandardElements" WHERE id = $1`;
      await db.query(deleteElementQuery, [idStandardElement]);

      await db.query('COMMIT');
      return {
        message:
          'Elemento estándar y todos sus datos relacionados fueron eliminados correctamente',
      };
    } catch (error: any) {
      await db
        .query('ROLLBACK')
        .catch(rollbackError =>
          console.error('Error al ejecutar ROLLBACK:', rollbackError),
        );
      throw new Error(error.message);
    } finally {
      await db.disconnect();
    }
  };

  async updateExtensionDocuments(
    reqs: updateExtensionDocuments[],
  ): Promise<{ message: string; updatedCount: number }> {
    if (!reqs || reqs.length === 0) {
      return {
        message: 'No se encontraron documentos para actualizar.',
        updatedCount: 0,
      };
    }

    const db = createDatabase('POSTGRESQL');
    let updatedCount = 0;

    try {
      await db.query('BEGIN;');

      for (const req of reqs) {
        if (req.id === undefined || req.id === null) {
          console.warn(
            'Pasar actualizacion asociacada al documento con id:',
            req.id,
          );
          continue;
        }

        const updateQuery = `
          UPDATE public."StandardElementsRequiredFiles"
          SET 
            name = $1, 
            "fileExtension" = $2, 
            "multipleFiles" = $3, 
            "useDocumentoHabilitante" = $4, 
            "useDossier" = $5, 
            "idStandardElements" = $6, 
            required = $7,
            required_signatures = $8, 
            total_people_required_to_sign = $9,
            "idStandardCondition" = $10
          WHERE id = $11;
        `;

        const params = [
          req.name,
          req.fileExtension,
          req.multipleFiles,
          req.useDocumentoHabilitante,
          req.useDossier,
          req.idStandardElements,
          req.required,
          req.required_signatures ? 1 : 0,
          req.total_people_required_to_sign,
          req.idStandardCondition,
          req.id,
        ];

        const res: DBQueryResult = await db.query(updateQuery, params);

        if (res.rowCount && res.rowCount > 0) {
          updatedCount++;
        } else if (res.rowCount === 0) {
          console.warn(
            `Ningun documento encontrado con el ID ${req.id} para actualizar, o el ID no es válido.`,
          );
        }
      }

      await db.query('COMMIT;');

      if (updatedCount === 0 && reqs.length > 0) {
        //return { message: 'Ningun documento fue actualizado.', updatedCount };
      }
      return { message: `Actualización exitosa.`, updatedCount };
    } catch (error: any) {
      await db.query('ROLLBACK;');
      console.error('Error updating documents:', error);
      throw new Error(`Failed to update documents: ${error.message}`);
    } finally {
      db.disconnect();
    }
  }

  async deleteExtensionDocuments(
    documentsToDelete: documentId[],
    idUser: number,
  ): Promise<{ message: string; deletedCount: number }> {
    if (!documentsToDelete || documentsToDelete.length === 0) {
      return {
        message: 'No se proporcionaron IDs de documentos para eliminar.',
        deletedCount: 0,
      };
    }

    const db = createDatabase('POSTGRESQL');
    const documentsThatCanBeDeleted: number[] = [];

    try {
      for (const doc of documentsToDelete) {
        if (doc.id === undefined || doc.id === null) continue;

        const parentElementQuery = `SELECT "idStandardElements" FROM public."StandardElementsRequiredFiles" WHERE id = $1`;
        const parentResult = await db.query(parentElementQuery, [doc.id]);

        if (parentResult.totalRows > 0) {
          const idStandardElement = parentResult.data[0].idStandardElements;
          const canDelete = await this._canDelete(db, idUser, {
            idStandardElement,
          });
          if (canDelete) {
            documentsThatCanBeDeleted.push(doc.id);
          }
        }
      }

      if (documentsThatCanBeDeleted.length === 0) {
        return {
          message:
            'No se eliminó ningún documento debido a falta de permisos o dependencias críticas.',
          deletedCount: 0,
        };
      }

      await db.query('BEGIN;');

      const placeholders = documentsThatCanBeDeleted
        .map((_, index) => `$${index + 1}`)
        .join(', ');

      const deleteDependenciesQuery = `
              DELETE FROM public."FilesOfElementsRelease"
              WHERE "idStandardElementsRequiredFiles" IN (${placeholders});
          `;
      await db.query(deleteDependenciesQuery, documentsThatCanBeDeleted);

      const deleteDocumentsQuery = `
              DELETE FROM public."StandardElementsRequiredFiles"
              WHERE id IN (${placeholders});
          `;
      const res = await db.query(
        deleteDocumentsQuery,
        documentsThatCanBeDeleted,
      );

      const deletedCount = res.totalRows || 0;

      await db.query('COMMIT;');
      return {
        message: `Eliminación exitosa. Se eliminaron ${deletedCount} documentos.`,
        deletedCount,
      };
    } catch (error: any) {
      await db.query('ROLLBACK;');
      console.error('Error eliminando documentos:', error);
      throw new Error(`Falló la eliminación de documentos: ${error.message}`);
    } finally {
      db.disconnect();
    }
  }
}

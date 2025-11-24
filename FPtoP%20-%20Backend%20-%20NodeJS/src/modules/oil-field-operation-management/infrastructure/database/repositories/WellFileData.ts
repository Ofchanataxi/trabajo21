import { log } from 'handlebars';
import { createDatabase } from '../../../../../shared/infrastructure/Database/DatabaseFactory';
import { WellDataFromFileRepository } from '../../../domain/repositories/WellDataFromFileRepository';
export interface WellFromFile {
  elemenRelease: ElemenRelease[];
  release: Release;
}

export interface ElemenRelease {
  idElement: number;
  descriptionWithOutNameElement: string[];
  description: string;
  condition: string;
  quantity: number;
  serial: string;
  heat: string;
  oitInspection: string;
  oitReparation: string;
  observation: string;
  attributeParts: AttributePart[];
}

export interface AttributePart {
  idAttribute: number;
  nameAttribute: NameAttribute;
  idOptionAttribute: number;
  nameOption: ElementToSearch;
  elementToSearch: ElementToSearch;
}

export enum ElementToSearch {
  L80Cr1 = 'l-80 cr1',
  Psl2 = 'psl2',
  The312 = '3-1/2"',
  The92Ppf = '9.2ppf',
  TshBlue = 'tsh blue',
}

export enum NameAttribute {
  Conexiones = 'Conexiones',
  Diámetro = 'Diámetro',
  Grado = 'Grado',
  NivelDeEspecificación = 'Nivel de especificación',
  Peso = 'Peso',
}

export interface Release {
  releaseID: string;
  wellName: string;
}

interface NewElement {
  newElementName: string;
  idStandardAttribute: number;
  verified: number;
}

interface NewAttribute {
  newAttributeName: string;
  idStandardAttributeTypes: number;
  required: number;
  orderInDescription: number;
  idStandardElement: number;
  alwaysShow: number;
  onlyShowWith_idStandardAttributes: number;
  onlyShowWith_idStandardAttributeOptions: number;
  verified: number;
  idDefaultStandardAttributeOptions: number;
  useInGroupBy: number;
  newMeasurementUnit: string;
  showRunBES: number;
}

interface newStandardElementError {
  name: string;
  idStandardBusinessLines: number;
  idStandardWellSections: number;
  verified: number;
  idStandardWellInfrastructureType: number;
}
interface newErrorExtensionDocuments {
  name: string;
  fileExtension: string;
  multipleFiles: number;
  useDocumentoHabilitante: number;
  useDossier: number;
  idStandardElements: number;
  required: number;
  idStandardCondition: number;
}

interface ExtensionDocuments {
  idStandardElement: number;
  condition: number;
}

function convertTextToNumbers(obj: any): any {
  if (typeof obj === 'string' && !isNaN(Number(obj))) {
    return Number(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Si la propiedad se llama 'serial', no la convertimos
        if (key === 'serial') {
          continue;
        }
        obj[key] = convertTextToNumbers(obj[key]);
      }
    }
  }
  return obj;
}

const clearCharacters = (value: string) => {
  // Eliminar espacios al inicio y al final con trim()
  let tempValue = value.trim();

  // Reemplazar múltiples espacios internos con un solo espacio
  tempValue = tempValue.replace(/\s+/g, ' ');
  return tempValue;
};

const trimCondition = (array: any) => {
  const tempArray = [];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    // Eliminamos la propiedad 'condition'
    const { condition, ...rest } = element;

    // Modificamos el valor de 'condition' si es necesario
    const newCondition = clearCharacters(condition);

    // Agregamos el objeto al nuevo array, incluyendo el 'condition' modificado
    tempArray.push({
      ...rest,
      condition: newCondition, // Añadimos la condición nuevamente modificada
    });
  }
  return tempArray;
};

export class WellFileData implements WellDataFromFileRepository {
  constructor() {}
  async PostUploadWellDataFromFile(reqElement: WellFromFile): Promise<any> {
    let convertedJson;
    try {
      // console.log('Voy a realizar PostUploadWellDataFromFile');
      // console.log(reqElement);
      convertedJson = convertTextToNumbers(reqElement);
      // console.log('Voy a realizar convertedJson');
      // console.log(convertedJson);
      convertedJson.elemenRelease = trimCondition(convertedJson.elemenRelease);
      // console.log('convertedJson');
      // console.log(convertedJson);
    } catch (error: any) {
      console.log('Error');
      console.log(error.message);
      throw new Error(error.message);
    }

    const db = createDatabase('POSTGRESQL');

    try {
      await db.query('BEGIN TRANSACTION;');
      // Conversion de text numb a tipo number, exepto en SERIAL
      //console.log(convertedJson)
      await db.query(
        `
					SELECT insert_elements_of_release($1,  $2);
					`,
        [
          convertedJson.release.releaseID,
          JSON.stringify(convertedJson.elemenRelease),
        ],
      );
      await db.query('COMMIT');
      return 'Transacción completada correctamente.';
    } catch (error: any) {
      await db.query('ROLLBACK');
      throw new Error(error.message);
    } finally {
      db.disconnect(); // Cerrar la conexión
    }
  }

  async PostNewAttributeElement(req: NewElement): Promise<any> {
    const db = createDatabase('POSTGRESQL');

    try {
      db.query('BEGIN;');

      const res = await db.query(
        'SELECT * FROM "StandardAttributeOptions" WHERE value ILIKE $1 AND "idStandardAttribute" = $2',
        [req.newElementName, req.idStandardAttribute],
      );
      if (res.data[0]) {
        return { message: 'Ya existe el elemento' };
      } else {
        const insertRes = await db.query(
          'INSERT INTO "StandardAttributeOptions" ( value, "idStandardAttribute",verified) VALUES ($1, $2, $3)',
          [req.newElementName, req.idStandardAttribute, req.verified],
        );
        await db.query('COMMIT');
        return { message: 'Elemento agregado correctamente' };
      }
    } catch (error: any) {
      await db.query('ROLLBACK');
      throw new Error(error.message);
    } finally {
      db.disconnect();
    }
  }

  async PostNewAttributeList(req: NewAttribute): Promise<any> {
    const db = createDatabase('POSTGRESQL');

    try {
      db.query('BEGIN;');

      const res = await db.query(
        'SELECT * FROM "StandardAttributes" WHERE name ILIKE $1 AND "idStandardElement" = $2',
        [req.newAttributeName, req.idStandardElement],
      );
      if (res.data[0]) {
        return { message: 'Ya existe el elemento' };
      } else {
        const insertRes = await db.query(
          `
            INSERT INTO "StandardAttributes" 
            ("name","idStandardAttributeTypes", "required", "orderInDescription", "idStandardElement", "alwaysShow", "onlyShowWith_idStandardAttributes", "onlyShowWith_idStandardAttributeOptions", verified, "idDefaultStandardAttributeOptions", "useInGroupBy", "measurementUnit", "showRunBES")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `,
          [
            req.newAttributeName,
            req.idStandardAttributeTypes,
            req.required,
            req.orderInDescription,
            req.idStandardElement,
            req.alwaysShow,
            req.onlyShowWith_idStandardAttributes,
            req.onlyShowWith_idStandardAttributeOptions,
            req.verified,
            req.idDefaultStandardAttributeOptions,
            req.useInGroupBy,
            req.newMeasurementUnit,
            req.showRunBES,
          ],
        );
        await db.query('COMMIT');
        return { message: 'Elemento agregado correctamente' };
      }
    } catch (error: any) {
      await db.query('ROLLBACK');
      throw new Error(error.message);
    } finally {
      db.disconnect();
    }
  }

  async PostNewStandardElementError(
    req: newStandardElementError,
  ): Promise<any> {
    const db = createDatabase('POSTGRESQL');

    try {
      db.query('BEGIN;');

      const res = await db.query(
        'SELECT * FROM "StandardElements" WHERE name ILIKE $1',
        [req.name],
      );
      if (res.data[0]) {
        return { message: 'Ya existe el elemento' };
      } else {
        const insertRes = await db.query(
          `
            INSERT INTO "StandardElements" 
            (name, "idStandardBusinessLines", "idStandardWellSections", verified, "idStandardWellInfrastructureType") 
            VALUES ($1, $2, $3, $4, $5)
          `,
          [
            req.name,
            req.idStandardBusinessLines,
            req.idStandardWellSections,
            req.verified,
            req.idStandardWellInfrastructureType,
          ],
        );
        await db.query('COMMIT');
        return { message: 'Elemento agregado correctamente' };
      }
    } catch (error: any) {
      await db.query('ROLLBACK');
      throw new Error(error.message);
    } finally {
      db.disconnect();
    }
  }

  async PostNewErrorExtensionDocuments(
    req: newErrorExtensionDocuments,
  ): Promise<any> {
    const db = createDatabase('POSTGRESQL');
    // console.log('req', req);

    try {
      db.query('BEGIN;');

      const res = await db.query(
        `SELECT * FROM "StandardElementsRequiredFiles" 
        WHERE name ILIKE $1 
        AND "fileExtension" = $2
        AND "multipleFiles" = $3
        AND "useDocumentoHabilitante" = $4
        AND "useDossier" = $5
        AND "idStandardElements" = $6 `,
        [
          req.name,
          req.fileExtension,
          req.multipleFiles,
          req.useDocumentoHabilitante,
          req.useDossier,
          req.idStandardElements,
        ],
      );
      if (res.data[0]) {
        return { message: 'Ya existe el elemento' };
      } else {
        const insertRes = await db.query(
          `
            INSERT INTO "StandardElementsRequiredFiles"
            (name, "fileExtension", "multipleFiles", "useDocumentoHabilitante", "useDossier", "idStandardElements", "required", "idStandardCondition")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            req.name,
            req.fileExtension,
            req.multipleFiles,
            req.useDocumentoHabilitante,
            req.useDossier,
            req.idStandardElements,
            req.required,
            req.idStandardCondition,
          ],
        );
        await db.query('COMMIT');
        return { message: 'Elemento agregado correctamente' };
      }
    } catch (error: any) {
      await db.query('ROLLBACK');
      throw new Error(error.message);
    } finally {
      db.disconnect();
    }
  }

  async GetRequieredExtensionDocuments(req: {
    idStandardElements: number;
  }): Promise<any> {
    const db = createDatabase('POSTGRESQL');

    try {
      await db.query('BEGIN;');

      const query = `
        SELECT *
        FROM "StandardElementsRequiredFiles"
        WHERE "idStandardElements" = $1;
      `;
      const res = await db.query(query, [req.idStandardElements]);
      await db.query('COMMIT;');
      return { message: 'Consulta realizada correctamente', data: res.data };
    } catch (error: any) {
      await db.query('ROLLBACK;');
      throw new Error(error.message);
    } finally {
      db.disconnect();
    }
  }
}

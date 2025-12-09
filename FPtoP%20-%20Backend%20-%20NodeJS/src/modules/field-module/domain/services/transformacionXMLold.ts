/* eslint-disable prefer-const */
import * as fs from 'fs';
import { parseStringPromise } from 'xml2js';
import { parseISO } from 'date-fns';
import { VerifyDescriptionService } from '../../../description-standardization/services/verifyDescription';
import pLimit from 'p-limit';

//const filePath = 'test';

async function xmlToJson(filePath: string): Promise<any> {
  try {
    // Lee el archivo XML

    const xmlData = fs.readFileSync(filePath, 'utf-8');

    // Convierte el XML a JSON
    const result = await parseStringPromise(xmlData);

    return result;
  } catch (error) {
    console.error('Error converting XML to JSON:', error);
    throw error;
  }
}

interface DynamicObject {
  [key: string]: any;
}

function addProperty(obj: DynamicObject, key: string, value: any): void {
  obj[key] = value;
}

function roundToTwoDecimals(numStr: string): string {
  // Convertir la cadena a un número
  let num = parseFloat(numStr);

  // Redondear el número a 2 decimales
  num = Math.round(num * 100) / 100;

  // Convertir el número de vuelta a una cadena con 2 decimales
  return num.toFixed(2);
}

function transformarDeStringANumero(string: string): number | null {
  if (string !== undefined) {
    // Convertir el string a un número decimal
    let num = parseFloat(string);

    // Verificar si la conversión fue exitosa
    if (isNaN(num)) {
      //console.log(`Error con ${num}`);
      return null;
    }

    // Redondear el número a dos decimales
    return Math.floor(num * 100) / 100;
  } else {
    return null;
  }
}

export function parseResponse(totalObject: any) {
  console.log('Recibo');

  console.dir(totalObject, { depth: null });
  console.log(totalObject);
  if (totalObject.length === 0) {
    return {}; // TODO: FALTA DEFINIR COMO SE MANEJA CUANDO NO ENCUENTRA
  }

  //Siempre uso el de mayor coincidencia, en este caso seria el primer elemento
  let objToTransform = totalObject[0];

  let tempObj: any = {};
  tempObj.idElement = objToTransform.idElement;
  tempObj.elementName = objToTransform.elementName;
  tempObj.idStandardBusinessLines = objToTransform.idStandardBusinessLines;
  tempObj.idCondition = objToTransform.idCondition;
  tempObj.condition = objToTransform.condition;

  //Atributos encontrados
  let arrAttributesOnlyMapped = objToTransform.arrAttributePartsOnlyMapped;
  console.log('arrAttributesOnlyMapped');
  console.log(arrAttributesOnlyMapped);
  for (let index = 0; index < arrAttributesOnlyMapped.length; index++) {
    const element = arrAttributesOnlyMapped[index];
    console.log('element');
    console.log(element);

    tempObj[`Attributes_${element.idAttribute}_${element.idOptionAttribute}`] =
      element.nameOption;
  }

  //Atributos no encontrados
  let arrAttributesOnlyNotMapped = objToTransform.attributePartsNotMapped;
  console.log('arrAttributesOnlyNotMapped');
  console.log(arrAttributesOnlyNotMapped);
  for (let index = 0; index < arrAttributesOnlyNotMapped.length; index++) {
    const element = arrAttributesOnlyNotMapped[index];
    console.log('element');
    console.log(element);

    tempObj[`Attributes_undefined_${index + 1}`] = element.partToSearch;
  }

  return tempObj;
}

export async function conversion(
  json: any,
  nombreArchivo: string,
): Promise<DynamicObject> {
  // 1) Intentamos extraer la sección principal; si esto falla, lanzamos un error genérico
  let jsonAux: any;
  let jsonAuxMetada: any;
  try {
    jsonAux = json.report?.data?.[0];
    jsonAuxMetada = json.report?.metadata?.[0];
    if (!jsonAux || !jsonAuxMetada) {
      throw new Error(); // para que entre en el catch
    }
  } catch (error) {
    throw new Error('Formato no válido para el archivo ' + nombreArchivo);
  }

  /**
   * 2) Construcción de myObject, asignando con encadenamiento opcional y valores por defecto.
   */
  const myObject: DynamicObject = {};

  // --- ENCABEZADO ---
  myObject.encabezado = {};
  myObject.encabezado.equipo =
    jsonAux.DM_REPORT_JOURNAL?.[0]?.$.rig_operation_name ?? '';
  myObject.encabezado.sistema = jsonAux.DM_EVENT?.[0]?.$.event_team ?? '';
  myObject.encabezado.elaboradoPor =
    jsonAux.DM_EVENT_APPROVAL?.[0]?.$.company ?? '';
  myObject.encabezado.revisadoPor =
    jsonAux.DM_EVENT_APPROVAL?.[0]?.$.department ?? '';
  myObject.encabezado.aprobadoPor =
    jsonAux.DM_EVENT_APPROVAL?.[0]?.$.approved_by ?? '';
  myObject.encabezado.fecha =
    jsonAux.DM_EVENT_APPROVAL?.[0]?.$.date_ops_end ?? '';
  myObject.encabezado.campo = 'AUCA';
  myObject.encabezado.locacion =
    jsonAux.CD_WELLBORE?.[0]?.$.wellbore_label
      ?.split('-')?.[0]
      ?.replace(/[^a-zA-Z\s]/g, '') ?? '';
  myObject.encabezado.pozo = jsonAux.CD_WELLBORE?.[0]?.$.well_legal_name ?? '';
  myObject.encabezado.wellbore_label =
    jsonAux.CD_WELLBORE?.[0]?.$.wellbore_label ?? '';

  // --- DATUM ---
  myObject.datum = {};
  // elevationGL: buscamos "ORIGINAL KB". Si algo falla, cae a undefined y luego a ''.
  myObject.datum.elevationGL = (() => {
    const encontrado = jsonAux.CD_DATUM?.find(
      (item: any) => item?.$?.datum_name === 'ORIGINAL KB',
    );
    const raw = encontrado?.$?.datum_elevation ?? '';
    const converted = transformarDeStringANumero(raw);
    return converted ?? '';
  })();

  // originalKB: buscamos "GROUND LEVEL". Misma lógica de protección.
  myObject.datum.originalKB = (() => {
    const encontrado = jsonAux.CD_DATUM?.find(
      (item: any) => item?.$?.datum_name === 'GROUND LEVEL',
    );
    const raw = encontrado?.$?.datum_elevation ?? '';
    const converted = transformarDeStringANumero(raw);
    return converted ?? '';
  })();

  // mr: si no existe CD_WELL o well_desc, asignamos ''.
  myObject.datum.mr =
    transformarDeStringANumero(jsonAux.CD_WELL?.[0]?.$.well_desc) ?? '';

  // --- SURVEY ---
  myObject.survey = {};
  myObject.survey.tipo = jsonAux.CD_WELLBORE?.[0]?.$.reason ?? '';
  myObject.survey.maxAngDesvAndMaxDLS =
    jsonAux.CD_WELLBORE?.[0]?.$.geo_offset_reference_bh ?? '';

  // --- PROFUNDIDAD ---
  myObject.profundidad = {};
  myObject.profundidad.md =
    transformarDeStringANumero(jsonAux.CD_WELLBORE?.[0]?.$.bh_md) ?? '';
  myObject.profundidad.tvd =
    transformarDeStringANumero(jsonAux.CD_WELLBORE?.[0]?.$.bh_tvd) ?? '';

  // --- ENSAMBLES INICIAL (vacío) ---
  myObject.ensambles = {};

  // --- ARENAS: CD_OPENING_STATUS
  myObject.aperturas = {};
  const aperturas = jsonAux.CD_OPENING_STATUS ?? [];
  for (let i = 0; i < aperturas.length; i++) {
    const element = aperturas[i]?.$ ?? {};
    const obj = {
      wellbore_id: element.wellbore_id ?? '',
      status: element.status ?? '',
      wellbore_opening_id: element.wellbore_opening_id ?? '',
      effective_date: element.effective_date ?? '',
      wellbore: [] as any[],
    };
    // addProperty crea la clave si no existe
    addProperty(myObject.aperturas, element.wellbore_opening_id, obj);
  }

  // --- ARENAS: CD_WELLBORE_OPENING
  const welbore = jsonAux.CD_WELLBORE_OPENING ?? [];
  for (let i = 0; i < welbore.length; i++) {
    const element = welbore[i]?.$ ?? {};
    const obj = {
      wellbore_zone: element.wellbore_zone ?? null,
      md_top: transformarDeStringANumero(element.md_top) || null,
      md_base: transformarDeStringANumero(element.md_base) || null,
      disparos: [] as any[],
    };
    // Si no existe esa apertura, saltamos
    const arregloAux =
      myObject.aperturas[element.wellbore_opening_id]?.wellbore;
    if (Array.isArray(arregloAux)) {
      arregloAux.push(obj);
    }
  }

  // --- ARENAS: CD_PERF_INTERVAL (disparos) ---
  const disparos = jsonAux.CD_PERF_INTERVAL ?? [];
  for (let i = 0; i < disparos.length; i++) {
    const element = disparos[i]?.$ ?? {};
    const mdArriba = transformarDeStringANumero(element.md_top_shot);
    const mdAbajo = transformarDeStringANumero(element.md_bottom_shot);

    // Recorremos todas las aperturas y sus wellbore
    for (const key in myObject.aperturas) {
      if (!Object.prototype.hasOwnProperty.call(myObject.aperturas, key)) {
        continue;
      }
      const wellboreOpening = myObject.aperturas[key];
      const arenasEncontradas = wellboreOpening.wellbore;
      for (let j = 0; j < arenasEncontradas.length; j++) {
        const elementArenas = arenasEncontradas[j];
        const arenaMdArriba = transformarDeStringANumero(elementArenas.md_top);
        const arenaMdAbajo = transformarDeStringANumero(elementArenas.md_base);

        if (
          mdArriba !== null &&
          arenaMdArriba !== null &&
          arenaMdAbajo !== null &&
          mdAbajo !== null &&
          mdArriba >= arenaMdArriba &&
          mdArriba <= arenaMdAbajo &&
          mdAbajo >= arenaMdArriba &&
          mdAbajo <= arenaMdAbajo
        ) {
          const obj = {
            top_shot_bottom_shot_interval:
              parseInt(element.top_shot_bottom_shot_interval ?? '') || null,
            shot_density: parseInt(element.shot_density ?? '') || null,
            md_top_shot: mdArriba,
            md_bottom_shot: mdAbajo,
          };
          elementArenas.disparos.push(obj);
        }
      }
    }
  }

  // --- CABEZAL ---
  const cabezal = jsonAux.CD_WELLHEAD?.[0]?.$ ?? {};
  myObject.cabezal = {};
  myObject.cabezal.cabezal = {
    wellhead_model: cabezal.wellhead_model ?? '',
    wellhead_name: cabezal.wellhead_name ?? '',
    wellhead_make: cabezal.wellhead_make ?? '',
    working_pressure: cabezal.working_pressure ?? '',
  };

  // --- ENSAMBLES (CD_ASSEMBLY) ---
  const ensambles = jsonAux.CD_ASSEMBLY ?? [];
  for (let i = 0; i < ensambles.length; i++) {
    const element = ensambles[i]?.$ ?? {};
    const obj = {
      assembly_size: element.assembly_size ?? null,
      assembly_name: element.assembly_name ?? null,
      md_assembly_base:
        transformarDeStringANumero(element.md_assembly_base) || null,
      string_class: element.string_class ?? null,
      componentes: [] as any[],
      notas: [] as string[],
      casing: [] as any[],
    };
    addProperty(myObject.ensambles, element.assembly_id, obj);
  }

  // --- ENSAMBLES: notas (CD_ASSEMBLY_NOTE) ---
  const notas = jsonAux.CD_ASSEMBLY_NOTE ?? [];
  for (let i = 0; i < notas.length; i++) {
    const element = notas[i]?.$ ?? {};
    const arregloAux = myObject.ensambles[element.assembly_id]?.notas;
    if (arregloAux && typeof element.notes === 'string') {
      arregloAux.push(element.notes);
    }
  }

  // --- ENSAMBLES: status (CD_ASSEMBLY_STATUS) ---
  const status = jsonAux.CD_ASSEMBLY_STATUS ?? [];
  for (let i = 0; i < status.length; i++) {
    const element = status[i]?.$ ?? {};
    const ensambleObj = myObject.ensambles[element.assembly_id];
    if (ensambleObj) {
      addProperty(ensambleObj, 'status', element.status ?? '');
      addProperty(ensambleObj, 'fecha', element.date_status ?? '');
    }
  }

  // --- ENSAMBLES: casing (DM_CASING) ---
  const casingArr = jsonAux.DM_CASING ?? [];
  for (let i = 0; i < casingArr.length; i++) {
    const element = casingArr[i]?.$ ?? {};
    const obj = {
      packoff_model: element.packoff_model ?? null,
      assembly_comp_id: element.assembly_comp_id ?? null,
    };
    const arregloAux = myObject.ensambles[element.assembly_id]?.casing;
    if (Array.isArray(arregloAux)) {
      arregloAux.push(obj);
    }
  }

  // --- COMPONENTES (CD_ASSEMBLY_COMP) con llamadas asíncronas---
  const verifyDescriptionService = new VerifyDescriptionService();
  const componentesArr = jsonAux.CD_ASSEMBLY_COMP ?? [];

  /// CONEXIONES SIMULTANEAS DISPONIBLES PARA UN WO PUEDEN SER 200 elementos con 20 al mismo tiempo deberia hacer 10 ciclos cada ciclo toma unos 5 segundos
  const envValue = process.env.CONCURRENCY_LIMIT;
  const parsed = envValue ? parseInt(envValue, 10) : NaN;
  const concurrency = Number.isInteger(parsed) && parsed > 0 ? parsed : 20;

  const limit = pLimit(concurrency);

  // Recolectamos las promesas en paralelo y luego procesamos resultados.
  const tareasComponentes = componentesArr.map(async (comp: any) =>
    limit(async () => {
      const element = comp?.$ ?? {};
      try {
        const rawMapping =
          await verifyDescriptionService.obtainAttributesFromStringInAllBusinessLines(
            element.catalog_key_desc ?? '',
          );
        return {
          ok: true,
          assemblyId: element.assembly_id,
          componenteObj: {
            joints: parseInt(element.joints ?? '') || null,
            catalog_key_desc: element.catalog_key_desc ?? null,
            attributesMapping: parseResponse(rawMapping),
            md_top: transformarDeStringANumero(element.md_top) || null,
            md_base: transformarDeStringANumero(element.md_base) || null,
            comp_name: element.comp_name ?? null,
            od_body: parseInt(element.od_body ?? '') || null,
            length: transformarDeStringANumero(element.length) || null,
            approximate_weight:
              parseInt(element.approximate_weight ?? '') || null,
            assembly_comp_id: element.assembly_comp_id ?? null,
          },
        };
      } catch (err: any) {
        return {
          ok: false,
          assemblyId: element.assembly_id,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  const resultadosComponentes = await Promise.all(tareasComponentes);
  for (const r of resultadosComponentes) {
    if (r.ok) {
      const arregloAux = myObject.ensambles[r.assemblyId]?.componentes;
      if (Array.isArray(arregloAux)) {
        arregloAux.push(r.componenteObj);
      }
    } else {
      console.error(
        `Error procesando componente en assembly ${r.assemblyId}:`,
        r.error,
      );
      // Si quieres, podrías agregar un array de errores dentro de cada ensamble para reportarlos.
    }
  }

  // --- AGRUPAR y ORDENAR ENSAMBLES (si estas funciones existen) ---
  const ensamblesAgrupados = groupAndSortEnsamble(myObject.ensambles);
  myObject.ensambles = agregarTiposEncontrados(ensamblesAgrupados);

  // --- ESCRIBIR JSONs EN DISCO (solo para debug/output) ---
  try {
    let jsonOutputPath = nombreArchivo;
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonAux, null, 2));
    // console.log(`jsonAux saved to ${jsonOutputPath}`);

    jsonOutputPath = nombreArchivo;
    fs.writeFileSync(jsonOutputPath, JSON.stringify(myObject, null, 2));
    // console.log(`myObject saved to ${jsonOutputPath}`);
  } catch (fsError) {
    console.error('Error escribiendo archivos JSON:', fsError);
    // No detenemos el retorno de myObject, solo informamos el fallo en disco
  }

  return myObject;
}

interface Ensamble {
  assembly_size: string | null;
  assembly_name: string;
  md_assembly_base: number | null;
  string_class: string | null;
  componentes: any[];
  notas: any[];
  casing: any[];
  status?: string;
  fecha?: string;
}

interface EnsambleMap {
  [key: string]: Ensamble[];
}

// Función para agrupar y ordenar los ensambles
function groupAndSortEnsamble(ensambles: {
  [key: string]: Ensamble;
}): EnsambleMap {
  const ensambleArray: Ensamble[] = Object.values(ensambles);
  const grouped: EnsambleMap = ensambleArray.reduce((acc, ensamble) => {
    const groupName = ensamble.assembly_name;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(ensamble);
    return acc;
  }, {} as EnsambleMap);

  // Ordenamos cada grupo por fecha de forma descendente
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      const fecha1 = b.fecha ? parseISO(b.fecha).getTime() : 0; // Usar 0 para 'fecha' no definida
      const fecha2 = a.fecha ? parseISO(a.fecha).getTime() : 0;
      return fecha1 - fecha2;
    });
  });
  return grouped;
}

function agregarTiposEncontrados(ensamblesAgrupados: {
  [key: string]: Ensamble[];
}): any {
  const tiposEncontrados = Object.keys(ensamblesAgrupados);
  return { tiposEncontrados: tiposEncontrados, ...ensamblesAgrupados };
}

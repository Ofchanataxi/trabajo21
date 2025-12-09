import * as fs from 'fs';
import { parseStringPromise } from 'xml2js';
import { parseISO } from 'date-fns';

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

export function conversion(json: any, nombreArchivo: string): DynamicObject {
  try {
    let jsonAux = json.report.data[0];
    let jsonAuxMetada = json.report.metadata[0];
  } catch (error) {
    throw new Error('Formato no valido para el archivo ' + nombreArchivo);
  }

  let jsonAux = json.report.data[0];
  let jsonAuxMetada = json.report.metadata[0];
  /**
   * Datos generales
   */
  let myObject: DynamicObject = {};

  myObject.encabezado = {};
  myObject.encabezado.equipo =
    jsonAux.DM_REPORT_JOURNAL[0].$.rig_operation_name;
  myObject.encabezado.sistema = jsonAux.DM_EVENT[0].$.event_team;
  myObject.encabezado.elaboradoPor = jsonAux.DM_EVENT_APPROVAL[0].$.company;
  myObject.encabezado.revisadoPor = jsonAux.DM_EVENT_APPROVAL[0].$.department;
  myObject.encabezado.aprobadoPor = jsonAux.DM_EVENT_APPROVAL[0].$.approved_by;
  myObject.encabezado.fecha = jsonAux.DM_EVENT_APPROVAL[0].$.date_ops_end;
  myObject.encabezado.campo = 'AUCA';
  myObject.encabezado.locacion = jsonAux.CD_WELLBORE[0].$.wellbore_label
    .split('-')[0]
    .replace(/[^a-zA-Z\s]/g, '');
  myObject.encabezado.pozo = jsonAux.CD_WELLBORE[0].$.well_legal_name;
  myObject.encabezado.wellbore_label = jsonAux.CD_WELLBORE[0].$.wellbore_label;

  myObject.datum = {};
  myObject.datum.elevationGL =
    transformarDeStringANumero(
      jsonAux.CD_DATUM.find((item: any) => item.$.datum_name === 'ORIGINAL KB')
        .$.datum_elevation,
    ) || 'NO PUDO OBTENER LA INFORMACION';
  myObject.datum.originalKB =
    transformarDeStringANumero(
      jsonAux.CD_DATUM.find((item: any) => item.$.datum_name === 'GROUND LEVEL')
        .$.datum_elevation,
    ) || 'NO PUDO OBTENER LA INFORMACION';
  myObject.datum.mr = transformarDeStringANumero(
    jsonAux.CD_WELL[0].$.well_desc,
  );

  myObject.survey = {};
  myObject.survey.tipo = jsonAux.CD_WELLBORE[0].$.reason;
  myObject.survey.maxAngDesvAndMaxDLS =
    jsonAux.CD_WELLBORE[0].$.geo_offset_reference_bh;

  myObject.profundidad = {};
  myObject.profundidad.md = transformarDeStringANumero(
    jsonAux.CD_WELLBORE[0].$.bh_md,
  );
  myObject.profundidad.tvd = transformarDeStringANumero(
    jsonAux.CD_WELLBORE[0].$.bh_tvd,
  );

  myObject.ensambles = {};

  /**
   * ARENAS
   */

  myObject.aperturas = {};
  let aperturas = jsonAux.CD_OPENING_STATUS;
  for (let i = 0; i < aperturas.length; i++) {
    const element = aperturas[i].$;

    let obj = {
      wellbore_id: element.wellbore_id,
      status: element.status,
      wellbore_opening_id: element.wellbore_opening_id,
      effective_date: element.effective_date,
      wellbore: [],
    };

    addProperty(myObject.aperturas, element.wellbore_opening_id, obj);
  }

  let welbore = jsonAux.CD_WELLBORE_OPENING;
  for (let i = 0; i < welbore.length; i++) {
    const element = welbore[i].$;
    let obj = {
      wellbore_zone: element.wellbore_zone || null,
      md_top: transformarDeStringANumero(element.md_top) || null,
      md_base: transformarDeStringANumero(element.md_base) || null,
      disparos: [],
    };

    let arregloAux = myObject.aperturas[element.wellbore_opening_id].wellbore;

    arregloAux.push(obj);
  }

  let disparos = jsonAux.CD_PERF_INTERVAL;

  for (let i = 0; i < disparos.length; i++) {
    const element = disparos[i].$;
    let mdArriba = transformarDeStringANumero(element.md_top_shot);
    let mdAbajo = transformarDeStringANumero(element.md_bottom_shot);

    for (let key in myObject.aperturas) {
      if (myObject.aperturas.hasOwnProperty(key)) {
        let wellboreOpening = myObject.aperturas[key];

        let arenasEncontradas = wellboreOpening.wellbore;
        for (let j = 0; j < arenasEncontradas.length; j++) {
          const elementArenas = arenasEncontradas[j];
          let arenaMdArriba = transformarDeStringANumero(elementArenas.md_top);
          let arenaMdAbajo = transformarDeStringANumero(elementArenas.md_base);

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
            let obj = {
              top_shot_bottom_shot_interval: parseInt(
                element.top_shot_bottom_shot_interval,
              ),
              shot_density: parseInt(element.shot_density),
              md_top_shot: mdArriba,
              md_bottom_shot: mdAbajo,
            };
            elementArenas.disparos.push(obj);
          }
        }
      }
    }
  }
  /**
   * CABEZAL
   */
  let cabezal = jsonAux.CD_WELLHEAD[0].$;
  myObject.cabezal = {};
  myObject.cabezal.cabezal = {
    wellhead_model: cabezal.wellhead_model,
    wellhead_name: cabezal.wellhead_name,
    wellhead_make: cabezal.wellhead_make,
    working_pressure: cabezal.working_pressure,
  };

  /**
   * ENSAMBLES
   */

  let ensambles = jsonAux.CD_ASSEMBLY;
  for (let i = 0; i < ensambles.length; i++) {
    const element = ensambles[i].$;

    let obj = {
      assembly_size: element.assembly_size || null,
      assembly_name: element.assembly_name || null,
      md_assembly_base:
        transformarDeStringANumero(element.md_assembly_base) || null,
      string_class: element.string_class || null,
      componentes: [],
      notas: [],
      casing: [],
    };

    addProperty(myObject.ensambles, element.assembly_id, obj);
  }

  let notas = jsonAux.CD_ASSEMBLY_NOTE;
  for (let i = 0; i < notas.length; i++) {
    const element = notas[i].$;
    let arregloAux = myObject.ensambles[element.assembly_id].notas;
    if (element.notes) {
      arregloAux.push(element.notes);
    }
  }

  let status = jsonAux.CD_ASSEMBLY_STATUS;
  for (let i = 0; i < status.length; i++) {
    const element = status[i].$;
    addProperty(
      myObject.ensambles[element.assembly_id],
      'status',
      element.status || '',
    );
    addProperty(
      myObject.ensambles[element.assembly_id],
      'fecha',
      element.date_status || '',
    );
  }

  let casing = jsonAux.DM_CASING;
  for (let i = 0; i < casing.length; i++) {
    const element = casing[i].$;
    let obj = {
      packoff_model: element.packoff_model || null,
    };
    let arregloAux = myObject.ensambles[element.assembly_id].casing;
    arregloAux.push(obj);
  }

  let componentes = jsonAux.CD_ASSEMBLY_COMP;
  for (let i = 0; i < componentes.length; i++) {
    const element = componentes[i].$;
    let obj = {
      joints: parseInt(element.joints) || null,
      catalog_key_desc: element.catalog_key_desc || null,
      md_top: transformarDeStringANumero(element.md_top) || null,
      md_base: transformarDeStringANumero(element.md_base) || null,
      comp_name: element.comp_name || null,
      od_body: parseInt(element.od_body) || null,
      length: transformarDeStringANumero(element.length) || null,
      approximate_weight: parseInt(element.approximate_weight) || null,
    };
    let arregloAux = myObject.ensambles[element.assembly_id].componentes;
    arregloAux.push(obj);
  }

  /**
   * Proceso de ordenamiento y agrupamiento
   */

  const ensamblesAgrupados = groupAndSortEnsamble(myObject.ensambles);
  myObject.ensambles = agregarTiposEncontrados(ensamblesAgrupados);

  let jsonOutputPath = nombreArchivo;

  fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonAux, null, 2));
  //console.log(`jsonAux saved to ${jsonOutputPath}`);

  jsonOutputPath = nombreArchivo;
  fs.writeFileSync(jsonOutputPath, JSON.stringify(myObject, null, 2));
  //console.log(`myObject saved to ${jsonOutputPath}`);

  jsonAux = myObject;
  return jsonAux;
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

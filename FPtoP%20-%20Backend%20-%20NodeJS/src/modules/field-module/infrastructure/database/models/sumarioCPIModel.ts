import { DataTypes, Model, ModelStatic, QueryTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';
import { OilfieldOperation } from 'src/modules/oil-field-operation-management/domain/entities/WellInformation';
import { v4 as uuidv4 } from 'uuid';
//import { processRows } from 'src/modules/field-module/application/services/processRows';

interface ForeignKey {
  table_name: string;
  referenced_table_name: string;
  column_name: string;
  referenced_column_name: string;
}

interface InfoData {
  nombrePestana: string;
  type: string;
  SubType: string;
  Campo: string;
  ValorHistoricoOpenwells: string;
  ValorHistoricoFP2P: string;
  ValorFinal: string;
  Acciones: string;
  Perforations: string;
  Perforation: string;
  action: boolean;
}
export async function ENCABEZADO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
  SELECT
--oo.*,
oo.id,
'DCTH-EE-FT-013' AS "codigoReporte",
'AGENCIA DE REGULACIÓN Y CONTROL HIDROCARBURÍFERO' AS "tituloReporte",
'RESULTADO DE TERMINACIÓN Y PRUEBAS INICIALES' AS "subtituloReporte",
null AS "fechaDeReporte",
null AS "numeroDeOficioDeAcusoRecibo",
null AS "numeroDeResolucionDeAprobacionSH",
CONCAT('SUMARIO ',report_oilfieldoperation_name_merge(oo.id)) AS "nombrePestana",
CONCAT('SUMARIO ',report_oilfieldoperation_name_merge(oo.id)) AS "nombreArchivoPrincipal"
FROM public."OilfieldOperations" oo
WHERE oo.id = 	 ` +
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}


export async function DATOS_GENERALES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
--oo.*,
oo.id,
'EP PETROECUADOR' AS "compania",
'61' AS "bloque",
w."field" AS "campo", --- FALTA HACER QUE GUARDE AVOCET
w."wellShortName" AS "pozo",
report_obtain_from_oilfieldOperationsData(oo.id, 30) AS "yacimiento",
report_obtain_from_oilfieldOperationsData(oo.id, 6) AS "tipoPozo",
report_single_date_with_name(oo."endDateTime") AS "fechaCompletacion",
report_obtain_from_oilfieldOperationsData(oo.id, 42) AS "clasificacionDelPozo", -- NO TIENE NUMERO EN EL REPORTE DE MAPEO, PERO SI ES VARIABLE
null AS "tipoDeEstructura",
NULLIF(r.emr, 0) AS "elevacionMesaRotaria",
report_obtain_from_oilfieldOperationsData(oo.id, 8) AS "profundidadMedida_MD",
report_obtain_from_oilfieldOperationsData(oo.id, 9) AS "profundidadVerticalVerdadera_TVD",
report_obtain_profundidadAsentamientoDeLaBomba_MD(oo.id) AS "profundidadAsentamientoDeLaBomba_MD", --ACTUALMENTE SE CONSIDERA AL ID 103 COMO SEPARADOR DE GAS
regexp_replace((regexp_matches(report_obtain_from_oilfieldOperationsData(oo.id, 7), '^([0-9.]+)° @[0-9,]+\.?[0-9]*ft MD & [0-9.]+°/100ft @[0-9,]+\.?[0-9]*ft MD'))[1], '[^0-9.]', '', 'g') AS "profundidadDelAnguloMaximo_MD",
	to_char(
    ROUND(
      CAST(
        regexp_replace((regexp_matches(report_obtain_from_oilfieldOperationsData(oo.id, 7), '^[0-9.]+° @([0-9,]+\.?[0-9]*)ft MD & [0-9.]+°/100ft @[0-9,]+\.?[0-9]*ft MD'))[1], ',', '', 'g'
      ) AS numeric
    ), 0
  ), 'FM9,999,999') AS "anguloMaximoDesvio_MD"
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
JOIN public."Rig" r ON r.id = oo."idRig"
WHERE oo.id =	 ` +
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function PRUEBA_DE_PRODUCCION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
--oo.*,
oo.id,
report_obtain_from_oilfieldOperationsData(oo.id, 38) AS "fecha", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 39) AS "numeroDePrueba", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 40) AS "horasDePrueba", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 30) AS "yacimiento",
report_obtain_from_oilfieldOperationsData(oo.id, 36) AS "intervaloDeProduccionDesde", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 37) AS "intervaloDeProduccionHasta", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 35) AS "diametroCanon", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 31) AS "numeroDisparos", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 32) AS "cargaTipo", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 33) AS "penetracion", --FALTA EN LA PANTALLA DE IWC
report_obtain_from_oilfieldOperationsData(oo.id, 34) AS "diametroOrificioEnCasing" --FALTA EN LA PANTALLA DE IWC
FROM public."OilfieldOperations" oo
WHERE oo.id = ` +
    idOilFieldOperations +
    ` 
order by report_obtain_from_oilfieldOperationsData(oo.id, 30), report_obtain_from_oilfieldOperationsData(oo.id, 38) `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}



export async function COSTOS_REALES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
	id,
	"idOilfieldOperations",
	"company" AS "compania", 
	"service" AS "servicio",
	"material" AS "material",
	"expense" AS "gasto", 
	"investment" AS "inversion"
FROM public."OilfieldOperationsFinalCost"
WHERE "idOilfieldOperations" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function PRUEBAS_DE_PRODUCCION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
  "testNumber" AS "pruebaNumero",
  "reservoir" AS "pruebaYacimiento",
  "testDate" AS "fecha",
  "wellheadPressure_psi" AS "pCab",
  "manifoldPressure_psi" AS "pMan",
  "bfpd" AS "bfpd",
  "bopd" AS "bopd",
  "bwpd" AS "bwpd",
  "salinity_ppm" AS "salinidad",
  "bsw_percent" AS "bs&w",
  "api_gravity" AS "api",
  "gas_mscf" AS "gas",
  "glr_scf_per_stb" AS "glr",
  "gor_scf_per_stb" AS "gor"
FROM public."OilfieldOperationsProductionTestHydraulicFlow"
WHERE "idOilfieldOperations" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function INYECCION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
campo,
"Prueba1",
"Prueba2",
"Prueba3",
"Prueba4",
"Prueba5",
"Prueba6"
FROM public.report_obtain_OilfieldOperationsProductionTestInjection_CPI(`+idOilFieldOperations +`) `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function RETORNO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
campo,
"Prueba1",
"Prueba2",
"Prueba3",
"Prueba4",
"Prueba5",
"Prueba6"
FROM public.report_obtain_OilfieldOperationsProductionTestFlowback_CPI(`+idOilFieldOperations +`) `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function BOMBA(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
	"testNumber" AS "bomba-PruebaNro",
	"pumpType" AS "bomba-Tipo",
	"evaluationHours" AS "bomba-HorasDeEvaluacion",
	"remarks" AS "bomba-Observacion"
FROM public."OilfieldOperationsProductionTestPumping"
WHERE "idOilfieldOperations" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function BOMBEO_ELECTRICO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
    "testNumber" AS "pruebaNumero", 
    "reservoir" AS "yacimientoPrueba", 
    "testDate" AS "fecha",
    "pressureHead" AS "pCab", 
    "pressureManifold" AS "pMan",
    "pressureSeparator" AS "pSep",
    "temperatureSeparator" AS "tSep",
    "bfpd" AS "bfpd",
    "bopd" AS "bopd",
    "salinity" AS "salinidad",
    "bsw" AS "bs&w",
    "apiGravity" AS "api",
    "glr" AS "glr",
    "gor" AS "gor",
    "gasProduction" AS "gas",
    "pumpType" AS "tipoBomba"
FROM "OilfieldOperationsProductionTestElectricPumpingMethod"
WHERE "idOilfieldOperations" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function PARAMETROS(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
  	"testNumber" AS "pruebaNumero", 
  	"testDate" AS "fecha", 
  	"pIntake" AS "pIntake",
	"pDischarge" AS "pDescarga", 
	"tIntake" AS "tIntake",
	"tMotor" AS "tMotor",
	"frequency" AS "frecuencia",
	"amperage" AS "amperaje",
	"voltage" AS "voltaje"
FROM "OilfieldOperationsProductionTestElectricPumpingParameters"
WHERE "idOilfieldOperations" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function TIEMPO_DE_EVALUACION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
  	"testNumber" AS "pruebaNumero", 
  	"hours" AS "horas", 
  	"observation" AS "observacion"
FROM "OilfieldOperationsElectricPumpingEvaluationTime"
WHERE "idOilfieldOperations" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function PROCEDIMIENTO_DE_OPERACION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
--oo.*,
oo.id,
CONCAT('INICIAN OPERACIONES DE COMPLETACIÓN Y PRUEBAS INICIALES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_single_date_with_name(oo."startDateTime")) 		AS "textoInicioOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
WHERE oo.id = `+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function PRUEBAS_DE_INYECTIVIDAD(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
   "testNumber" AS "inyectabilidad-pruebaNumero", 
   "durationMinutes" AS "inyectabilidad-tiempoMinutos", 
   "injectionRate" AS "inyectabilidad-rataInyeccion", 
   "injectionPressure" AS "inyectabilidad-presionInyeccion", 
   "observation" AS "inyectabilidad-observacion"
FROM public."OilfieldOperationsInjectivityTest"
WHERE "idOilfieldOperation" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function PRUEBAS_DE_PRODUCCION_PARA_POZO_DE_GAS(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
    "testNumber" AS "pozoDeGas-pruebaNumero", 
    "testDate" AS "pozoDeGas-fecha",
    "reservoir" AS "pozoDeGas-yacimiento",
    "shock" AS "pozoDeGas-choque", 
    "pressureHead" AS "pozoDeGas-pCab", 
    "pressureSeparator" AS "pozoDeGas-pSep",
    "pressureManifold" AS "pozoDeGas-pMan",
    "gasProduction" AS "pozoDeGas-gpd",
    "bapd" AS "pozoDeGas-bapd",
    "specificGravity" AS "pozoDeGas-gravedad",
    "apiCondensate" AS "pozoDeGas-api",
    "condensateBppd" AS "pozoDeGas-bppd",
    "temperature" AS "pozoDeGas-tc",
    "evaluatedHours" AS "pozoDeGas-horasEvaluadas",
    "observation" AS "pozoDeGas-observaciones"
FROM public."OilfieldOperationsProductionTestGasWell"
WHERE "idOilfieldOperation" =`+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}


export async function DETALLE_DEL_PROCEDIMIENTO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
    CONCAT("stepNumber", '.-') AS "numeroDetalleProcedimientoDeOperacion", 
    "contentHtml" AS "descripcionDetalleProcedimientoDeOperacion"
FROM public."OilfieldOperationsExecutionLog"
WHERE "idOilfieldOperation" = ` +
    idOilFieldOperations +
    ` AND "afterSuspension" = false
ORDER BY "stepNumber";
 `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}


export async function SUSPENDEN_OPERACIONES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
      --oo.*,
      oo.id,
      CONCAT('SE SUSPENDEN OPERACIONES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_single_date_with_name(oo."suspendDateTime")) 		AS "textoSuspendenOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
      FROM public."OilfieldOperations" oo
      JOIN public."Well" w ON oo."idWell" = w.id
      WHERE oo.id = `+
    idOilFieldOperations +
    ` ;
 `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function REINICIAN_OPERACIONES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
      --oo.*,
      oo.id,
      CONCAT('SE REINICIAN OPERACIONES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_single_date_with_name(oo."restartDateTime")) 		AS "textoSuspendenOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
      FROM public."OilfieldOperations" oo
      JOIN public."Well" w ON oo."idWell" = w.id
      WHERE oo.id = `+
    idOilFieldOperations +
    ` 
      `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function ACTIVIDADES_DESPUES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
        CONCAT("stepNumber", '.-') AS "numeroDetalleProcedimientoDeOperacion", 
        "contentHtml" AS "descripcionDetalleProcedimientoDeOperacion"
    FROM public."OilfieldOperationsExecutionLog"
    WHERE "idOilfieldOperation" = `+
    idOilFieldOperations +
    `  AND "afterSuspension" = true
    ORDER BY "stepNumber";
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function FINALIZAN_OPERACIONES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
--oo.*,
oo.id,
CONCAT('FINALIZAN OPERACIONES DE COMPLETACIÓN Y PRUEBAS INICIALES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_single_date_with_name(oo."endDateTime")) 	AS "textoFinOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
WHERE oo.id = `+
    idOilFieldOperations +
    ` `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

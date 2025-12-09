import { QueryTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';
import { OilfieldOperation } from 'src/modules/oil-field-operation-management/domain/entities/WellInformation';

//import { processRows } from 'src/modules/field-module/application/services/processRows';

interface InfoData {
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
'DCTH-EE-FT-014' AS "codigoReporte",
'AGENCIA DE REGULACIÓN Y CONTROL HIDROCARBURÍFERO' AS "tituloReporte",
'RESULTADO DE TRABAJOS DE REACONDICIONAMIENTO' AS "subtituloReporte",
null AS "fechaDeReporte",
null AS "numeroDeOficioDeAcusoRecibo",
null AS "numeroDeResolucionDeAprobacionSH",
CONCAT('SUMARIO ',report_oilfieldoperation_name_merge(oo.id)) AS "nombrePestana",
CONCAT('SUMARIO ',report_oilfieldoperation_name_merge(oo.id)) AS "nombreArchivoPrincipal"
FROM public."OilfieldOperations" oo
WHERE oo.id = ` +
    idOilFieldOperations +
    ` 
	`;

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
--r.*,
oo.id,
'EP PETROECUADOR' AS "compania",
'61' AS "bloque",
w."field" AS "campo", --- FALTA HACER QUE GUARDE AVOCET
w."wellShortName" AS "pozo",
null AS "tasaFijadaDeProduccionBBL",
report_obtain_from_oilfieldOperationsData(oo.id, 30) AS "yacimiento",
report_single_date_with_name(oo."startDateTime") AS "fechaDeInicio",
report_single_date_with_name(oo."suspendDateTime") AS "fechaDeSuspension",
report_single_date_with_name(oo."restartDateTime") AS "fechaDeReinicio",
report_single_date_with_name(oo."endDateTime") AS "fechaDeFinalizacion",
case when report_obtain_from_oilfieldOperationsData(oo.id, 43)= 'true' then 'X' else '' end AS "conTorre", 
case when report_obtain_from_oilfieldOperationsData(oo.id, 43)= 'false' then 'X' else '' end AS "sinTorre", 
oo."operationNumber" AS "reacondicionamientoNro",
trim(both '- ' FROM regexp_replace(r."name", '\d+', '', 'g')) AS "contratistaRig",
regexp_replace(r."name", '\D+', '', 'g') AS "equipoRig",
report_obtain_from_oilfieldOperationsData(oo.id, 44) AS "objetivo",
report_obtain_from_oilfieldOperationsData(oo.id, 25) AS "cumplimientoDelObjetivo"
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
JOIN public."Rig" r ON r.id = oo."idRig"
WHERE oo.id =  ` +
    idOilFieldOperations +
    ` 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function OBJETIVO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
--oo.*,
--r.*,
oo.id,
report_obtain_from_oilfieldOperationsData(oo.id, 44) AS "objetivo"
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
JOIN public."Rig" r ON r.id = oo."idRig"
WHERE oo.id = ` +
    idOilFieldOperations +
    ` 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function CUMPLIMIENTO_DEL_OBJETIVO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    ` SELECT
oo.id,
report_obtain_from_oilfieldOperationsData(oo.id, 25) AS "cumplimientoDelObjetivo"
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
JOIN public."Rig" r ON r.id = oo."idRig"
WHERE oo.id =  ` +
    idOilFieldOperations +
    ` 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function ANTES_DEL_TRABAJO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
    "testNumber" AS "antes-pruebaNumero",
    "testDate" AS "antes-fecha",
    "reservoir" AS "antes-yacimientoPrueba",
    "pressureHead" AS "antes-pCab",
    "pressureManifold" AS "antes-pMan",
    "bfpd" AS "antes-bfpd",
    "bopd" AS "antes-bopd",
    "bwpd" AS "antes-bwpd",
    "salinity" AS "antes-salinidad",
    "bsw" AS "antes-bs&w",
    "apiGravity" AS "antes-api",
    "pumpType" AS "antes-tipoBomba"
FROM public."OilfieldOperationsProductionTestBeforeWork"
WHERE "idOilfieldOperation" = ` +
    idOilFieldOperations +
    ` 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function DESPUES_DEL_TRABAJO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
    "testNumber"       AS "despues-pruebaNumero",
    "testDate"         AS "despues-fecha",
    "reservoir"        AS "despues-yacimientoPrueba",
    "pressureHead"     AS "despues-pCab",
    "pressureManifold" AS "despues-pMan",
    "bfpd"             AS "despues-bfpd",
    "bopd"             AS "despues-bopd",
    "bwpd"             AS "despues-bwpd",
    "salinity"         AS "despues-salinidad",
    "bsw"              AS "despues-bs&w",
    "apiGravity"       AS "despues-api",
    "pumpType"         AS "despues-tipoBomba"
FROM public."OilfieldOperationsProductionTestAfterWork"
WHERE "idOilfieldOperation" = ` +
    idOilFieldOperations +
    ` 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function BOMBEO_HIDRAULICO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
  "testNumber" AS "bombeoHidraulico-pruebaNumero",
  "testDate" AS "bombeoHidraulico-fecha",
  "reservoir" AS "bombeoHidraulico-yacimientoPrueba",
  "wellheadPressure_psi" AS "bombeoHidraulico-pCab",
  "manifoldPressure_psi" AS "bombeoHidraulico-pMan",
  "bfpd" AS "bombeoHidraulico-bfpd",
  "bopd" AS "bombeoHidraulico-bopd",
  "bwpd" AS "bombeoHidraulico-bwpd",
  "salinity_ppm" AS "bombeoHidraulico-salinidad",
  "bsw_percent" AS "bombeoHidraulico-bs&w",
  "api_gravity" AS "bombeoHidraulico-api",
  "gas_mscf" AS "bombeoHidraulico-gas",
  "glr_scf_per_stb" AS "bombeoHidraulico-glr",
  "gor_scf_per_stb" AS "bombeoHidraulico-gor"
FROM public."OilfieldOperationsProductionTestHydraulicFlow"
WHERE "idOilfieldOperations" = ` +
    idOilFieldOperations +
    ` 
	`;

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
"Prueba4"
FROM public.report_obtain_OilfieldOperationsProductionTestInjection_WO( ` +
    idOilFieldOperations +
    `); 
	`;

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
"Prueba4"
FROM public.report_obtain_OilfieldOperationsProductionTestFlowback_WO( ` +
    idOilFieldOperations +
    `); 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function BOMBA(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery = `SELECT 
	"testNumber" AS "bomba-PruebaNro",
	"pumpType" AS "bomba-Tipo",
	"pumpModel" AS "bomba-Modelo",
	"stages" AS "bomba-Etapas",
	"power_hp" AS "bomba-Potencia",
	"evaluationHours" AS "bomba-HorasDeEvaluacion",
	"remarks" AS "bomba-Observacion"
FROM public."OilfieldOperationsProductionTestPumping"
WHERE "idOilfieldOperations" =  ` +
    idOilFieldOperations +
    ` 
	`;

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
    "testNumber" AS "bombeoElectrico-pruebaNumero", 
    "testDate" AS "bombeoElectrico-fecha",
    "reservoir" AS "bombeoElectrico-yacimientoPrueba", 
    "pressureHead" AS "bombeoElectrico-pCab", 
    "pressureManifold" AS "bombeoElectrico-pMan",
    "pressureSeparator" AS "bombeoElectrico-pSep",
    "temperatureSeparator" AS "bombeoElectrico-tSep",
    "bfpd" AS "bombeoElectrico-bfpd",
    "bopd" AS "bombeoElectrico-bopd",
    "salinity" AS "bombeoElectrico-salinidad",
    "bsw" AS "bombeoElectrico-bs&w",
    "apiGravity" AS "bombeoElectrico-api",
    "glr" AS "bombeoElectrico-glr",
    "gor" AS "bombeoElectrico-gor",
    "gasProduction" AS "bombeoElectrico-gas",
    "pumpType" AS "bombeoElectrico-tipoBomba"
FROM 
    "OilfieldOperationsProductionTestElectricPumpingMethod"
WHERE 
    "idOilfieldOperations" = ` +
    idOilFieldOperations +
    ` 
	`;

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
    "testNumber" AS "bombeoElectrico-pruebaNumero", 
    "testDate" AS "bombeoElectrico-fecha", 
    "pIntake" AS "bombeoElectrico-pIntake",
    "pDischarge" AS "bombeoElectrico-pDescarga", 
    "tIntake" AS "bombeoElectrico-tIntake",
    "tMotor" AS "bombeoElectrico-tMotor",
    "frequency" AS "bombeoElectrico-frecuencia",
    "amperage" AS "bombeoElectrico-amperaje",
    "voltage" AS "bombeoElectrico-voltaje"
FROM "OilfieldOperationsProductionTestElectricPumpingParameters"
WHERE "idOilfieldOperations" =  ` +
    idOilFieldOperations +
    ` 
	`;

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
  	"testNumber" AS "bombeoElectrico-pruebaNumero", 
  	"hours" AS "bombeoElectrico-horas", 
  	"observation" AS "bombeoElectrico-observacion"
FROM "OilfieldOperationsElectricPumpingEvaluationTime"
WHERE "idOilfieldOperations" = ` +
    idOilFieldOperations +
    ` 
	`;

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
WHERE "idOilfieldOperation" =  ` +
    idOilFieldOperations +
    ` 
	`;

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
WHERE "idOilfieldOperations" =  ` +
    idOilFieldOperations +
    ` 
	`;

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
CONCAT('INICIAN OPERACIONES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_obtain_from_oilfieldOperationsData(oo.id, 26)) 		AS "textoInicioOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
WHERE oo.id = ` +
    idOilFieldOperations +
    ` 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function DETALLE_DEL_PROCEDIMIENTO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
  	SELECT 
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
    `
  	SELECT
--oo.*,
oo.id,
CONCAT('SE SUSPENDEN OPERACIONES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_single_date_with_name(oo."suspendDateTime")) 		AS "textoSuspendenOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
WHERE oo.id = ` +
    idOilFieldOperations +
    `
  `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function REINICIAN_OPERACIONES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery = `
  	SELECT
      --oo.*,
      oo.id,
      CONCAT('SE REINICIAN OPERACIONES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_single_date_with_name(oo."restartDateTime")) 		AS "textoSuspendenOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
      FROM public."OilfieldOperations" oo
      JOIN public."Well" w ON oo."idWell" = w.id
      WHERE oo.id =` +
    idOilFieldOperations +
    `
  `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function ACTIVIDADES_DESPUES_DEL_REINICIO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery = `
  	SELECT 
    CONCAT("stepNumber", '.-') AS "numeroDetalleProcedimientoDeOperacion", 
    "contentHtml" AS "descripcionDetalleProcedimientoDeOperacion"
FROM public."OilfieldOperationsExecutionLog"
WHERE "idOilfieldOperation" = ` +
    idOilFieldOperations +
    ` AND "afterSuspension" = true
ORDER BY "stepNumber";
  `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function SECCION_FINALIZAN_OPERACIONES(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT
--oo.*,
oo.id,
CONCAT('FINALIZAN OPERACIONES EN EL POZO ',report_oilfieldoperation_name_merge(oo.id), ' EL ', report_obtain_from_oilfieldOperationsData(oo.id, 27)) 	AS "textoFinOperaciones" ---- FALTA que la fecha este bien ingresada para poder mapear en IWC
FROM public."OilfieldOperations" oo
JOIN public."Well" w ON oo."idWell" = w.id
WHERE oo.id = ` +
    idOilFieldOperations +
    ` 
	`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

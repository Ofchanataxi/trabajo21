import { QueryTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../field-module/infrastructure/database/sequelize';

interface InfoDataOperationDetails {
  idWell: string;
  wellName: string;
  wellShortName: string;
  field: string;
  country: string;
  client: string;
  initialProductionZone: string;
  idOilFieldOperations: string;
  idOilfieldTypeOperations: string;
  operationType: string;
  operationCode: string;
  operationNumber: string;
  idRig: string;
  rigName: string;
  rigEMR: string;
}

interface InfoMechanicalDetails {
  idWell: string;
  idOilFieldOperations: string;
  topeMD: string;
  fondoMD: string;
  outerDiameter: string;
  innerDiameter: string;
  peso: string;
  drift: string;
  rosca: string;
  clase: string;
  idWMD: string;
  idOilField: string;
  idStandardElements: string;
  nameStandardElemen: string;
  idStandardBusinessLine: string;
  idStandardWellSections: string;
  idStandardWellInfrastructureType: string;
  nameWellInfrastructureType: string;
}

interface profundidadesAsentamiento {
  //Profundidad de asentamiento
  topebodhmd: number;
  topebodhtvd: number;
  topeintakemd: number;
  topeintaketvd: number;
  topemotormd: number;
  topemotortvd: number;
  topeperforadosmd: number;
  topeperforadostvd: number;
  baseperforadosmd: number;
  baseperforadostvd: number;
  totalwelldepthmd: number;
  totalwelldepthtvd: number;
}

interface wellDetailsVarious {
  //Detalles de pozo/Varios
  maxdls: number;
  profundidad: number;
  dlsprofbomba: number;
  desviacionprofbomba: number;
  desviacionmaximaporatravesar: number;
  longitudequipoesp: number;
  longitudcable: number;
  longitudcablemle: number;
  longitudcapilarexterno: number;
}

interface accesoriosTuberia {
  camisaCirculDiameter: string;
  camisaCirculValue: number;
  flowCouplingDiameter: string;
  flowCouplingValue: number;
  noGoDiameter: string;
  noGoValue: number;
}

interface yTool {
  ytoolmarca: string;
  ytooltipo: string;
  ytoolpn: number;
  ytoolblankingplugpn: number;
  ytoolbypasstubingod: string;
  ytoolunidadesbypasstubing: number;
  ytoolroscabypasstubing: string;
  ytoolbypassclamps: number;
}

interface protectoresCableInput {
  protectolizers: string;
  bandas: string;
  lowprofile: string;
}

interface protectoresCableSection {
  cantidad: number;
  descripcion: string;
}
interface equiposEspecificosCompl {
  completaciondual: string;
  podhanger: string;
  podpenetrator: string;
  podcasingsize: string;
  packerutilizado: string;
  motorshroud: string;
}

interface penetradorConector {
  localizacionempaltesobreladescarga: string;
  puntodeinyeccionderecho: string;
  puntodeinyeccionizquierdo: string;
}

interface equipoDeSuperficie {
  gensettablerodistmodelo: string;
  gensettablerodistnoserie: string;
  gensettablerodistparte: string;
  gensettablerodistkvarating: number;
  gensettablerodistprivolts: number;
  gensettablerodistpropiedad: string;
  sdtshiftmodelo: string;
  sdtshiftnoserie: string;
  sdtshiftnoparte: string;
  sdtshiftkvarating: number;
  sdtshiftprivolts: number;
  sdtshiftpropiedad: string;
  vsddescripcion: string;
  vsdnoseri: string;
  vsdnoparte: string;
  vsdkvarating: number;
  vsdpulsos: number;
  vsdpropiedad: string;
  sutmodelo: string;
  sutnoserie: string;
  sutnoparte: string;
  sutkvarating: number;
  sutsecvolts: string;
  sutpropiedad: string;
}

interface parametrosEstaticosSensor {
  pruebamegadainicialpi: number;
  pruebamegadainicialpd: number;
  pruebamegadainicialti: number;
  pruebamegadainicialtm: number;
  pruebamegadainicialff: number;
  pruebamegadainicialft: number;
  pruebamegadainicialamp: number;
  pruebamegadainicialhz: number;
  pruebamegadaintermediapi: number;
  pruebamegadaintermediapd: number;
  pruebamegadaintermediati: number;
  pruebamegadaintermediatm: number;
  pruebamegadaintermediaff: number;
  pruebamegadaintermediaft: number;
  pruebamegadaintermediaamp: number;
  pruebamegadaintermediahz: number;
  pruebamegadafinalpi: number;
  pruebamegadafinalpd: number;
  pruebamegadafinalti: number;
  pruebamegadafinaltm: number;
  pruebamegadafinalff: number;
  pruebamegadafinalft: number;
  pruebamegadafinalamp: number;
  pruebamegadafinalhz: number;
  pruebaarranquecontroladorpi: number;
  pruebaarranquecontroladorpd: number;
  pruebaarranquecontroladorti: number;
  pruebaarranquecontroladortm: number;
  pruebaarranquecontroladorff: number;
  pruebaarranquecontroladorft: number;
  pruebaarranquecontroladoramp: number;
  pruebaarranquecontroladorhz: number;
  pruebaarranquerotacion1pi: number;
  pruebaarranquerotacion1pd: number;
  pruebaarranquerotacion1ti: number;
  pruebaarranquerotacion1tm: number;
  pruebaarranquerotacion1ff: number;
  pruebaarranquerotacion1ft: number;
  pruebaarranquerotacion1amp: number;
  pruebaarranquerotacion1hz: number;
  pruebaarranquerotacioncpi: number;
  pruebaarranquerotacioncpd: number;
  pruebaarranquerotacioncti: number;
  pruebaarranquerotacionctm: number;
  pruebaarranquerotacioncff: number;
  pruebaarranquerotacioncft: number;
  pruebaarranquerotacioncamp: number;
  pruebaarranquerotacionchz: number;
  pruebaarranqueproduccionpi: number;
  pruebaarranqueproduccionpd: number;
  pruebaarranqueproduccionti: number;
  pruebaarranqueproducciontm: number;
  pruebaarranqueproduccionff: number;
  pruebaarranqueproduccionft: number;
  pruebaarranqueproduccionamp: number;
  pruebaarranqueproduccionhz: number;
}

interface parametrosVariador {
  tmotorhi: number;
  tintakehi: number;
  pdhi: number;
  frecmax: number;
  frecmin: number;
  frecbase: number;
  ol: number;
  ul: number;
  tapvoltaje: string;
  observaciones: string;
}

interface InfoCableProtectors {
  idOilfieldOperations: number;
  idRelease: number;
  idBusinessLine: string;
  timestamp: string;
  idReleaseState: string;
  idCreatedBy: string;
  changeReason: string;
  idElementRelease: string;
  serial: string;
  idCondition: string;
  condition: string;
  quantity: string;
  idCouplingCondition: string;
  brand: string;
  idStandardElements: string;
  pecDescription: string;
  approvalStatus: string;
}

interface downholeHeadersColumns {
  idStandardBusinessLines: number;
  nameStandardBusinessLines: string;
  idStandardGroup: number;
  nameStandardGroup: string;
  nameStandardAttribute: string;
}

interface interfaceInfoDownholePerSection {
  idOilfieldOperation: number;
  idTally: number;
  idRelease: number;
  idElementRelease: number;
  idStandardElement: number;
  nameStandardElement: string;
  idElementTally: number;
  sequenceNumber: number;
  standardAttrName: string;
  StandardAttributeOption: string;
  StandardGroups: string;
  idStandardGroup: number;
}

export interface DataRunBes
  extends profundidadesAsentamiento,
    wellDetailsVarious,
    accesoriosTuberia,
    yTool,
    protectoresCableInput,
    equiposEspecificosCompl,
    penetradorConector,
    equipoDeSuperficie,
    parametrosEstaticosSensor,
    parametrosVariador,
    wellMechanicalDetails {
  preparadopor: string;
  aprobadopor: string;
  liderinstalacion: string;
  companyman: string;
  iniciodeinstalacion: Date;
  operador: string;
  pais: string;
  findeinstalacion: Date;
  liderarranque: string;
  cliente: string;
  arranque: Date;
  testigos: string;
  tipodeaplicacion: string;
  initialproductionzone: string;
  //observaciones
  observaciones: string;
  idOilfieldOperations: number; //FK
  //rig time details
  detailsrigtime: InterfaceRigTimeDetails;
  //mechanical details
  mechanicaldetails: wellMechanicalDetails;
  id: string;
}

interface InfoUndergroundEquipmentDetails {
  idTally: number;
  idOilfieldOperations: number;
  element_id: number;
  idStandardElement: number;
  name: string;
  brand: string;
}

interface InterfaceHeadersDownhole {
  idStandardBusinessLines: number;
  nameStandardBusinessLines: string;
  nameStandardGroup: string;
}

interface InterfaceRigTimeDetails {
  //  idOilfieldOperations: number; //Nico: aqui es el id de runbes
  cliente: string;
  liderInstalacion: string;
  representanteCliente: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  detalle: string;
  fechaHoraArriboLocacion: Date;
  fechaHoraInicioTrabajo: Date;
  fechaHoraFinTrabajo: Date;
}

interface ReleaseALSvalidation {
  id: number;
  idBusinessLine: number;
  timestamp: Date;
  idReleaseState: number;
  idOilfieldOperations: number;
  idCreatedBy: number;
  changeReason: string;
}

interface wellMechanicalDetails {
  topeMD: number;
  fondoMD: number;
  outerDiameter: string;
  innerDiameter: string;
  peso: number;
  drift: number;
  rosca: string;
  clase: string;
  //idOilfieldOperations: number;
  idStandardElements: number;
}

interface reportSignature {
  id: number;
  report_id: number;
  orden: number;
  StandardRolesBusinessLine_id: number;
  fecha_firma: string;
  estado: string;
  path: string;
  fecha_notificacion: string;
  aprobador_id: number;
}

interface Permisos {
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeFirmar: boolean;
}

interface RespuestaReporteConFlujo {
  //reporte: any | null;
  flujo: reportSignature[];
  permisos: Permisos;
  plantillaNotificacion: any | null;
  idPasoActivo: any | null;
}

export async function getAnyReleaseALSvalidation(
  idOilFieldOperation: number,
): Promise<ReleaseALSvalidation[]> {
  const infoDataQuery = `
    SELECT *
    FROM "Release" rel
    WHERE 
    rel."idOilfieldOperations" = ${idOilFieldOperation}
    AND rel."idReleaseState" = 4
    AND rel."idBusinessLine" = 2`;

  const infoData: ReleaseALSvalidation[] = await postgres_sequelize.query(
    infoDataQuery,
    {
      type: QueryTypes.SELECT,
    },
  );

  return infoData;
}

export async function getInfoOperationDetails(
  idOilFieldOperation: number,
): Promise<InfoDataOperationDetails[]> {
  const infoDataQuery = `
SELECT 
	well."id" AS "idWell"
	,well."wellName"
	,well."wellShortName"
	,well."field"
	,'Ecuador' AS country
	,'SHAYA S.A' AS client
	,well."initialProductionZone"
	,ofo."id" AS "idOilFieldOperations"
	,ofo."idOilfieldTypeOperations"
	,ofto."operationType"
	,ofto."operationCode"
	,ofo."operationNumber"
	,ofo."idRig"
	,rig.name AS "rigName"
  ,rig.emr as "rigEMR"
FROM "Well" AS well
LEFT OUTER JOIN "OilfieldOperations" AS ofo
ON well."id" = ofo."idWell"
LEFT OUTER JOIN "OilfieldTypeOperations" AS ofto
ON ofto."id" = ofo."idOilfieldTypeOperations"
LEFT OUTER JOIN "Rig" rig
ON rig."id" = ofo."idRig"
WHERE ofo."id" = ${idOilFieldOperation}`;

  const infoData: InfoDataOperationDetails[] = await postgres_sequelize.query(
    infoDataQuery,
    {
      type: QueryTypes.SELECT,
    },
  );

  return infoData;
}

export async function getMechanicalDetails(
  idOilFieldOperation: number,
): Promise<InfoMechanicalDetails[]> {
  const infoMechDetQuery = `
  SELECT 
	ofo."idWell"
	,ofo."id" as "idOilFieldOperations"
	,wmd."topeMD"
	,wmd."fondoMD"
	,wmd."outerDiameter"
	,wmd."innerDiameter"
	,wmd."peso"
	,wmd."drift"
	,wmd."rosca"
	,wmd."clase"
	,wmd."id" as "idWellMechanical"
	,wmd."idOilfieldOperations"
	,wmd."idStandardElements"
	,ste."name" as "nameStandardElement"
	,ste."idStandardBusinessLines" as "idStandardBusinessLine"
	,ste."idStandardWellSections" as "idStandardWellSections"
	,ste."idStandardWellInfrastructureType" as "idStandardWellInfrastructureType"

FROM "OilfieldOperations" ofo

INNER JOIN "Well" as well
on well."id" = ofo."idWell"

INNER JOIN "WellMechanicalDetails" wmd
ON wmd."idOilfieldOperations" = ofo."id"

INNER JOIN "StandardElements" ste
ON ste."id" = wmd."idStandardElements"

where ofo."id" = ${idOilFieldOperation}`;

  const infoDataMechDet: InfoMechanicalDetails[] =
    await postgres_sequelize.query(infoMechDetQuery, {
      type: QueryTypes.SELECT,
    });

  return infoDataMechDet;
}

//Detalles Equipos de Subsuelo --Marca
export async function getUndergroundEquipmentDetails(
  idOilFieldOperation: number,
): Promise<InfoUndergroundEquipmentDetails[]> {
  const infUnderEquipDetailsQuery = `
  SELECT
    tally."id" AS "idTally"
    ,tally."idOilfieldOperations"
    ,etally."element_id"
    ,standelem."id" as "idStandardElement"
    ,standelem."name"
    ,erelease."brand"
  FROM "Tally" tally

  LEFT OUTER JOIN "ElementTally" etally
  ON etally."tally_id" = tally."id"

  LEFT OUTER JOIN "ElementRelease" erelease
  ON erelease."id" = etally."element_id"

  LEFT OUTER JOIN "StandardElements" standelem
  ON standelem."id" = erelease."idStandardElements"

  WHERE tally."idOilfieldOperations" = ${idOilFieldOperation}
  --Se filtra para cabeza
  AND standelem."id" = 12`;

  const infUnderEquipDetails: InfoUndergroundEquipmentDetails[] =
    await postgres_sequelize.query(infUnderEquipDetailsQuery, {
      type: QueryTypes.SELECT,
    });
  return infUnderEquipDetails;
}

//Detalles Equipos de Subsuelo -- Y TOOL
export async function getYToolDetails(
  idOilFieldOperation: number,
): Promise<any[]> {
  const infYToolDetailsQuery = `
  SELECT
    tally."id" AS "idTally"
    ,tally."idOilfieldOperations"
    ,etally."element_id"
    ,standelem."id" as "idStandardElement"
    ,standelem."name"
    ,erelease."brand"
  FROM "Tally" tally

  INNER JOIN "ElementTally" etally
  ON etally."tally_id" = tally."id"

  INNER JOIN "ElementRelease" erelease
  ON erelease."id" = etally."element_id"

  INNER JOIN "StandardElements" standelem
  ON standelem."id" = erelease."idStandardElements"

  WHERE tally."idOilfieldOperations" = ${idOilFieldOperation}
  --Se filtra para cabeza
  AND standelem."id" = 12`;

  const infYToolDetails: InfoUndergroundEquipmentDetails[] =
    await postgres_sequelize.query(infYToolDetailsQuery, {
      type: QueryTypes.SELECT,
    });
  return infYToolDetails;
}

//Diametros Camisa de Circulacion
export async function getDiametersCamisaCirculacion(): Promise<any[]> {
  const diametersEquipQuery = `
  SELECT 
	standElem."id" AS "idStandardElement"
	,standElem."name" AS "nameStandardElement"
	,standAttrib."name" as "nameStandardAttributeElement"
	,standAttrOpt."value"
FROM "StandardElements" standElem
INNER JOIN "StandardAttributes" standAttrib
ON standElem."id" = standAttrib."idStandardElement"
INNER JOIN "StandardAttributeOptions" standAttrOpt
ON standAttrOpt."idStandardAttribute" = standAttrib."id"
WHERE standElem."id" = 2 --Camisa
AND standAttrib."id" = 12 --Diametro`;
  const infDiameterCamisaCirculacion: any[] = await postgres_sequelize.query(
    diametersEquipQuery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return infDiameterCamisaCirculacion;
}

//Diametros Flow Coupling
export async function getDiametersFlowCoupling(): Promise<any[]> {
  const diametersEquipQuery = `
  SELECT 
	standElem."id" AS "idStandardElement"
	,standElem."name" AS "nameStandardElement"
	,standAttrib."name" as "nameStandardAttributeElement"
	,standAttrOpt."value"
FROM "StandardElements" standElem
INNER JOIN "StandardAttributes" standAttrib
ON standElem."id" = standAttrib."idStandardElement"
INNER JOIN "StandardAttributeOptions" standAttrOpt
ON standAttrOpt."idStandardAttribute" = standAttrib."id"
WHERE standElem."id" = 2 --Camisa
AND standAttrib."id" = 12 --Diametro`;
  const infDiameterFlowCoupling: any[] = await postgres_sequelize.query(
    diametersEquipQuery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return infDiameterFlowCoupling;
}

//Diametros NOgo
export async function getDiametersNoGo(): Promise<any[]> {
  const diametersEquipQuery = `
  SELECT 
	standElem."id" AS "idStandardElement"
	,standElem."name" AS "nameStandardElement"
	,standAttrib."name" as "nameStandardAttributeElement"
	,standAttrOpt."value"
FROM "StandardElements" standElem
INNER JOIN "StandardAttributes" standAttrib
ON standElem."id" = standAttrib."idStandardElement"
INNER JOIN "StandardAttributeOptions" standAttrOpt
ON standAttrOpt."idStandardAttribute" = standAttrib."id"
WHERE standElem."id" = 2 --Camisa
AND standAttrib."id" = 12 --Diametro`;
  const infDiameterNoGo: any[] = await postgres_sequelize.query(
    diametersEquipQuery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return infDiameterNoGo;
}

//Protectores de Cable Section
export async function getCableProtectoresCant(
  idOilFieldOperation: number,
): Promise<protectoresCableSection[]> {
  const cableProtectorsQuery = `
    SELECT
      roetopd."cantidad_total" AS "cantidad",
      roetopd."autogenerateDescriptionSerialConditionNoShowSerialIfIsEmpty" AS "descripcion"
      FROM public.report_obtain_elements_tally_only_parents_detail(
        (
          SELECT t."id" FROM public."Tally" t WHERE t."idOilfieldOperations" = ${idOilFieldOperation} LIMIT 1
        )
      ) roetopd
    WHERE roetopd."idstandardelements" IN (105,106) -- Es el ID de PROTECTORES DE CABLE Y MID JOINTS
  `;
  const infoCableProtectorsCant: protectoresCableSection[] =
    await postgres_sequelize.query(cableProtectorsQuery, {
      type: QueryTypes.SELECT,
    });
  return infoCableProtectorsCant;
}

//protectolizers
export async function getProtectolizersCant(
  idOilFieldOperation: number,
): Promise<protectoresCableSection[]> {
  const protectolizersQuery = `
    SELECT
      roetopd."cantidad_total" AS "cantidad",
      roetopd."autogenerateDescriptionSerialConditionNoShowSerialIfIsEmpty" AS "descripcion"
      FROM public.report_obtain_elements_tally_only_parents_detail(
        (
          SELECT t."id" FROM public."Tally" t WHERE t."idOilfieldOperations" = ${idOilFieldOperation} LIMIT 1
        )
      ) roetopd
    WHERE roetopd."idstandardelements" = 228 -- Es el ID de PROTECTOLIZER
  `;
  const infoProtectolizersCant: protectoresCableSection[] =
    await postgres_sequelize.query(protectolizersQuery, {
      type: QueryTypes.SELECT,
    });
  return infoProtectolizersCant;
}

//bandas
export async function getBandasCant(
  idOilFieldOperation: number,
): Promise<protectoresCableSection[]> {
  const bandasQuery = `
    SELECT
      roetopd."cantidad_total" AS "cantidad",
      roetopd."autogenerateDescriptionSerialConditionNoShowSerialIfIsEmpty" AS "descripcion"
      FROM public.report_obtain_elements_tally_only_parents_detail(
        (
          SELECT t."id" FROM public."Tally" t WHERE t."idOilfieldOperations" = ${idOilFieldOperation} LIMIT 1
        )
      ) roetopd
    WHERE roetopd."idstandardelements" = 206 -- Es el ID de BANDAS
  `;
  const infoBandasCant: protectoresCableSection[] =
    await postgres_sequelize.query(bandasQuery, {
      type: QueryTypes.SELECT,
    });
  return infoBandasCant;
}

//low profile
export async function getLowProfileCant(
  idOilFieldOperation: number,
): Promise<protectoresCableSection[]> {
  const lowProfileQuery = `
    SELECT
      roetopd."cantidad_total" AS "cantidad",
      roetopd."autogenerateDescriptionSerialConditionNoShowSerialIfIsEmpty" AS "descripcion"
      FROM public.report_obtain_elements_tally_only_parents_detail(
        (
          SELECT t."id" FROM public."Tally" t WHERE t."idOilfieldOperations" = ${idOilFieldOperation} LIMIT 1
        )
      ) roetopd
    WHERE roetopd."idstandardelements" = 229 -- Es el ID de LOW PROFILE
  `;
  const infoLowProfileCant: protectoresCableSection[] =
    await postgres_sequelize.query(lowProfileQuery, {
      type: QueryTypes.SELECT,
    });
  return infoLowProfileCant;
}

export async function getCableProtectors(
  idOilFieldOperation: number,
): Promise<InfoCableProtectors[]> {
  const cableProtectorsQuery = `
    SELECT 
      release."idOilfieldOperations"
      ,release."id" as "idRelease"
      ,release."idBusinessLine"
      ,release."timestamp"
      ,release."idReleaseState"
      ,release."idCreatedBy"
      ,release."changeReason"
      ,elementrelease."id" AS "idElementRelease"
      ,elementrelease."serial"
      ,elementrelease."idCondition" AS "idCondition"
      ,standardcondition."condition"
      ,elementrelease."quantity"
      ,elementrelease."idCouplingCondition"
      ,elementrelease."brand"
      ,elementrelease."idStandardElements"
      ,elementrelease."pecDescription"
      ,elementrelease."approvalStatus"
    FROM "Release" release
    --Element Release
    INNER JOIN "ElementRelease" elementrelease
    ON elementrelease."idRelease" = release."id"
    AND elementrelease."idStandardElements" = 105
    AND elementrelease."approvalStatus" = True
    --Standard Condition
    INNER JOIN "StandardCondition" standardcondition
    ON standardcondition."id" = elementrelease."idCondition"
    --Conditions
    WHERE 
    "idOilfieldOperations" = ${idOilFieldOperation}
    AND"idBusinessLine" = 2
    AND "idReleaseState" = 4`;

  const infoCableProtectors: InfoCableProtectors[] =
    await postgres_sequelize.query(cableProtectorsQuery, {
      type: QueryTypes.SELECT,
    });
  return infoCableProtectors;
}

//Encabezados Downhole
export async function getDownholeHeaders(): Promise<any[]> {
  const downholeHeadersQuery = `
  SELECT 
		sbl."id" as "idStandardBusinessLines"
		,sbl."name" as "nameStandardBusinessLines"
		,sg."name" as "nameStandardGroup"
FROM "StandardBusinessLines" as sbl
INNER JOIN "StandardGroups" as sg
on sg."idBusinessLine" = sbl."id"
WHERE  sbl."id" = 2`;
  const infDownholeHeaders: InterfaceHeadersDownhole[] =
    await postgres_sequelize.query(downholeHeadersQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeHeaders;
}

//Headers Column downhole
export async function getHeadersColumnsDownhole(): Promise<
  downholeHeadersColumns[]
> {
  const infoColumnsHeadersDownholeQuery = `
    SELECT DISTINCT
      sbl."id" as "idStandardBusinessLines"
      ,sbl."name" as "nameStandardBusinessLines"
      ,sg."id" as "idStandardGroup"
      ,sg."name" as "nameStandardGroup"
      --,seg."id" as "idStandardElementsGroups"
      --,seg."idStandardElements"
      --,se."name" as "nameStandardElement"
      ,sa."name" as "nameStandardAttribute"
    FROM "StandardBusinessLines" as sbl
    --StandardGroups
    INNER JOIN "StandardGroups" as sg
    ON sg."idBusinessLine" = sbl."id"
    INNER JOIN "StandardElementsGroups" as seg
    ON seg."idStandardGroups" = sg."id"
    INNER JOIN "StandardElements" AS se
    ON se."id" = seg."idStandardElements"
    --AND se."showRunBES" = True -- Se quita la condicion momentaneamente
    INNER JOIN "StandardAttributes" AS sa
    ON sa."idStandardElement" = se."id"
    AND sa."showRunBES"
    --Conditions
    WHERE sbl."id" = 2
  `;
  const infoDownholeColumns: downholeHeadersColumns[] =
    await postgres_sequelize.query(infoColumnsHeadersDownholeQuery, {
      type: QueryTypes.SELECT,
    });
  return infoDownholeColumns;
}

//Nuevo metodo Downhole Cabeza de descarga
export async function getInfDownholeCabezaDescarga(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleCabezaDescargaQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},1);
  `;
  const infDownholeBomb: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleCabezaDescargaQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeBomb;
}

//Nuevo metodo downhole BOMBAS
export async function getInfDownholeBomb(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleBombQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},2);
  `;
  const infDownholeBomb: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleBombQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeBomb;
}

//Nuevo metodo downhole INTAKE/ SEPARADORES DE GAS
export async function getInfDownholeIntkSepGas(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleIntkSepGasQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},4);
  `;
  const infDownholeIntkSepGas: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleIntkSepGasQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeIntkSepGas;
}

//Nuevo metodo downhole PROTECTORES
export async function getInfDownholeProtectors(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleProtectorsQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},5);
  `;
  const infDownholeProtectors: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleProtectorsQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeProtectors;
}

//Nuevo metodo downhole MOTORES
export async function getInfDownholeMotores(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleMotorsQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},6);
  `;
  const infDownholeMotors: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleMotorsQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeMotors;
}

//Nuevo metodo downhole SENSOR / ADICIONALES DE SENSOR
export async function getInfDownholeSensors(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleSensorsQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},7);
  `;
  const infDownholeSensors: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleSensorsQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeSensors;
}

//Nuevo metodo downhole TRANSFERLINE/ CAPILARES
export async function getInfDownholeTransferline(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleTransferlineQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},8);
  `;
  const infDownholeSensors: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleTransferlineQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeSensors;
}

//Nuevo metodo downhole CABLE
export async function getInfDownholeCable(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleCableQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},9);
  `;
  const infDownholeCable: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleCableQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeCable;
}

//Nuevo metodo downhole PENETRADOR y CONECTADORES DE EN COLGADOR
export async function getInfDownholePenetrador(
  idOilFieldOperation: number,
): Promise<interfaceInfoDownholePerSection[]> {
  const infDownHoleCableQuery = `
    SELECT * FROM get_downhole_information_by_standard_group(${idOilFieldOperation},3) gdi
    WHERE gdi."standardattributename" in ('MARCA', 'ESTADO', 'SERIAL');
  `;
  const infDownholeCable: interfaceInfoDownholePerSection[] =
    await postgres_sequelize.query(infDownHoleCableQuery, {
      type: QueryTypes.SELECT,
    });
  return infDownholeCable;
}

//get runbes data loaded
export async function getDataRunBes(
  idOilFieldOperation: number,
): Promise<DataRunBes[]> {
  const infRunBesQuery = `
    SELECT * FROM "DataRunBes" WHERE "idOilfieldOperations" = ${idOilFieldOperation};
    `;
  const runBesData: DataRunBes[] = await postgres_sequelize.query(
    infRunBesQuery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return runBesData;
}

//get rigtime data loaded
export async function getDataRigTime(
  idOilFieldOperation: number,
): Promise<DataRunBes[]> {
  const infRunBesQuery = `
    SELECT 
      id
      ,"idOilfieldOperations"
      ,cliente
      ,"liderInstalacion" 
      ,"representanteCliente" 
      ,"fechaHoraInicio" 
      ,"fechaHoraFin" 
      ,detalle 
      ,"fechaHoraArriboLocacion" 
      ,"fechaHoraInicioTrabajo" 
      ,"fechaHoraFinTrabajo" 
      ,"idDataRunBes"
      ,TO_CHAR("fechaHoraFin" - "fechaHoraInicio", 'HH24:MI') AS duracion
    FROM "RigTime"
    WHERE "idOilfieldOperations" = ${idOilFieldOperation}
    order by "fechaHoraInicio";
    `;
  const rigTimeData: DataRunBes[] = await postgres_sequelize.query(
    infRunBesQuery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return rigTimeData;
}

export async function createRunBesData(
  dataRunBes: DataRunBes,
): Promise<number> {
  const query = `
  SELECT insert_data_runbes(:dataRunBes) AS run_bes_id;`;
  type RunBesIdResult = { run_bes_id: number }; //Interface para resultado
  const result = await postgres_sequelize.query<RunBesIdResult>(query, {
    type: QueryTypes.SELECT,
    replacements: {
      dataRunBes: JSON.stringify({
        id: dataRunBes.id,
        idOilfieldOperations: dataRunBes.idOilfieldOperations,
        preparadopor: dataRunBes.preparadopor,
        aprobadopor: dataRunBes.aprobadopor,
        liderinstalacion: dataRunBes.liderinstalacion,
        companyman: dataRunBes.companyman,
        iniciodeinstalacion: dataRunBes.iniciodeinstalacion,
        operador: dataRunBes.operador,
        pais: dataRunBes.pais,
        findeinstalacion: dataRunBes.findeinstalacion,
        liderarranque: dataRunBes.liderarranque,
        cliente: dataRunBes.cliente,
        arranque: dataRunBes.arranque,
        testigos: dataRunBes.testigos,
        tipodeaplicacion: dataRunBes.tipodeaplicacion,
        topebodhmd: dataRunBes.topebodhmd,
        topebodhtvd: dataRunBes.topebodhtvd,
        topeintakemd: dataRunBes.topeintakemd,
        topeintaketvd: dataRunBes.topeintaketvd,
        topemotormd: dataRunBes.topemotormd,
        topemotortvd: dataRunBes.topemotortvd,
        topeperforadosmd: dataRunBes.topeperforadosmd,
        topeperforadostvd: dataRunBes.topeperforadostvd,
        baseperforadosmd: dataRunBes.baseperforadosmd,
        baseperforadostvd: dataRunBes.baseperforadostvd,
        totalwelldepthmd: dataRunBes.totalwelldepthmd,
        totalwelldepthtvd: dataRunBes.totalwelldepthtvd,
        maxdls: dataRunBes.maxdls,
        profundidad: dataRunBes.profundidad,
        dlsprofbomba: dataRunBes.dlsprofbomba,
        desviacionprofbomba: dataRunBes.desviacionprofbomba,
        desviacionmaximaporatravesar: dataRunBes.desviacionmaximaporatravesar,
        longitudequipoesp: dataRunBes.longitudequipoesp,
        longitudcable: dataRunBes.longitudcable,
        longitudcablemle: dataRunBes.longitudcablemle,
        longitudcapilarexterno: dataRunBes.longitudcapilarexterno,
        camisacirculacion: dataRunBes.camisaCirculValue,
        camisacirculaciondiametro: dataRunBes.camisaCirculDiameter,
        flowcoupling: dataRunBes.flowCouplingValue,
        flowcouplingdiametro: dataRunBes.flowCouplingDiameter,
        slidingsleevenogo: dataRunBes.noGoValue,
        slidingsleevenogodiametro: dataRunBes.noGoDiameter,
        ytoolmarca: dataRunBes.ytoolmarca,
        ytooltipo: dataRunBes.ytooltipo,
        ytoolpn: dataRunBes.ytoolpn,
        ytoolblankingplugpn: dataRunBes.ytoolblankingplugpn,
        ytoolbypasstubingod: dataRunBes.ytoolbypasstubingod,
        ytoolunidadesbypasstubing: dataRunBes.ytoolunidadesbypasstubing,
        ytoolroscabypasstubing: dataRunBes.ytoolroscabypasstubing,
        ytoolbypassclamps: dataRunBes.ytoolbypassclamps,
        protectolizers: dataRunBes.protectolizers,
        bandas: dataRunBes.bandas,
        lowprofile: dataRunBes.lowprofile,
        completaciondual: dataRunBes.completaciondual,
        podhanger: dataRunBes.podhanger,
        podpenetrator: dataRunBes.podpenetrator,
        podcasingsize: dataRunBes.podcasingsize,
        packerutilizado: dataRunBes.packerutilizado,
        motorshroud: dataRunBes.motorshroud,
        localizacionempaltesobreladescarga:
          dataRunBes.localizacionempaltesobreladescarga,
        puntodeinyeccionderecho: dataRunBes.puntodeinyeccionderecho,
        puntodeinyeccionizquierdo: dataRunBes.puntodeinyeccionizquierdo,
        gensettablerodistmodelo: dataRunBes.gensettablerodistmodelo,
        gensettablerodistnoserie: dataRunBes.gensettablerodistnoserie,
        gensettablerodistparte: dataRunBes.gensettablerodistparte,
        gensettablerodistkvarating: dataRunBes.gensettablerodistkvarating,
        gensettablerodistprivolts: dataRunBes.gensettablerodistprivolts,
        gensettablerodistpropiedad: dataRunBes.gensettablerodistpropiedad,
        sdtshiftmodelo: dataRunBes.sdtshiftmodelo,
        sdtshiftnoserie: dataRunBes.sdtshiftnoserie,
        sdtshiftnoparte: dataRunBes.sdtshiftnoparte,
        sdtshiftkvarating: dataRunBes.sdtshiftkvarating,
        sdtshiftprivolts: dataRunBes.sdtshiftprivolts,
        sdtshiftpropiedad: dataRunBes.sdtshiftpropiedad,
        vsddescripcion: dataRunBes.vsddescripcion,
        vsdnoseri: dataRunBes.vsdnoseri,
        vsdnoparte: dataRunBes.vsdnoparte,
        vsdkvarating: dataRunBes.vsdkvarating,
        vsdpulsos: dataRunBes.vsdpulsos,
        vsdpropiedad: dataRunBes.vsdpropiedad,
        sutmodelo: dataRunBes.sutmodelo,
        sutnoserie: dataRunBes.sutnoserie,
        sutnoparte: dataRunBes.sutnoparte,
        sutkvarating: dataRunBes.sutkvarating,
        sutsecvolts: dataRunBes.sutsecvolts,
        sutpropiedad: dataRunBes.sutpropiedad,
        pruebamegadainicialpi: dataRunBes.pruebamegadainicialpi,
        pruebamegadainicialpd: dataRunBes.pruebamegadainicialpd,
        pruebamegadainicialti: dataRunBes.pruebamegadainicialti,
        pruebamegadainicialtm: dataRunBes.pruebamegadainicialtm,
        pruebamegadainicialff: dataRunBes.pruebamegadainicialff,
        pruebamegadainicialft: dataRunBes.pruebamegadainicialft,
        pruebamegadainicialamp: dataRunBes.pruebamegadainicialamp,
        pruebamegadainicialhz: dataRunBes.pruebamegadainicialhz,
        pruebamegadaintermediapi: dataRunBes.pruebamegadaintermediapi,
        pruebamegadaintermediapd: dataRunBes.pruebamegadaintermediapd,
        pruebamegadaintermediati: dataRunBes.pruebamegadaintermediati,
        pruebamegadaintermediatm: dataRunBes.pruebamegadaintermediatm,
        pruebamegadaintermediaff: dataRunBes.pruebamegadaintermediaff,
        pruebamegadaintermediaft: dataRunBes.pruebamegadaintermediaft,
        pruebamegadaintermediaamp: dataRunBes.pruebamegadaintermediaamp,
        pruebamegadaintermediahz: dataRunBes.pruebamegadaintermediahz,
        pruebamegadafinalpi: dataRunBes.pruebamegadafinalpi,
        pruebamegadafinalpd: dataRunBes.pruebamegadafinalpd,
        pruebamegadafinalti: dataRunBes.pruebamegadafinalti,
        pruebamegadafinaltm: dataRunBes.pruebamegadafinaltm,
        pruebamegadafinalff: dataRunBes.pruebamegadafinalff,
        pruebamegadafinalft: dataRunBes.pruebamegadafinalft,
        pruebamegadafinalamp: dataRunBes.pruebamegadafinalamp,
        pruebamegadafinalhz: dataRunBes.pruebamegadafinalhz,
        pruebaarranquecontroladorpi: dataRunBes.pruebaarranquecontroladorpi,
        pruebaarranquecontroladorpd: dataRunBes.pruebaarranquecontroladorpd,
        pruebaarranquecontroladorti: dataRunBes.pruebaarranquecontroladorti,
        pruebaarranquecontroladortm: dataRunBes.pruebaarranquecontroladortm,
        pruebaarranquecontroladorff: dataRunBes.pruebaarranquecontroladorff,
        pruebaarranquecontroladorft: dataRunBes.pruebaarranquecontroladorft,
        pruebaarranquecontroladoramp: dataRunBes.pruebaarranquecontroladoramp,
        pruebaarranquecontroladorhz: dataRunBes.pruebaarranquecontroladorhz,
        pruebaarranquerotacion1pi: dataRunBes.pruebaarranquerotacion1pi,
        pruebaarranquerotacion1pd: dataRunBes.pruebaarranquerotacion1pd,
        pruebaarranquerotacion1ti: dataRunBes.pruebaarranquerotacion1ti,
        pruebaarranquerotacion1tm: dataRunBes.pruebaarranquerotacion1tm,
        pruebaarranquerotacion1ff: dataRunBes.pruebaarranquerotacion1ff,
        pruebaarranquerotacion1ft: dataRunBes.pruebaarranquerotacion1ft,
        pruebaarranquerotacion1amp: dataRunBes.pruebaarranquerotacion1amp,
        pruebaarranquerotacion1hz: dataRunBes.pruebaarranquerotacion1hz,
        pruebaarranquerotacioncpi: dataRunBes.pruebaarranquerotacioncpi,
        pruebaarranquerotacioncpd: dataRunBes.pruebaarranquerotacioncpd,
        pruebaarranquerotacioncti: dataRunBes.pruebaarranquerotacioncti,
        pruebaarranquerotacionctm: dataRunBes.pruebaarranquerotacionctm,
        pruebaarranquerotacioncff: dataRunBes.pruebaarranquerotacioncff,
        pruebaarranquerotacioncft: dataRunBes.pruebaarranquerotacioncft,
        pruebaarranquerotacioncamp: dataRunBes.pruebaarranquerotacioncamp,
        pruebaarranquerotacionchz: dataRunBes.pruebaarranquerotacionchz,
        pruebaarranqueproduccionpi: dataRunBes.pruebaarranqueproduccionpi,
        pruebaarranqueproduccionpd: dataRunBes.pruebaarranqueproduccionpd,
        pruebaarranqueproduccionti: dataRunBes.pruebaarranqueproduccionti,
        pruebaarranqueproducciontm: dataRunBes.pruebaarranqueproducciontm,
        pruebaarranqueproduccionff: dataRunBes.pruebaarranqueproduccionff,
        pruebaarranqueproduccionft: dataRunBes.pruebaarranqueproduccionft,
        pruebaarranqueproduccionamp: dataRunBes.pruebaarranqueproduccionamp,
        pruebaarranqueproduccionhz: dataRunBes.pruebaarranqueproduccionhz,
        tmotorhi: dataRunBes.tmotorhi,
        tintakehi: dataRunBes.tintakehi,
        pdhi: dataRunBes.pdhi,
        frecmax: dataRunBes.frecmax,
        frecmin: dataRunBes.frecmin,
        frecbase: dataRunBes.frecbase,
        ol: dataRunBes.ol,
        ul: dataRunBes.ul,
        tapvoltaje: dataRunBes.tapvoltaje,
        observaciones: dataRunBes.observaciones,
        initialproductionzone: dataRunBes.initialproductionzone,
        detailsrigtime: dataRunBes.detailsrigtime,
        mechanicaldetails: dataRunBes.mechanicaldetails,
      }),
    },
  });

  return result[0].run_bes_id;
}

export async function getReportSignFlow(
  usuarioId: number,
  idOilFieldOperation: number,
): Promise<RespuestaReporteConFlujo> {
  let plantillaNotificacion = 0;
  //Traer datos del reporte cargado
  const infRunBesQuery = `
    SELECT * FROM "DataRunBes" WHERE "idOilfieldOperations" = :idOilFieldOperation;
    `;
  const runBesData: DataRunBes[] = await postgres_sequelize.query(
    infRunBesQuery,
    {
      replacements: { idOilFieldOperation },
      type: QueryTypes.SELECT,
    },
  );

  // 2️. Si NO existe → responder modo "crear" pero velidando que sea un usuario de logistica Normal
  if (runBesData.length === 0) {
    const gruposQueryCreate = `
    SELECT *
    FROM "Users"
    WHERE "id" = ${usuarioId}
    AND "idStandardRolesBusinessLine" = :creatorGroup;
  `;

    const perteneceGrupoCreador = await postgres_sequelize.query(
      gruposQueryCreate,
      {
        replacements: { creatorGroup: 1 },
        type: QueryTypes.SELECT,
      },
    );

    if (perteneceGrupoCreador.length > 0) {
      return {
        flujo: [],
        permisos: {
          puedeCrear: true,
          puedeEditar: false,
          puedeFirmar: false,
        },
        plantillaNotificacion: 3,
        idPasoActivo: 0,
      };
    } else {
      return {
        flujo: [],
        permisos: {
          puedeCrear: false,
          puedeEditar: false,
          puedeFirmar: false,
        },
        plantillaNotificacion: 3,
        idPasoActivo: 0,
      };
    }
  }

  const reporte = runBesData[0];

  //obtener informacion de firmas
  const signQuery = `
  SELECT * FROM "reportSignature" WHERE report_id = :reportId ORDER BY orden`;
  const signFlow: reportSignature[] = await postgres_sequelize.query(
    signQuery,
    {
      replacements: { reportId: reporte.id },
      type: QueryTypes.SELECT,
    },
  );

  //Buscar paso activo (primero pendiente)
  const pasoActivo = signFlow.find(p => p.estado === 'Pendiente');

  const usuario = await postgres_sequelize.query(
    `SELECT * FROM "Users" WHERE "id" = ${usuarioId}`,
    { type: QueryTypes.SELECT },
  );
  const datosUsuario = usuario[0] as any;

  //Revisar si usuario pertenece al grupo activo
  let puedeFirmar = false;
  let puedeEditar = false;

  if (pasoActivo) {
    const gruposQuery = `
    SELECT *
    FROM "Users"
    WHERE "id" = ${usuarioId}
    AND "idStandardRolesBusinessLine" = ${pasoActivo?.StandardRolesBusinessLine_id};
  `;

    const perteneceGrupo = await postgres_sequelize.query(gruposQuery, {
      type: QueryTypes.SELECT,
    });

    puedeFirmar = perteneceGrupo.length > 0;
    //Solo puede editar antes de la primera firma
    if (puedeFirmar && pasoActivo.orden <= 1) {
      puedeEditar = true;
    }

    // const esLinea4 = datosUsuario.idStandardRolesBusinessLine === 4;

    // Determinar la plantilla de notificación
    if (
      signFlow.every(p => p.estado === 'Pendiente') &&
      datosUsuario.idStandardRolesBusinessLine == 1
    ) {
      plantillaNotificacion = 3; // Nadie ha firmado aún
    } else if (puedeFirmar && datosUsuario.idStandardRolesBusinessLine == 4) {
      plantillaNotificacion = 5; // Le corresponde firmar
    } else {
      plantillaNotificacion = 6; // No le toca firmar
    }
  } else {
    // Todas las firmas están completas
    plantillaNotificacion = 0;
  }

  return {
    //reporte,
    flujo: signFlow,
    permisos: {
      puedeCrear: false,
      puedeFirmar,
      puedeEditar,
    },
    plantillaNotificacion,
    idPasoActivo: pasoActivo?.id,
  };
}

export async function signReportStep(
  userId: number,
  reportSignId: number,
): Promise<void> {
  const pasos: reportSignature[] = await postgres_sequelize.query(
    'SELECT * FROM "reportSignature" WHERE "id" = :reportSignId',
    {
      replacements: { reportSignId },
      type: QueryTypes.SELECT,
    },
  );

  if (!pasos.length) {
    throw new Error('Firma no existe');
  }

  const paso = pasos[0];

  //Validar: solo firmar si está pendiente
  if (paso.estado !== 'Pendiente') {
    throw new Error('Este paso ya fue firmado');
  }

  //Validar usuario pertenece al grupo
  const gruposQuery = `
    SELECT *
    FROM "Users"
    WHERE "id" = :userId
    AND "idStandardRolesBusinessLine" = :rolId
  `;

  const perteneceGrupo = await postgres_sequelize.query(gruposQuery, {
    replacements: {
      userId,
      rolId: paso.StandardRolesBusinessLine_id,
    },
    type: QueryTypes.SELECT,
  });

  if (!perteneceGrupo.length) {
    throw new Error('No perteneces a este grupo');
  }

  // UPDATE!
  await postgres_sequelize.query(
    `
    UPDATE "reportSignature"
    SET estado = 'Firmado',
        aprobador_id = :userId,
        fecha_firma = NOW()
    WHERE "id" = :reportSignId
  `,
    {
      replacements: { userId, reportSignId },
      type: QueryTypes.UPDATE,
    },
  );
}

export async function createRunBesStateHistory(
  idOilfieldOperations: number,
  fecha_notificacion: string,
  idUser: number,
  idPreviousState: number,
  idNewState: number,
  idFile: number,
): Promise<void> {
  try {
    fecha_notificacion = new Date().toISOString();
    const query = `
    INSERT INTO public."RunBesStateHistory"(
    "idOilfieldOperations", "fecha_notificacion", "idUser", "idPreviousState", "idNewState", "idfileofoilfieldoperations")
    VALUES (${idOilfieldOperations}, '${fecha_notificacion}', ${idUser}, ${idPreviousState}, ${idNewState}, ${idFile});`;

    await postgres_sequelize.query(query, {
      type: QueryTypes.INSERT,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getLastRunBesState(
  idOilFieldOperation: number,
): Promise<any[]> {
  const getLastRunBesStateQuery = `
  SELECT
    rbsh."id" AS "idRunBesStateHistory"
    ,rbsh."idOilfieldOperations"
    ,rbsh."fecha_notificacion"
    ,rbsh."idUser"
    ,rbsh."idPreviousState"
    ,rbsh."idNewState"
    ,rbst."nextState"
    ,rbs."descripcion"
    ,rbft."previousFileIdStandardFileTypesOfOilfieldOperations" as "prevIdFile"
    ,rbft."actualFileIdStandardFileTypesOfOilfieldOperations" as "actualIdFile"
  FROM "RunBesStateHistory" rbsh
  INNER JOIN "RunBesState" rbs
  ON rbs."id" = rbsh."idNewState"
  INNER JOIN "RunBesStateTransition" rbst
  ON rbst."actualState" = rbsh."idNewState"
  LEFT JOIN "RunBesFileTransition" rbft 
  on rbft."actualFileIdStandardFileTypesOfOilfieldOperations" = rbsh."idfileofoilfieldoperations"
  WHERE rbsh."idOilfieldOperations" = ${idOilFieldOperation}
  ORDER BY 1 DESC
  LIMIT 1;
`;

  const infYToolDetails: any[] = await postgres_sequelize.query(
    getLastRunBesStateQuery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return infYToolDetails;
}

export async function getFilesOfOilFieldOperations(
  idOilFieldOperation: number,
): Promise<any> {
  const getFilesOfOilFieldOperationsquery = `
    SELECT
      sf.id AS "idStoredFiles",
      sf."fileName",
      sf."filePath",
      sf.size,
      sf."fileExtension",
      fooo."idStandardFileTypesOfOilfieldOperations"
    FROM public."FilesOfOilfieldOperations" fooo
    JOIN public."StoredFiles" sf 
    ON fooo."idStoredFiles" = sf.id
    WHERE fooo."idOilfieldOperations" = ${idOilFieldOperation}
    AND fooo."idStandardFileTypesOfOilfieldOperations" IN (6,7,9,5)
    order by "createdTimestamp" desc
    limit 1;
    `;
  const getFilesOfOilFieldOperationsInf: any[] = await postgres_sequelize.query(
    getFilesOfOilFieldOperationsquery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return getFilesOfOilFieldOperationsInf;
}

export async function getStandardElementGroups(): Promise<any> {
  const getStandardElementGroupsQuery = `
    SELECT 
      seg.id as "idStandardElementsGroups",
      seg."idStandardGroups",
      seg."idStandardElements",
      se.name
    FROM "StandardElementsGroups" seg
    INNER JOIN "StandardElements" se
    ON se.id = seg."idStandardElements"
    AND se."showRunBES"
    `;
  const getgetStandardElementGroupsInf: any[] = await postgres_sequelize.query(
    getStandardElementGroupsQuery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return getgetStandardElementGroupsInf;
}

export async function insertRunBesElementDetail(payload: {
  idRunBes: number;
  attributes: Array<{
    idStandardElement: number;
    column: string;
    value: string;
    rowId: string;
  }>;
}): Promise<void> {
  const query = `
    SELECT insert_run_bes_element_detail(:payload::jsonb);
  `;
  await postgres_sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: {
      payload: JSON.stringify(payload),
    },
  });
}

export async function getElementDetailTemporals(
  idOilFieldOperation: number,
): Promise<any> {
  const getElementDetailTemporalsquery = `
    SELECT  
      rbed."idStandardElement" as "rbed_idStandardElement",
      seg."idStandardGroups",
      se.name as "StandardElementName",
      sa.name as "StandardAttribute",
      sao.value as "StandardAttributeOption",
      rbed."groupRowId"
    FROM "RunBesElementDetail" rbed
    INNER JOIN "StandardElements" se
    ON se."id" = rbed."idStandardElement"
    AND se."showRunBES"
    INNER JOIN "StandardElementsGroups" seg
    ON seg."idStandardElements" = rbed."idStandardElement"
    INNER JOIN "StandardAttributes" sa
    ON sa."id" = rbed."idStandardAttributes"
    INNER JOIN "StandardAttributeOptions" sao
    ON sao."id" = rbed."idStandardAttributeOptions"
    WHERE rbed."idRunBes" = ${idOilFieldOperation}
    `;
  const getElementDetailTemporalsInf: any[] = await postgres_sequelize.query(
    getElementDetailTemporalsquery,
    {
      type: QueryTypes.SELECT,
    },
  );
  return getElementDetailTemporalsInf;
}

export async function getFileOfReportRunBes(
  idOilFieldOperation: number,
): Promise<any> {
  const query = `
    SELECT *
    FROM "StoredFiles"
    WHERE "fileName" LIKE 'REPORTE_RUNBES_%'
      AND "fileExtension" LIKE :extensionPattern
    ORDER BY "createdTimestamp" DESC
    LIMIT 1;
  `;

  const results = await postgres_sequelize.query(query, {
    replacements: { extensionPattern: `${idOilFieldOperation}%` },
    type: QueryTypes.SELECT,
  });

  return results;
}

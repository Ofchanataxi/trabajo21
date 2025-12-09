import { QueryTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';

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
export async function CPIHEADER(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
  SELECT 
id,
nombrearchivo,
primertitulo,
segundotitulo,
codigoreporte,
contratono,
contratista,
pad,
pozo,
fechadeemision,
actainicio,
fechadearranquedepozo,
nombredelcontrato
FROM public.report_dh_cpi_encabezado(` +
    idOilFieldOperations +
    `)
     `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function CPIDESCRIPTION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
SELECT 
bold,
underline,
fila
FROM public.report_dh_cpi_description_elements(` +
    idOilFieldOperations +
    `)
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function CPIDETAILS(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
id,
"pozoEnPerfectoFuncionamiento",
"cuandoElPozoNoEstaEnPerfectoFuncionamiento",
"observacionesDelServicioRecibido"
FROM public.report_dh_delivery_details(` +
    idOilFieldOperations +
    `)
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function CPIDOCUMENTATION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
id,
"reporteFinalDeLaActividad",
"sumarioDeLaActividadDeCompletacionInicial",
"diagramaMecanicoFinal"
FROM public.report_dh_cpi_documentation(` +
    idOilFieldOperations +
    `) 
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}


export async function WOHEADER(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
  SELECT 
id,
nombrearchivo,
primertitulo,
segundotitulo,
codigoreporte,
contratono,
contratista,
locacion,
pozo,
fechadeemision,
actainicio
FROM public.report_dh_wo_encabezado(` +
    idOilFieldOperations +
    `)
     `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function WOTYPE(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
SELECT 
id,
case when "tipoDeCompletacion" = 'BES SIMPLE' then 'X' else '' end "bes",
case when "tipoDeCompletacion" = 'DUAL' then 'X' else '' end "dual",
case when "tipoDeCompletacion" = 'HIDRAULICO' then 'X' else '' end "hidraulico",
case when "tipoDeCompletacion" = 'MECANICO' then 'X' else '' end "mecanico",
case when "tipoDeCompletacion" = 'INTELIGENTE' then 'X' else '' end "inteligente"
FROM public.report_dh_wo_completion_type(` +
    idOilFieldOperations +
    `)
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function WODESCRIPTION(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
bold,
underline,
fila
FROM public.report_dh_wo_description_elements(` +
    idOilFieldOperations +
    `)
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function WODETAILS(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
id,
case when "pozoEnPerfectoFuncionamiento" = 'SI' then 'X' else '' end "pozoEnPerfectoFuncionamiento",
case when "pozoEnPerfectoFuncionamiento" = 'NO' then 'X' else '' end "pozoEnMalFuncionamiento",
"cuandoElPozoNoEstaEnPerfectoFuncionamiento",
"observacionesDelServicioRecibido"
FROM public.report_dh_delivery_details(` +
    idOilFieldOperations +
    `) 
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function WODOCUMENTS(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
id,
"reporteFinalDeLaActividad",
"diagramaMecanicoFinal",
tally,
"reporteInstalacionEquipoLevantamientoArtificial"
FROM public.report_dh_wo_documentation(` +
    idOilFieldOperations +
    `) 
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

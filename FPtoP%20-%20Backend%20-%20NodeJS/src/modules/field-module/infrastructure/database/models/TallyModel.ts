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
export async function METADATA(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
  SELECT 
	id,
	"nombrePestana"
FROM public."report_view_tally_0_metadata" oo WHERE oo.id =` +
    idOilFieldOperations +
    `
     `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function ENCABEZADO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
SELECT 
	id,
	"tituloReporte",
	"nombresDelPozo",
	"labelRealizado",
	"realizadoPorTally",
	"labelRevisado",
	"revisadoPorTally",
	"labelAprobado",
	"aprobadoPorTally",
	"campoPozo",
	"actividad",
  REPLACE("fecha", 'FECHA: ', '') fecha,
	"rigName",
  REPLACE("campoPozo", 'POZO: ', '') pozo
FROM public."report_view_tally_1_encabezado" oo
WHERE oo.id = ` +
    idOilFieldOperations +
    ` 
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function TUBERIA_SECCION_UNO(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
	id_oilfieldoperation,
	"Numero",
	medida,
	"grupo_de_10",
	total_medida_grupo 
FROM public.report_view_tally_2_solo_tuberia_primera_seccion
WHERE id_oilfieldoperation =` +
    idOilFieldOperations +
    ` 
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function TUBERIA_SECCION_DOS(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
	"tabla",
	"id_oilfieldoperation",
	"backgroundColor",
	"boldText",
	"descripcion",
	"val1",
	"val2",
	"ord",
	"typeval1",
	"typeval2"
FROM report_obtain_elements_tally_with_headers_complete_without_mate(` +
    idOilFieldOperations +
    `) 
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function COMENTARIOS(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `SELECT 
	orden,
	comentario,
	"boldText"
FROM report_obtain_elements_tally_with_headers_complete_only_tub_mat(` +
    idOilFieldOperations +
    `) order by orden
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

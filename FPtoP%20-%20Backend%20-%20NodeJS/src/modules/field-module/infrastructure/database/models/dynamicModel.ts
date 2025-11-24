import { DataTypes, Model, ModelStatic, QueryTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';
import { OilfieldOperation } from 'src/modules/oil-field-operation-management/domain/entities/WellInformation';
import { v4 as uuidv4 } from 'uuid';
//import { processRows } from 'src/modules/field-module/application/services/processRows';

console.log("-------------------------------------------VERSION FIELD MODULE: V:10032025-1-----------------------------------------------------")

interface ForeignKey {
  table_name: string;
  referenced_table_name: string;
  column_name: string;
  referenced_column_name: string;
}

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
  showInTally?: boolean;
}
function mapToSequelizeDataType(columnType: string) {
  switch (columnType.toLowerCase()) {
    case 'integer':
    case 'int':
      return DataTypes.INTEGER;
    case 'bigint':
      return DataTypes.BIGINT;
    case 'boolean':
      return DataTypes.BOOLEAN;
    case 'text':
      return DataTypes.TEXT;
    case 'varchar':
    case 'character varying':
      return DataTypes.STRING;
    case 'date':
      return DataTypes.DATE;
    case 'float':
    case 'double precision':
      return DataTypes.FLOAT;
    case 'decimal':
    case 'numeric':
      return DataTypes.DECIMAL;
    case 'timestamp with time zone':
      return DataTypes.TIME;
    default:
      return DataTypes.TEXT;
  }
}

export async function createModel(tableName: string): Promise<{
  model: ModelStatic<Model<any>>;
  relatedModels: ModelStatic<Model<any>>[];
}> {
  const aliasTableName = tableName; //.replace('Oilfield', '').replace('Operations', 'Op').replace('Standard', '');

  //console.log(`Defining model for table: ${aliasTableName}`);

  if (postgres_sequelize.models[aliasTableName]) {
    //console.log(`Model for table ${aliasTableName} already exists.`);
    return {
      model: postgres_sequelize.models[aliasTableName],
      relatedModels: [],
    };
  }

  const columnsDescription = await postgres_sequelize
    .getQueryInterface()
    .describeTable(tableName);

  const columns = Object.entries(columnsDescription).reduce(
    (acc, [columnName, columnDetails]) => {
      const aliasColumnName = columnName; //.replace('oilfieldOperations', '').replace('OilfieldOperations', 'Op').replace('Standard', '').replace('Oilfield', '').replace('oilfield', '').replace('operation', 'op');
      //console.log('aliasColumnName ------------', aliasColumnName);
      acc[aliasColumnName] = {
        type: mapToSequelizeDataType(columnDetails.type),
        allowNull: columnDetails.allowNull,
        primaryKey: columnDetails.primaryKey,
        field: columnName,
      };
      return acc;
    },
    {} as any,
  );

  const model = postgres_sequelize.define(aliasTableName, columns, {
    tableName: tableName,
    timestamps: false,
    freezeTableName: true,
  });

  //console.log(`Model for table ${aliasTableName} created.`);
  return { model, relatedModels: [] };
}

export async function defineAssociationsFromForeignKeys(): Promise<void> {
  const foreignKeyQuery = `
        SELECT 
            DISTINCT tc.constraint_name as constraint_name, 
            tc.table_name as table_name,
            kcu.column_name as column_name,
            ccu.table_name  AS referenced_table_name,
            ccu.column_name AS referenced_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu 
            ON tc.constraint_name = kcu.constraint_name 
        JOIN information_schema.constraint_column_usage AS ccu 
            ON ccu.constraint_name = tc.constraint_name 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND tc.table_catalog = 'postgres'
        ORDER BY tc.constraint_name;
    `;

  const foreignKeys: ForeignKey[] = await postgres_sequelize.query(
    foreignKeyQuery,
    {
      type: QueryTypes.SELECT,
    },
  );

  for (const foreignKey of foreignKeys) {
    const { table_name, referenced_table_name, column_name } = foreignKey;

    // Apply alias transformations to table and column names
    const aliasSourceTable = table_name; //.replace('Oilfield', '').replace('Operations', 'Op').replace('Standard', '');
    const aliasTargetTable = referenced_table_name; //.replace('Oilfield', '').replace('Operations', 'Op').replace('Standard', '');

    const sourceModel = postgres_sequelize.models[aliasSourceTable];
    const targetModel = postgres_sequelize.models[aliasTargetTable];

    if (sourceModel && targetModel) {
      // Check if association already exists to avoid redefinition
      const associationExists = Object.keys(sourceModel.associations).includes(
        targetModel.name,
      );
      if (!associationExists) {
        // Define associations using aliases for foreign keys
        sourceModel.belongsTo(targetModel, { foreignKey: column_name });
        targetModel.hasMany(sourceModel, { foreignKey: column_name });

        //console.log(
        //  `Defined association: ${aliasSourceTable} belongs to ${aliasTargetTable} via ${column_name}`,
        //);
      } else {
        console.log(
          `Skipping existing association between ${aliasSourceTable} and ${aliasTargetTable}`,
        );
      }
    }
  }

  //console.log('Associations created for all models.');
}

export async function getInfoData(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
  select
    "group",
	  id,
	  type, 
	  SubType,
	  Campo,
	  "measurementUnit",
	  ValorHistoricoOpenwells,
	  ValorHistoricoFP2P,
	  ValorFinal, 
	  case when ValorHistoricoOpenwells = ValorHistoricoFP2P then null else Acciones end as Acciones,
	  Perforations,
	  Perforation,
	  rowid,
    case when uploadstate='raw' then 'updated' else 'saved' end as  state,
    uploadstate,
    path,
    action,
    key,
    idStandardElement
    FROM (
    select 
    'GENERAL' as group,
	ood.id,
	soods."name" as type, 
	'Default' as SubType,
	soodse."name" Campo,
	'' "measurementUnit",
	fieldmodule.openwellsvalue ValorHistoricoOpenwells,
	ood."value" ValorHistoricoFP2P,
	ood."value" ValorFinal, 
	'false' Acciones,
	'Default' as Perforations,
	'Default' as Perforation,
	fieldmodule.rowid ,
  fieldmodule.uploadstate,
  fieldmodule.path,
  fieldmodule.action,
  fieldmodule.key,
  null idStandardElement
	from 
	"oilfieldOperationsData" ood 
	inner join 
	"StandardOilfieldOperationsDataSectionElement" soodse 
	on ood."idStandardOilfieldOperationsDataSectionElement"  = soodse.id 
	inner join "StandardOilfieldOperationsDataSection" soods 
	on soods.id = soodse."idStandardOilfieldOperationsDataSection" 
	inner join 
	fieldmodule on 
	fieldmodule.tablerowid = ood.id::TEXT
	and fieldmodule.tablename  = 'oilfieldOperationsData' 
where ood."idOilfieldOperations" = ` +
    idOilFieldOperations +
    `
union all
select distinct 
'ARENAS' as group,
oos."idOilfieldOperations",
'Default' as type,
--CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY oos.id)) as TEXT)) as SubType,
--CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY fieldmodule.path, fieldmodule.parent)) as TEXT)) as SubType,
--CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY  fieldmodule.parent)) as TEXT)) as SubType,
--CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY split_part(fieldmodule.path::text, '//', 2))) as TEXT)) as SubType,
split_part(fieldmodule.path::text, '//', 2) as SubType,
soosa."name" Campo,
soosa."measurementUnit",
fieldmodule.openwellsvalue ValorHisoticoOpenwells,
oosa.value ValorHistoricoFP2P,
oosa.value ValorFinal,
'false' Acciones,
'Default'  Perforations,
'Default' as Perforation,
fieldmodule.rowid,
fieldmodule.uploadstate,
fieldmodule.path,
fieldmodule.action,
fieldmodule.key,
null idStandardElement
from 
--"OilfieldOperations" oo 
--left outer join 
--"OilfieldTypeOperations" oto  
--on oo."idOilfieldTypeOperations" = oto.id 
--left outer join 
--"Well" w 
--on oo."idWell" = w.id 
--left outer join 
--"Rig" r on 
--r.id = oo."idRig" 
--inner join 
"OilfieldOperationsSand" as oos 
--on oos."idOilfieldOperations"  = oo.id 
left outer join "OilfieldOperationsSandAttributes" oosa 
on oosa."idOilfieldOperationsSand"  = oos.id 
left outer join "StandardOilfieldOperationsSandAttributes" soosa 
on soosa.id = oosa."idStandardOilfieldOperationsSandAttributes"
--left outer join "OilfieldOperationsSandPerforation" oosp 
--on oosp."idOilfieldOperationsSand"  = oos.id 
inner join fieldmodule 
on fieldmodule.tablerowid  = oosa.id::text
and fieldmodule.tablename  = 'OilfieldOperationsSandAttributes'
where oos."idOilfieldOperations" = ` +
    idOilFieldOperations +
    `
union all
select distinct 
'ARENAS' as group,
oos."idOilfieldOperations",
'Default' as type, 
--CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY fieldmodule.path, fieldmodule.parent)) as TEXT)) as SubType,
--CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY split_part(fieldmodule.path::text, '//', 2))) as TEXT)) as SubType,
split_part(fieldmodule.path::text, '//', 2) as SubType,
--CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY fieldmodule.parent)) as TEXT)) as SubType,
soospa."name" Campo,
soospa."measurementUnit",
fieldmodule.openwellsvalue ValorHisoticoOpenwells,
oospa."value" ValorHistoricoFP2P,
oospa."value" ValorFinal, 
'false' Acciones,
--CONCAT('DISPARO: ',cast((DENSE_RANK() OVER (ORDER BY oosp.id)) as TEXT)) as Perforations,
CONCAT('DISPARO: ',cast((DENSE_RANK() OVER (ORDER BY split_part(fieldmodule.path::text, '//', 2), oosp.id)) as TEXT)) as Perforations,
--CONCAT('DISPARO: ',cast((DENSE_RANK() OVER (ORDER BY fieldmodule.parent)) as TEXT)) as Perforations,
'DISPAROS' as Perforation,
fieldmodule.rowid,
fieldmodule.uploadstate,
fieldmodule.path,
fieldmodule.action,
fieldmodule.key,
null idStandardElement
from 
"OilfieldOperationsSand" as oos 
left outer join "OilfieldOperationsSandPerforation" oosp 
on oosp."idOilfieldOperationsSand"  = oos.id 
left outer join "OilfieldOperationsSandPerforationAttributes" oospa  
on oospa."idOilfieldOilfieldOperationsSandPerforation"  = oosp.id 
left outer join "StandardOilfieldOperationsSandPerforationAttributes" soospa 
on soospa.id = oospa."idStandardOilfieldOperationsSandPerforationAttributes" 
inner join fieldmodule 
on fieldmodule.tablerowid  = oospa.id::TEXT
and fieldmodule.tablename  = 'OilfieldOperationsSandPerforationAttributes'
where oos."idOilfieldOperations" = ` +
    idOilFieldOperations +
    `
union
---------------------------------
select
"group",
"idOilfieldOperations",
equipmentdata.type,--adds the last part of the path because it contains an id, that its used on the front end to group the equipments in different sections, but then it is removed on the front end so it is not displayed. 
--concat('FPTP Description: ', get_infrastructure_element_description_name_fp2p(fieldmodule.parent),'<br> Openwells Description: ',SubType,'|~|', (regexp_split_to_array(fieldmodule.path, '//'))[
--    array_length(regexp_split_to_array(fieldmodule.path, '//'), 1)
--] ) as SubType,
concat('FPTP Description: ',fptopdesc.value,'<br> Openwells Description: ',fptopdesc.openwellsvalue,'|~|', (regexp_split_to_array(fieldmodule.path, '//'))[
    array_length(regexp_split_to_array(fieldmodule.path, '//'), 1)
] ) as SubType,
Campo,
"measurementUnit",
fieldmodule.openwellsvalue ValorHistoricoOpenwells,
ValorHistoricoFP2P,
ValorFinal,
Acciones,
Perforations,
Perforation,
fieldmodule.rowid,
fieldmodule.uploadstate,
fieldmodule.path,
fieldmodule.action, 
fieldmodule.key,
null idStandardElement
from (
SELECT
    'EQUIPOS' as group,
    whie."idOilfieldOperations",
    swit.description as type,
    --concat(whie."openWellsDescription",'|~|', cast((DENSE_RANK() OVER (ORDER BY whie.id)) as TEXT)) as SubType,
    whie."openWellsDescription" as SubType,
    unpvt.Campo,
    '' as "measurementUnit",
    '' ValorHistoricoOpenwells,
    cast(unpvt.value as text) ValorHistoricoFP2P ,
    cast(unpvt.value as text) ValorFinal ,
    'false' as Acciones,
    'Default' as Perforations,
    'Default' as Perforation,
    whie.id id
FROM public."WellHistoricalInfrastructureElements" whie
JOIN public."StandardWellInfrastructureType" swit 
    ON whie."idStandardWellInfrastructureType" = swit.id
CROSS JOIN LATERAL (
    VALUES 
        ('mdTop', whie."mdTop"),
        ('mdBase', whie."mdBase"),
        ('quantity', whie."quantity")
) as unpvt(Campo, value) 
where whie."idOilfieldOperations" = ` +
    idOilFieldOperations +
    `
) equipmentdata
inner join fieldmodule 
on fieldmodule.tablerowid  = equipmentdata.id::text
and fieldmodule.tablename  = 'WellHistoricalInfrastructureElements'
and campo = fieldmodule.propertyname 
 left outer join fieldmodule fptopdesc
on fptopdesc.parent = fieldmodule.parent 
and fptopdesc.key = 'catalog_key_desc'
where fieldmodule.path like 'ensamble%'
union 
select
'EQUIPOS' as group,   
whie."idOilfieldOperations",
swit."description" as type,
--whie."openWellsDescription" as SubType,
concat('FPTP Description: ',fptopdesc.value,'<br> Openwells Description: ',fptopdesc.openwellsvalue,'|~|', (regexp_split_to_array(fieldmodule.path, '//'))[
    array_length(regexp_split_to_array(fieldmodule.path, '//'), 1)
] ) as SubType,
sa.name Campo,
--se.name,
'' as "measurementUnit",
fieldmodule.openwellsvalue ValorHisoticoOpenwells,
sao.value,
sao.value,
'false' as Acciones,
'Default' as Perforations,
'Default' as Perforation,
fieldmodule.rowid rowid,
fieldmodule.uploadstate uploadstate,
null path,
fieldmodule.action action,
fieldmodule.key,
se.id::TEXT idStandardElement
FROM public."WellHistoricalInfrastructureElements" whie
JOIN public."StandardWellInfrastructureType" swit ON whie."idStandardWellInfrastructureType" = swit.id
JOIN public."WellHistoricalInfrastructureElementsDetail" whied ON whie.id = whied."idWellHistoricalInfrastructureElements"
JOIN public."StandardAttributes" sa ON whied."idStandardAttributes" = sa.id
left outer join public."StandardAttributeOptions" sao ON whied."idStandardAttributeOptions" = sao.id
JOIN public."StandardElements" se ON whie."idStandardElements" = se.id
LEFT OUTER JOIN public."StandardCondition" sc ON whie."idCondition" = sc.id
LEFT JOIN public."StandardCouplingCondition" scc ON whie."idCouplingCondition" = scc.id
join fieldmodule on fieldmodule.tablerowid::text = whied.id::text
left outer join fieldmodule fptopdesc
on fptopdesc.parent = fieldmodule.parent 
and fptopdesc.key = 'catalog_key_desc'
where fieldmodule.idoilfieldoperations::text  = whie."idOilfieldOperations"::text
and whie."idOilfieldOperations" = ` +
    idOilFieldOperations +
    `
  and fieldmodule.path like 'ensamble%'
) AS MYDATA
 order by "group", type, subtype, campo
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function getSandsStandardAttributes(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
       select
       'GENERAL' as group, 
ood.id,
soods."name" as type, 
'Default' as SubType,
soodse."name" Campo,
'' "measurementUnit",
'' ValorHistoricoOpenwells,
ood."value" ValorHistoricoFP2P,
ood."value" ValorFinal, 
'false' Acciones,
'Default' as Perforations,
'Default' as Perforation
from 
"oilfieldOperationsData" ood 
inner join 
"StandardOilfieldOperationsDataSectionElement" soodse 
on ood."idStandardOilfieldOperationsDataSectionElement"  = soodse.id 
inner join "StandardOilfieldOperationsDataSection" soods 
on soods.id = soodse."idStandardOilfieldOperationsDataSection" 
where ood."idOilfieldOperations" = ` +
    idOilFieldOperations +
    `
union all
select distinct 
'Sands' as group,
oo.id,
'ARENAS' as type,
CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY oos.id)) as TEXT)) as SubType,
soosa."name" Campo,
soosa."measurementUnit",
'' ValorHisoticoOpenwells,
oosa.value ValorHistoricoFP2P,
oosa.value ValorFinal,
'false' Acciones,
'Default'  Perforations,
'Default' as Perforation
from 
"OilfieldOperations" oo 
left outer join 
"OilfieldTypeOperations" oto  
on oo."idOilfieldTypeOperations" = oto.id 
left outer join 
"Well" w 
on oo."idWell" = w.id 
left outer join 
"Rig" r on 
r.id = oo."idRig" 
left outer join "OilfieldOperationsSand" as oos 
on oos."idOilfieldOperations"  = oo.id 
left outer join "OilfieldOperationsSandAttributes" oosa 
on oosa."idOilfieldOperationsSand"  = oos.id 
left outer join "StandardOilfieldOperationsSandAttributes" soosa 
on soosa.id = oosa.id 
left outer join "OilfieldOperationsSandPerforation" oosp 
on oosp."idOilfieldOperationsSand"  = oos.id 
where ood."idOilfieldOperations" = ` +
    idOilFieldOperations +
    `
union all
select distinct 
"Sands" as group,
oo.id,
'ARENAS' as type, 
CONCAT('ARENA ',cast((DENSE_RANK() OVER (ORDER BY oos.id)) as TEXT)) as SubType,
soospa."name" Campo,
soospa."measurementUnit",
'' ValorHisoticoOpenwells,
oospa."value" ValorHistoricoFP2P,
oospa."value" ValorFinal, 
'false' Acciones,
CONCAT('DISPARO ',cast((DENSE_RANK() OVER (ORDER BY oosp.id)) as TEXT)) as Perforations,
'DISPAROS' as Perforation
from 
"OilfieldOperations" oo 
left outer join 
"OilfieldTypeOperations" oto  
on oo."idOilfieldTypeOperations" = oto.id 
left outer join 
"Well" w 
on oo."idWell" = w.id 
left outer join 
"Rig" r on 
r.id = oo."idRig" 
left outer join "OilfieldOperationsSand" as oos 
on oos."idOilfieldOperations"  = oo.id 
left outer join "OilfieldOperationsSandAttributes" oosa 
on oosa."idOilfieldOperationsSand"  = oos.id 
left outer join "StandardOilfieldOperationsSandAttributes" soosa 
on soosa.id = oosa.id 
left outer join "OilfieldOperationsSandPerforation" oosp 
on oosp."idOilfieldOperationsSand"  = oos.id 
left outer join "OilfieldOperationsSandPerforationAttributes" oospa  
on oospa."idOilfieldOilfieldOperationsSandPerforation"  = oosp.id 
left outer join "StandardOilfieldOperationsSandPerforationAttributes" soospa 
on soospa.id = oospa."idStandardOilfieldOperationsSandPerforationAttributes"
where ood."idOilfieldOperations" = ` +
    idOilFieldOperations +
    ` 
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function getLastUpdateDateUser(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
      SELECT TO_CHAR(f.modifyDate, 'YYYY-MM-DD HH24:MI') as  modifyDate,(select concat("firstName",' ',"lastName") from "Users" where id::character = f.modifiedby::character) modifiedby
FROM fieldmodule f 
where modifydate is not null 
and f.idoilfieldoperations ='` +
    idOilFieldOperations +
    `'
ORDER BY modifyDate desc
LIMIT 1;        
    `;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function deleteByIdOilfieldOperations(
  idOilFieldOperations: string | null,
): Promise<string> {
  if (!idOilFieldOperations) {
    throw new Error('idOilFieldOperations cannot be null');
  }
  //console.log('deleteByIdOilfieldOperations');
  const infoDataQuery =
    `
      delete 
      FROM fieldmodule f 
where  f.idoilfieldoperations ='` +
    idOilFieldOperations +
    `';        
    `;

  await postgres_sequelize.query(infoDataQuery, {
    replacements: { id: idOilFieldOperations },
    type: QueryTypes.DELETE,
  });

  return 'DELETED';
}

export async function getElements(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
WITH equipmentData AS (
  select 
groups,
groupstallyrighttable,
ROW_NUMBER() OVER (PARTITION BY concat("groups",descripcion, element_id,"tallyGroup") ORDER BY "groups","tallyGroupParent" desc,"ElementTally.quantity" desc ) AS groupRowNumberTally,
ROW_NUMBER() OVER (PARTITION BY concat(case when "tallyGroupParent" is null then 1 else 2 end,groupstallyrighttable) ORDER BY  "ElementTally.sequence_number" ) groupsrightdisplaybutton,
ROW_NUMBER() OVER (PARTITION BY concat("groups",descripcion, element_id,"tallyGroup") ORDER BY "groups","tallyGroupParent" desc,"ElementTally.quantity" desc ) AS groupRowNumber,
ROW_NUMBER() OVER (PARTITION BY concat("groups",descripcion,"idElementRelease") ORDER BY "groups","tallyGroupParent" desc,"ElementTally.quantity" desc ) AS groupRowNumberlefttablefilter,
concat(type , DENSE_RANK() OVER (ORDER BY concat("groups",descripcion))) AS groupId,
'1' AS newrowid,
"idOilfieldOperations",
"tally_id",
type,
--(coalesce("descripcion",'') ||' SN: '||COALESCE("serial",'N/A')||' '||COALESCE(concat('(',"condition",')'),'')) 
public.report_description_like_tally("idElementRelease") descripcionConcat,
--(coalesce("descripcion",'') ||' SN: '||COALESCE("serial",'N/A')||' '||COALESCE("("+"condition"+")",'')) descripcionConcat,
descripcion,
"Cantidad enviada",
"idElementRelease",
Documentos,
filepath,
filename,
fileid,
"Cantidad recibida",
Acciones,
"ElementTally.length",--Medida,
idElementTally,
idestado as "Release.idReleaseState",
estado,
estado_original,
idReleaseState,
idestado,
"idRelease",
"ElementRelease.availablequantity",
"CantidadParaElPozos_original",
"idCantidadParaElPozos",
"ElementTally.quantity",--CatidadEnPozo",
"CatidadEnPozo_original",
"idElementTally",
--"ElementTally.sequence_number",--"orden",
--case when parentsequencenumber is not null then
--parentsequencenumber+ROW_NUMBER() OVER (ORDER BY
--    COALESCE("ElementTally.sequence_number", 999999),
--    descripcion
--  )/100.0
--  else
--ROW_NUMBER() OVER (ORDER BY
--    COALESCE("ElementTally.sequence_number", 999999),
--    descripcion
--  ) end  AS "ElementTally.sequence_number",
"ElementTally.sequence_number" as "ElementTally.sequence_number",
"ElementRelease.approvalStatus",
--"orden_original",
--foer.id,
itemid,
"tallyGroupParent",
"tallyGroup",
case when "tallyGroupParent" is null then (select sum(length) from "ElementTally" et where "tallyGroupParent" = equipmentData."tallyGroup") end  medidatotal,
"showInTally"
from
(
SELECT
er."idCondition",
er."serial",
oo.id as "idOilfieldOperations",
tally.id  as tally_id,
r.id as "idRelease",
--sbl."name"  as type,
-- if there is a row in the fieldmodule it is infered that this is a historical element, and so it must be grouped as such on the screen 3       
case when fieldmodule.elementreleaserowid  is not null then 'Historical' else sbl."name" end as type,
case when sbl.id != 4 then er.id else
er."idRelease" + case when se."groupForWellhead" is true then 100000000 else er."idStandardElements" end
end as groups, -- si no es 4, se agrupa por er.id , si e 4, se agrupa por idRelease, luego por idStandardElements (regla quemada, todo lo que se agrupa tendra una sola cantidad = donde el idStandardElement = 30 tomar er.quantity )
case when sbl.id != 4 then concat(er.id::text,et.id::text) else
concat(er."idRelease"::text , case when se."groupForWellhead" is true then '100000000' else er."idStandardElements"::text end)
end as groupstallyrighttable,-- si no es 4, se agrupa por er.id , si e 4, se agrupa por idRelease, luego por idStandardElements (regla quemada, todo lo que se agrupa tendra una sola cantidad = donde el idStandardElement = 30 tomar er.quantity )
sbl.id idStandarBussinesLine,
"pecDescription"  as descripcion,
er.quantity as "Cantidad enviada",
er.id "idElementRelease",
sf."fileName"  as Documentos,
sf."filePath" filepath,
sf."fileName" filename,
sf."id" fileid,
'' as "Cantidad recibida",
'' as Acciones,
et.length as "ElementTally.length",--Medida,
er."approvalStatus" as "ElementRelease.approvalStatus",--Medida,
et.id as idElementTally,
rs."name"  as estado,
rs."name"  as estado_original,
rs.id as idReleaseState,
rs.id as idestado,
coalesce(er.availablequantity, er.quantity)  as "ElementRelease.availablequantity",
er.quantity  as "CantidadParaElPozos_original",
er.id as "idCantidadParaElPozos",
COALESCE(et.quantity,0) as "ElementTally.quantity",--CatidadEnPozo",
COALESCE(et.quantity, 0) as "CatidadEnPozo_original",
et.id as "idElementTally",
et.sequence_number as "ElementTally.sequence_number",--"orden",
et.sequence_number as "orden_original",
et."tallyGroupParent",
et.element_id,
et."tallyGroup",
(select  "sequence_number" from "ElementTally" et1 where et."tallyGroupParent" = et1."tallyGroup") parentsequencenumber,
--foer.id,
sf.id itemid,
se."showInTally" as "showInTally"
from public."OilfieldOperations" oo
left outer join "Tally" tally
on oo.id = tally."idOilfieldOperations"
join  public."Release" r
on r."idOilfieldOperations"  = oo.id
join public."ElementRelease" er
on er."idRelease"  = r.id
JOIN public."StandardCondition" sc ON er."idCondition" = sc.id
left join "ElementTally" et on et.element_id = er.id
and et.tally_id = tally.id
left outer join "StandardElements" se on
se.id = er."idStandardElements"
LEFT JOIN public."StandardCouplingCondition" scc ON scc.id = er."idCouplingCondition"
LEFT JOIN public."FilesOfElementsRelease" foer ON foer."idElementRelease" = er.id
LEFT JOIN public."StoredFiles" sf ON sf.id = foer."idStoredFiles"
LEFT JOIN public."StandardElementsRequiredFiles" serf ON serf.id = foer."idStandardElementsRequiredFiles"
LEFT JOIN public."StandardBusinessLines" sbl ON r."idBusinessLine" = sbl.id
LEFT JOIN public."ReleaseState" rs ON r."idReleaseState" = rs.id
left outer join fieldmodule on
fieldmodule.elementreleaserowid::TEXT= er.id::TEXT
and fieldmodule.key = 'catalog_key_desc'
WHERE oo."id" = ` +
    idOilFieldOperations +
    `
and "idReleaseState" = 4 --- Necesito los que ya fueron aprobados y necesita mostrarse en campo
) as equipmentData
left outer join "StandardCondition" sc2
on sc2.id = "idCondition"
--AND r."idOilfieldOperations" = idOilFielOperations ----- Necesito del OilfieldOperations que estoy revisando, por ejemplo el CHSA-001 WO#4 tiene 1 solo OilfieldOperations
)

SELECT 
  groups,
groupstallyrighttable,
groupRowNumberTally,
groupsrightdisplaybutton,
groupRowNumber,
groupRowNumberlefttablefilter,
groupId,
"idOilfieldOperations",
newrowid,
"tally_id",
type,
descripcionConcat,
descripcion,
"Cantidad enviada",
"idElementRelease",
Documentos,
filepath,
filename,
fileid,
"Cantidad recibida",
Acciones,
"ElementTally.length",--Medida,
idElementTally,
idestado as "Release.idReleaseState",
estado,
estado_original,
idReleaseState,
idestado,
"idRelease",
"ElementRelease.availablequantity",
"CantidadParaElPozos_original",
"idCantidadParaElPozos",
"ElementTally.quantity",--CatidadEnPozo",
"CatidadEnPozo_original",
"idElementTally",
 "ElementTally.sequence_number",
"ElementRelease.approvalStatus",
itemid,
"tallyGroupParent",
"tallyGroup",
medidatotal,
ed."showInTally",
  (
    SELECT STRING_AGG(ed2.filename, ' ' ORDER BY ed2.filename)
    FROM equipmentData ed2
    WHERE ed2.groupId = ed.groupId
  ) AS documentos_concatenados
FROM equipmentData ed;
`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function getTallyElements(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  const infoDataQuery =
    `
select 
groups,
groupstallyrighttable,
"group",
ROW_NUMBER() OVER (PARTITION BY concat(case when "tallyGroupParent" is null then 1 else 2 end,groupstallyrighttable) ORDER BY  "ElementTally.sequence_number" ) groupsrightdisplaybutton, 
ROW_NUMBER() OVER (PARTITION BY concat(case when "tallyGroupParent" is null then 1 else 2 end,groups) ORDER BY  "ElementTally.sequence_number" ) groupsdisplaybutton,
ROW_NUMBER() OVER (PARTITION BY concat("groups",descripcion, element_id,"tallyGroup") ORDER BY "groups","tallyGroupParent" desc,"ElementTally.quantity" desc ) AS groupRowNumberTally, 
ROW_NUMBER() OVER (PARTITION BY concat("groups",descripcion, element_id,"tallyGroup") ORDER BY "groups","tallyGroupParent" desc,"ElementTally.quantity" desc ) AS groupRowNumber, 
ROW_NUMBER() OVER (PARTITION BY concat("groups",descripcion,"idElementRelease") ORDER BY "groups","tallyGroupParent" desc,"ElementTally.quantity" desc ) AS groupRowNumberlefttablefilter, 
concat(type , DENSE_RANK() OVER (ORDER BY concat("groups",descripcion))) AS groupId,  
'1' AS newrowid,
"idOilfieldOperations",
"tally_id", 
type, 
--(coalesce("descripcion",'') ||' SN: '||COALESCE("serial",'N/A')||' '||COALESCE(concat('(',"condition",')'),'')) 
public.report_description_like_tally("idElementRelease") descripcionConcat,      
--(coalesce("descripcion",'') ||' SN: '||COALESCE("serial",'N/A')||' '||COALESCE("("+"condition"+")",'')) descripcionConcat,
descripcion, 
"Cantidad enviada",
"idElementRelease",
--Documentos, 
--filepath,
--filename,
--fileid,
"Cantidad recibida",
Acciones,  
"ElementTally.length",--Medida,
idElementTally,
idestado as "Release.idReleaseState",
estado,
estado_original,
idReleaseState,
idestado,
"idRelease",
"ElementRelease.availablequantity",
"CantidadParaElPozos_original",
"idCantidadParaElPozos",
"ElementTally.quantity",--CatidadEnPozo",
"CatidadEnPozo_original",
"idElementTally", 
--"ElementTally.sequence_number",--"orden",
--case when parentsequencenumber is not null then 
--parentsequencenumber+ROW_NUMBER() OVER (ORDER BY 
--    COALESCE("ElementTally.sequence_number", 999999), 
--    descripcion
--  )/100.0
--  else 
----ROW_NUMBER() OVER (ORDER BY 
----    COALESCE("ElementTally.sequence_number", 999999), 
----    descripcion
----  )
-- "ElementTally.sequence_number"
--  end  AS "ElementTally.sequence_number2",
  "ElementTally.sequence_number" as "ElementTally.sequence_number",
"ElementRelease.approvalStatus",
"orden_original",
--foer.id,
--itemid,
"tallyGroupParent",
"tallyGroup",
case when "tallyGroupParent" is null then (select sum(length) from "ElementTally" et where "tallyGroupParent" = equipmentData."tallyGroup") end  medidatotal
from
(
SELECT 
er."idCondition",
er."serial",
oo.id as "idOilfieldOperations",
tally.id  as tally_id,
r.id as "idRelease",
--sbl."name"  as type,  
-- if there is a row in the fieldmodule it is infered that this is a historical element, and so it must be grouped as such on the screen 3 
case when fieldmodule.elementreleaserowid  is not null then 'Historical' else sbl."name" end as type,  
case when sbl.id != 4 then er.id else 
er."idRelease" + case when se."groupForWellhead" is true then 100000000 else er."idStandardElements" end
end as groups, -- si no es 4, se agrupa por er.id , si e 4, se agrupa por idRelease, luego por idStandardElements (regla quemada, todo lo que se agrupa tendra una sola cantidad = donde el idStandardElement = 30 tomar er.quantity )
case when sbl.id != 4 then concat(er.id::text,et.id::text) else
concat(er."idRelease"::text , case when se."groupForWellhead" is true then '100000000' else er."idStandardElements"::text end)
end as groupstallyrighttable,
et.group as "group",
sbl.id idStandarBussinesLine, 
"pecDescription"  as descripcion, 
er.quantity as "Cantidad enviada",
er.id "idElementRelease",
--sf."fileName"  as Documentos, 
--sf."filePath" filepath,
--sf."fileName" filename,
--sf."id" fileid,
'' as "Cantidad recibida",
'' as Acciones,  
et.length as "ElementTally.length",--Medida,
er."approvalStatus" as "ElementRelease.approvalStatus",--Medida,
et.id as idElementTally,
rs."name"  as estado,
rs."name"  as estado_original,
rs.id as idReleaseState,
rs.id as idestado,
coalesce(er.availablequantity,er.quantity)  as "ElementRelease.availablequantity",
er.quantity  as "CantidadParaElPozos_original",
er.id as "idCantidadParaElPozos",
COALESCE(et.quantity,0) as "ElementTally.quantity",--CatidadEnPozo",
COALESCE(et.quantity, 0) as "CatidadEnPozo_original",
et.id as "idElementTally", 
et.sequence_number as "ElementTally.sequence_number",--"orden",
et.sequence_number as "orden_original",
et."tallyGroupParent",
et.element_id,
et."tallyGroup",
(select  "sequence_number" from "ElementTally" et1 where et."tallyGroupParent" = et1."tallyGroup") parentsequencenumber
--foer.id,
--sf.id itemid
from public."OilfieldOperations" oo
left outer join "Tally" tally 
on oo.id = tally."idOilfieldOperations"
join  public."Release" r 
on r."idOilfieldOperations"  = oo.id 
join public."ElementRelease" er
on er."idRelease"  = r.id 
JOIN public."StandardCondition" sc ON er."idCondition" = sc.id
left join "ElementTally" et on et.element_id = er.id 
and et.tally_id = tally.id
left outer join "StandardElements" se on
se.id = er."idStandardElements"
LEFT JOIN public."StandardCouplingCondition" scc ON scc.id = er."idCouplingCondition"
--LEFT JOIN public."FilesOfElementsRelease" foer ON foer."idElementRelease" = er.id
--LEFT JOIN public."StoredFiles" sf ON sf.id = foer."idStoredFiles"
--LEFT JOIN public."StandardElementsRequiredFiles" serf ON serf.id = foer."idStandardElementsRequiredFiles"
LEFT JOIN public."StandardBusinessLines" sbl ON r."idBusinessLine" = sbl.id
LEFT JOIN public."ReleaseState" rs ON r."idReleaseState" = rs.id
left outer join fieldmodule on 
fieldmodule.elementreleaserowid::TEXT= er.id::TEXT
and fieldmodule.key = 'catalog_key_desc'
WHERE oo."id" = ` +
    idOilFieldOperations +
    `
and "idReleaseState" = 4 --- Necesito los que ya fueron aprobados y necesita mostrarse en campo
) as equipmentData
left outer join "StandardCondition" sc2 
on sc2.id = "idCondition"
--where "ElementTally.quantity">0 
--and "tallyGroupParent" is null 
where 
"ElementRelease.approvalStatus" is true 
`;

  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });

  return infoData;
}

export async function getEquipmentsOptions(): Promise<InfoData[]> {
  //console.log();
  const infoDataQuery = 'select * from "v_standard_element_attributes"';
  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });
  //console.log('getEquipmentsOptions', infoData);
  return infoData;
}

export async function getReports(
  idOilFieldOperations: string | null,
): Promise<InfoData[]> {
  //console.log();
  const infoDataQuery =
    `
    select 
    id,
    "fileName",
    "filePath",
    size,
    "fileExtension"
    from "StoredFiles" sf 
    where "fileExtension" =concat('` +
    idOilFieldOperations +
    `','/xlsx')
    `;
  const infoData: InfoData[] = await postgres_sequelize.query(infoDataQuery, {
    type: QueryTypes.SELECT,
  });
  //console.log('getEquipmentsOptions', infoData);
  return infoData;
}

export async function updateRows(
  idOilFieldOperations: string,
  updatedRows: {
    rowid: string | null;
    valorfinal: string;
    state?: string; // Assuming 'state' is part of the object
    type?: string;
    key?: string;
    path?: string;
    tableName?: string;
    propertyName?: string;
    referenceTable?: string;
    referenceProperty?: string;
    openwellsvalue?: string;
    parent?: string | null;
    action: boolean;
  }[],
  userid: string | null,
): Promise<void> {
  try {
    const updatePromises = updatedRows.map(async row => {
      const {
        rowid,
        valorfinal,
        state,
        type,
        key,
        path,
        tableName,
        propertyName,
        referenceTable,
        referenceProperty,
        openwellsvalue,
        parent,
        action,
      } = row;

      //if (rowid === null && state === 'new') {
      if (state === 'new') {
        //console.log('updatedRows sent', updatedRows);
        // INSERT if rowid is null and state is 'new'
        const insertQuery = `
          INSERT INTO fieldmodule 
          (rowid, parent, idoilfieldoperations, type, key, value, path, tableName, propertyName, referenceTable, referenceProperty, openwellsvalue, uploadState, modifiedby, action) 
          VALUES 
          (:newRowId, :parent, :idOilFieldOperations, :type, :key, :valorfinal, :path, :tableName, :propertyName, :referenceTable, :referenceProperty, :openwellsvalue, 'new', :userid, :action)
        `;

        await postgres_sequelize.query(insertQuery, {
          type: QueryTypes.INSERT,
          replacements: {
            newRowId: uuidv4(),
            parent: parent ?? null,
            idOilFieldOperations,
            type,
            key,
            valorfinal,
            path,
            tableName,
            propertyName,
            referenceTable,
            referenceProperty,
            openwellsvalue,
            userid,
            action: action ?? null,
          },
        });
        //const userid = 2;
        //await processRows(idOilFieldOperations);
      } else if (state === 'delete') {
        // DELETE other rows with same path/key but different rowid
        const deleteQuery = `
          DELETE FROM fieldmodule
          WHERE rowid = :rowid
          AND idOilFieldOperations = :idOilFieldOperations
        `;

        await postgres_sequelize.query(deleteQuery, {
          type: QueryTypes.DELETE,
          replacements: { rowid, idOilFieldOperations },
        });
      } else {
        // UPDATE existing row
        let updateQuery = '';
        if (key?.includes('Attributes')) {
          updateQuery = `
                          UPDATE fieldmodule
                             SET value = (
                                                  SELECT sao.value
                                                  FROM "StandardAttributeOptions" sao
                                                  WHERE sao.value = :valorfinal
                                                  and sao."idStandardAttribute"::text = SPLIT_PART(key, '_', 2)::text
                                              ),
                                    key = CONCAT('Attributes_',SPLIT_PART(key, '_', 2)::TEXT,'_',(
                                                  SELECT sao.id
                                                  FROM "StandardAttributeOptions" sao
                                                  WHERE sao.value = :valorfinal
                                                  and sao."idStandardAttribute"::text = SPLIT_PART(key, '_', 2)::text
                                              )),
                                  uploadstate = 'saved',
                                  modifiedby = :userid,
                                  action = :action
                              WHERE rowid = :rowid
                              AND idOilFieldOperations = :idOilFieldOperations
                            `;
        } else {
          updateQuery = `
                    UPDATE fieldmodule
                    SET value = :valorfinal,
                        uploadstate = 'saved',
                        modifiedby = :userid,
                        action = :action
                    WHERE rowid = :rowid
                    AND idOilFieldOperations = :idOilFieldOperations
                  `;
        }

        await postgres_sequelize.query(updateQuery, {
          type: QueryTypes.UPDATE,
          replacements: {
            rowid,
            valorfinal,
            idOilFieldOperations,
            userid,
            action: action ?? null,
          },
        });
      }
    });

    await postgres_sequelize.query(
      'CALL insert_oilfield_operations_data_by_property_name(:idOilFieldOperations);',
      {
        replacements: { idOilFieldOperations },
        type: QueryTypes.RAW,
      },
    );

    await postgres_sequelize.query(
      'CALL insert_oilfield_operations_sand_data(:idOilFieldOperations);',
      {
        replacements: { idOilFieldOperations },
        type: QueryTypes.RAW,
      },
    );

    await postgres_sequelize.query(
      'CALL insert_well_historical_infrastructure_elements(:userid, :idOilFieldOperations);',
      {
        replacements: { idOilFieldOperations, userid },
        type: QueryTypes.RAW,
      },
    );

    /*await postgres_sequelize.query(
      'CALL insert_oilfield_operations_perforation_data(:idOilFieldOperations);',
      {
        replacements: { idOilFieldOperations },
        type: QueryTypes.RAW,
      },
    );
    */
    await postgres_sequelize.query(
      'CALL update_all_fieldmodule_paths(:idOilFieldOperations);',
      {
        replacements: { idOilFieldOperations },
        type: QueryTypes.RAW,
      },
    );

    await postgres_sequelize.query(
      'CALL deduplicate_fieldmodule_paths(:idOilFieldOperations);',
      {
        replacements: { idOilFieldOperations },
        type: QueryTypes.RAW,
      },
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Cannot save updateRows because', error);
  }
}

export async function updateFields(
  updatedRows: {
    idRow: string | null; // Allow idRow to be null
    tableName: string;
    fieldName: string;
    newValue: string;
    idOilfieldOperations: string; // New field
    tally_id: string | null; // Allow tally_id to be null
    idElementRelease: string; // Element ID
    sequence_number: number; // Sequence number
    group: string;
  }[],
  userid: string | null,
): Promise<void> {
  //console.log('updateFields');
  try {
    const uuidv4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let newTallyId: any;

    //sort so that the inserts go according to the sequence number of the screen 3 order
    updatedRows.sort((a, b) => a.sequence_number - b.sequence_number);

    for (const row of updatedRows) {
      const {
        idRow,
        idElementRelease,
        fieldName,
        tableName,
        newValue,
        idOilfieldOperations,
        tally_id,
        sequence_number,
        group,
      } = row;
      if (tally_id) {
        newTallyId = tally_id;
      }
      console.log('uuidv4Regex.test(tally_id)', idRow, group);
      if (
        (!idRow || (idRow && uuidv4Regex.test(idRow))) &&
        tableName === 'ElementTally' &&
        Number(newValue) > 0
      ) {
        if (!tally_id && !newTallyId) {
          const insertTallyQuery = `
            INSERT INTO "Tally" (id,"idOilfieldOperations")
            VALUES ((select max(id)+1 from "Tally" et),:idOilfieldOperations)
            RETURNING id;`;
          const result: any = await postgres_sequelize.query(insertTallyQuery, {
            type: QueryTypes.INSERT,
            replacements: { idOilfieldOperations },
          });
          if (
            Array.isArray(result) &&
            result.length > 0 &&
            result[0].length > 0
          ) {
            newTallyId = result[0][0].id;
            //console.log('newTallyId', newTallyId, result);
          } else {
            throw new Error('Failed to insert tally and retrieve ID.');
          }
        }

        const insertElementTallyQuery = `
          INSERT INTO "ElementTally" ( element_id, tally_id, quantity, sequence_number, "group")
          VALUES (:idElementRelease, :newTallyId, :newValue, :sequence_number, :group);`;
        await postgres_sequelize.query(insertElementTallyQuery, {
          type: QueryTypes.INSERT,
          replacements: {
            idElementRelease,
            newTallyId,
            newValue,
            sequence_number,
            group,
          },
        });
      } else {
        if (
          tableName === 'ElementTally' &&
          fieldName === 'quantity' &&
          Number(newValue) === 0
        ) {
          const deleteQuery = `DELETE FROM "${tableName}" WHERE id = :idRow`;
          await postgres_sequelize.query(deleteQuery, {
            type: QueryTypes.DELETE,
            replacements: { idRow },
          });
        } else {
          const updateQuery = `UPDATE "${tableName}" SET "${fieldName}" = :newValue WHERE id = :idRow`;
          await postgres_sequelize.query(updateQuery, {
            type: QueryTypes.UPDATE,
            replacements: { newValue, idRow },
          });
          if (tableName === 'ElementTally') {
            const updateQuery = `delete from "${tableName}" WHERE id = :idRow and quantity = 0`;
            await postgres_sequelize.query(updateQuery, {
              type: QueryTypes.UPDATE,
              replacements: { newValue, idRow },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Cannot save because:', error);
  }
}

export function getRelatedModelsForTable(
  baseTableName: string,
): ModelStatic<Model<any>>[] {
  const model = postgres_sequelize.models[baseTableName];
  const relatedModels: ModelStatic<Model<any>>[] = [];

  if (model) {
    for (const association of Object.values(model.associations)) {
      //console.log('association', association);
      relatedModels.push(association.target as ModelStatic<Model<any>>);
    }
  }
  //console.log('relatedModels    d', relatedModels);
  return relatedModels;
}

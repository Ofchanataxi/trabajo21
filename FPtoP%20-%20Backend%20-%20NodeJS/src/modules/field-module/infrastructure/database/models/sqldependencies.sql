
create TABLE fieldModule (
    rowId UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent UUID,
    "idOilfieldOperations" serial4,
    type VARCHAR(255),
    key VARCHAR(255),
    value TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modifyDate TIMESTAMP WITH TIME ZONE,
    tableName VARCHAR(255),
    propertyName VARCHAR(255),
    referenceTable VARCHAR(255),
    referenceProperty VARCHAR(255),
    path varchar(255)
); 


ALTER TABLE fieldModule
ADD COLUMN modifiedBy VARCHAR(255);

ALTER TABLE fieldModule
ADD COLUMN uploadState VARCHAR(255);

ALTER TABLE fieldModule 
ALTER COLUMN modifyDate 
SET DEFAULT NOW();



CREATE OR REPLACE FUNCTION update_modify_date_and_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Update modifyDate and modifiedBy only if specific columns change
  IF NEW.value IS DISTINCT FROM OLD.value OR
     NEW.key IS DISTINCT FROM OLD.key THEN
    NEW.modifyDate = NOW();
    NEW.modifiedBy = current_user; -- Capture the user who performed the update
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;




DROP TRIGGER IF EXISTS set_modify_date ON fieldModule;

CREATE TRIGGER set_modify_date
BEFORE UPDATE ON fieldModule
FOR EACH ROW
EXECUTE FUNCTION update_modify_date_and_user();


CREATE OR REPLACE FUNCTION get_property_id_field_module(
    table_name TEXT,
    column_name TEXT,
    value TEXT,
    additional_filters JSONB DEFAULT '{}'::JSONB
)
RETURNS BIGINT AS $$
DECLARE
    query TEXT;
    condition TEXT;
    result_id BIGINT;
    key TEXT;
    filter_value TEXT;
BEGIN
    -- Start building the base query
    query := 'SELECT id FROM ' || quote_ident(table_name) || 
             ' WHERE ' || quote_ident(column_name) || ' = $1';

    -- Add additional filters dynamically
    IF additional_filters IS NOT NULL THEN
        FOR key, filter_value IN SELECT * FROM jsonb_each_text(additional_filters) LOOP
            query := query || ' AND ' || quote_ident(key) || ' = ' || quote_literal(filter_value);
        END LOOP;
    END IF;

    -- Execute the query dynamically
    EXECUTE query USING value INTO result_id;

    -- If no result is found, return NULL
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN result_id;
END;
$$ LANGUAGE plpgsql;






CREATE OR REPLACE PROCEDURE public.insert_oilfield_operations_data_by_property_name(IN p_idoilfieldoperations integer)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    inserted_row RECORD;
    current_row RECORD;
BEGIN
    FOR current_row IN 
        SELECT f.rowid, f.value, f.path, f.key, f."referencetable"
        FROM fieldmodule f
        WHERE f."tablename" = 'oilfieldOperationsData'
          AND f."referencetable" = 'StandardOilfieldOperationsDataSectionElement'
          AND f."idoilfieldoperations" = p_idoilfieldoperations::TEXT
    LOOP
        -- Insert new row in oilfieldOperationsData
        INSERT INTO public."oilfieldOperationsData" (
            "idStandardOilfieldOperationsDataSectionElement", 
            value, 
            "idOilfieldOperations"
        )
        SELECT 
            get_property_id_field_module(
                current_row."referencetable"::TEXT,        
                'name',              
                current_row.key::TEXT,                  
                jsonb_build_object(
                    'idStandardOilfieldOperationsDataSection', 
                    get_property_id_field_module(
                        'StandardOilfieldOperationsDataSection', 
                        'name', 
                        split_part(current_row.path, '//', 1), 
                        '{"verified": "true"}'::JSONB   
                    )
                )                            
            ) AS idProperty, 
            current_row."value",
            p_idoilfieldoperations
        RETURNING id, value INTO inserted_row;  -- Capture the inserted row ID

        -- Update the fieldmodule table with the generated tablerowid
        UPDATE fieldmodule
        SET tablerowid = inserted_row.id::TEXT -- Convert to TEXT if necessary
        WHERE rowid = current_row."rowid"; -- Use the original row ID from fieldmodule
    END LOOP;
END;
$procedure$
;



INSERT INTO public."oilfieldOperationsData" (
    "idStandardOilfieldOperationsDataSectionElement", 
    value, 
    "idOilfieldOperations"
)
SELECT 
    get_property_id_field_module(
        referencetable::TEXT,        -- Cast to TEXT
        'nameOpenWells',             -- Static value as TEXT
        key::TEXT,                   -- Cast to TEXT
        jsonb_build_object(
            'idStandardOilfieldOperationsDataSection', 
            get_property_id_field_module(
                'StandardOilfieldOperationsDataSection', 
                'nameOpenWells', 
                split_part(path, '//', 1), 
                '{"verified": "true"}'::JSONB   -- Ensure JSONB type
            )
        )                            -- This already returns JSONB
    ) AS idStandardOilfieldOperationsDataSectionElement, 
    value,                          -- Use the `value` column directly
    10000                           -- Static value for `idOilfieldOperations`
FROM fieldmodule f 
WHERE tablename = 'oilfieldOperationsData'
  AND referencetable = 'StandardOilfieldOperationsDataSectionElement';







 ---------------insert sands
 INSERT INTO public."OilfieldOperationsSand"
 		("id","idOilfieldOperations")
	VALUES 
		(1001,10000) --id of oilField must be replaced with value passed from frontend
-------------------------
	
INSERT INTO public."OilfieldOperationsSandAttributes"(
	"idStandardOilfieldOperationsSandAttributes", "idOilfieldOperationsSand", value)
--	VALUES ( 1, 1001, 'ARENA U INFERIOR'); ---- 1 hace referencia a wellbore zone 
SELECT 
    get_property_id_field_module(
        referencetable::TEXT,        -- Cast to TEXT
        referenceproperty ::TEXT,             
        key::TEXT,                   -- Cast to TEXT
        '{"verified": "true"}'::JSONB                           -- This already returns JSONB
    ) AS idStandardOilfieldOperationsSandAttributes, 
    1001,
    value                              -- Static value for `idOilfieldOperations`
FROM fieldmodule f 
WHERE tablename = 'OilfieldOperationsSandAttributes'
AND referencetable = 'StandardOilfieldOperationsSandAttributes';




-------------------------------------------------------------------
-------sands part 2 

INSERT INTO public."OilfieldOperationsSandPerforation"(
	"id","idOilfieldOperationsSand")
	VALUES (101,1001);


INSERT INTO public."OilfieldOperationsSandPerforationAttributes"(
	"idStandardOilfieldOperationsSandPerforationAttributes", "idOilfieldOilfieldOperationsSandPerforation", value)
SELECT 
    get_property_id_field_module(
        referencetable::TEXT,        -- Cast to TEXT
        referenceproperty ::TEXT,             
        key::TEXT,                   -- Cast to TEXT
        '{"verified": "true"}'::JSONB                           -- This already returns JSONB
    ) AS idreferenced, 
    101,
    value                              -- Static value for `idOilfieldOperations`
FROM fieldmodule f 
WHERE tablename = 'OilfieldOperationsSandPerforationAttributes'
AND referencetable = 'StandardOilfieldOperationsSandPerforationAttributes';



---------------------------------------------------------------------------------
------------------------------ensambles------------------------------------------

CREATE OR REPLACE FUNCTION find_id_from_chain(
    input_chain TEXT,
    table_name TEXT,
    column_name_to_search TEXT,
    column_name_to_return TEXT,
    delimiter TEXT DEFAULT '//',
    part_position INT DEFAULT 2, -- Renamed from "position" to "part_position"
    condition TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    text_to_search TEXT;
    query TEXT;
    result TEXT;
BEGIN
    -- Extract the specific part of the input chain
    text_to_search := (string_to_array(input_chain, delimiter))[part_position];

    -- Build the dynamic SQL query
    query := 'SELECT ' || column_name_to_return || 
             ' FROM "' || table_name || 
             '" WHERE ' || column_name_to_search || ' ILIKE $1';

    -- Append the optional condition if provided
    IF condition IS NOT NULL THEN
        query := query || ' AND ' || condition;
    END IF;

    -- Execute the query dynamically
    EXECUTE query INTO result USING '%' || text_to_search || '%';

    -- Return the result
    RETURN result;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION find_id_by_contained_text(
    mytext TEXT,
    table_name TEXT,
    column_name_to_search TEXT,
    column_name_to_return TEXT,
    condition TEXT DEFAULT NULL -- Optional condition
) RETURNS TEXT AS $$
DECLARE
    query TEXT;
    result TEXT;
BEGIN
    -- Build the dynamic SQL query
    query := 'SELECT ' || column_name_to_return || 
             ' FROM "' || table_name || 
             '" WHERE $1 ILIKE ''%'' || "' || column_name_to_search || '" || ''%''';

    -- Append the optional condition if provided
    IF condition IS NOT NULL THEN
        query := query || ' AND ' || condition;
    END IF;

    -- Limit the result to 1 match
    query := query || ' LIMIT 1';

    -- Execute the query dynamically
    EXECUTE query INTO result USING mytext;

    -- Return the result
    RETURN result;
END;
$$ LANGUAGE plpgsql;





SELECT find_id_by_contained_text(
    f.value,
    'StandardElements',
    'name',
    'id',
    '"idStandardWellInfrastructureType" = ' || f.idStandardWellInfrastructureType
) idStandardElement
,find_id_by_contained_text(
    f.value,
    'StandardCondition',
    'condition',
    'id'
) idcondition,
find_id_by_contained_text(
    f.value,
    'StandardCouplingCondition',
    'couplingCondition',
    'id'
) idcouplingCondition ,*
FROM (
    SELECT find_id_from_chain(
        "path",
        'OpenWellsAssemblyTypes',
        'name',
        '"idStandardWellInfrastructureType"',
        '//',
        2
    ) AS idStandardWellInfrastructureType, *
    FROM fieldmodule f
    where path LIKe '%ensambles%'
) f



CALL insert_well_historical_infrastructure_elements(2,'10001');


--------------------------------------------------------------------------------
---------------------------------------------------------------------------------
-----------------------------delete ------------------------------------------


DELETE FROM "OilfieldOperationsSandAttributes"
--select * from "OilfieldOperationsSandAttributes" oosa 
where "idOilfieldOperationsSand"  in (
select id from "OilfieldOperationsSand" oos where "idOilfieldOperations" >=10001
)

DELETE FROM "OilfieldOperationsSandPerforationAttributes"
--select * from "OilfieldOperationsSandPerforationAttributes" oospa 
where "idOilfieldOilfieldOperationsSandPerforation" in (select id from "OilfieldOperationsSandPerforation" oosp 
where "idOilfieldOperationsSand"  in (
select id from "OilfieldOperationsSand" oos where "idOilfieldOperations" >=10001
))

delete from "OilfieldOperationsSandPerforation"
--select * from "OilfieldOperationsSandPerforation" oosp 
where "idOilfieldOperationsSand"  in (
select id from "OilfieldOperationsSand" oos where "idOilfieldOperations" >=10001
)

delete from "oilfieldOperationsData"
--select * from "oilfieldOperationsData" ood 
where "idOilfieldOperations"  in (
select id from "OilfieldOperations" oo where "id" >=10001
)

delete from "OilfieldOperationsSand"
--select * from "OilfieldOperationsSand" oos 
where "idOilfieldOperations"  in (
select id from "OilfieldOperations" oo where "id" >=10000
)

delete from "fieldmodule"
--SELECT * FROM fieldmodule
where idoilfieldoperations = '10001'


delete from "OilfieldOperations"
--select * from "OilfieldOperations" oo 
where id >= 10000


delete from "WellHistoricalInfrastructureElements"
--SELECT * FROM "WellHistoricalInfrastructureElements"
where "idOilfieldOperations" = '33'





CREATE OR REPLACE VIEW public.v_standard_element_attributes
AS SELECT se.id,
    se.name,
    se."idStandardWellSections",
    se."idStandardBusinessLines",
    sa.name AS attribute_name,
    sa."orderInDescription",
    sao.value,
    sao.id "idStandardAttributeOptions",
    sa.id "idStandardAttributes",
    se.id "idStandardElement",
    se."idStandardWellInfrastructureType",
    ( SELECT s.name
           FROM "StandardWellInfrastructureType" s
          WHERE s.id = se."idStandardWellInfrastructureType") AS standardwellinfrastructuretypename,
    ( SELECT s.name
           FROM "StandardBusinessLines" s
          WHERE s.id = se."idStandardBusinessLines") AS business_line_name,
    ( SELECT s.name
           FROM "OpenWellsAssemblyTypes" s
          WHERE s."idStandardWellInfrastructureType" = se."idStandardWellInfrastructureType"
          ORDER BY s.name
         LIMIT 1) AS openwellsassemblytype
   FROM "StandardElements" se
     JOIN "StandardAttributes" sa ON sa."idStandardElement" = se.id
     JOIN "StandardAttributeOptions" sao ON sa.id = sao."idStandardAttribute"
  WHERE sa."orderInDescription" IS NOT NULL AND sa."orderInDescription" <> 0 AND se."idStandardWellInfrastructureType" IS NOT NULL;
-----------------------------------------------------------------------
----------------------------------------------------------------------


DELETE FROM "OilfieldOperationsSandAttributes"
--select * from "OilfieldOperationsSandAttributes" oosa 
where "idOilfieldOperationsSand"  in (
select id from "OilfieldOperationsSand" oos where "idOilfieldOperations" =63
)

DELETE FROM "OilfieldOperationsSandPerforationAttributes"
--select * from "OilfieldOperationsSandPerforationAttributes" oospa 
where "idOilfieldOilfieldOperationsSandPerforation" in (select id from "OilfieldOperationsSandPerforation" oosp 
where "idOilfieldOperationsSand"  in (
select id from "OilfieldOperationsSand" oos where "idOilfieldOperations" =63
))

delete from "OilfieldOperationsSandPerforation"
--select * from "OilfieldOperationsSandPerforation" oosp 
where "idOilfieldOperationsSand"  in (
select id from "OilfieldOperationsSand" oos where "idOilfieldOperations" =63
)

delete from "oilfieldOperationsData"
--select * from "oilfieldOperationsData" ood 
where "idOilfieldOperations"  in (
select id from "OilfieldOperations" oo where "id" =63
)

delete from "OilfieldOperationsSand"
--select * from "OilfieldOperationsSand" oos 
where "idOilfieldOperations"  in (
select id from "OilfieldOperations" oo where "id" =63
)

delete from "fieldmodule"
--SELECT * FROM fieldmodule
where idoilfieldoperations = '63'


delete from "OilfieldOperations"
--select * from "OilfieldOperations" oo 
where id = 63


delete from "WellHistoricalInfrastructureElements"
--SELECT * FROM "WellHistoricalInfrastructureElements"
where "idOilfieldOperations" = '63'




delete from "ElementTally" et where tally_id  in (select id from "Tally" t where "idOilfieldOperations"  = '75')

delete   from "ElementDetail"  et where "idElementRelease"  in (select id from "ElementRelease"  et where "idRelease"  in (select id from "Release"  t where "idOilfieldOperations"  = '75'))

delete  from "ElementRelease"  et where "idRelease"  in (select id from "Release"  t where "idOilfieldOperations"  = '75')



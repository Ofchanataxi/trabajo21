-- DROP FUNCTION public.after_insert_wellhistoricalinfrastructureelements();

CREATE OR REPLACE FUNCTION public.after_insert_wellhistoricalinfrastructureelements()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_release_id INTEGER;
BEGIN
    -- 1. Insert into Release
    INSERT INTO "Release" ("idBusinessLine", "idReleaseState", "idOilfieldOperations", "idCreatedBy", "timestamp")
    VALUES ((select "idStandardBusinessLines"  from "StandardElements" se where se.id = NEW."idStandardElements"), 4, NEW."idOilfieldOperations", NEW."idChangedBy", now())
    RETURNING id INTO new_release_id;
    
    -- 2. Insert into ElementRelease
    INSERT INTO "ElementRelease" ("idCondition", "idRelease", "quantity", "idCouplingCondition", "idStandardElements", "pecDescription", "approvalStatus")
	--------FIX FIX FIX FIX ---- table inconsitency between wellinfrastruture element and elementrelease, on the first one tie idcondition can be null, while on the second cant
    VALUES (coalesce(NEW."idCondition",1), new_release_id, NEW."quantity", NEW."idCouplingCondition", NEW."idStandardElements", NEW."openWellsDescription", TRUE);
    
    RETURN NULL;
END;
$function$
;
-- DROP PROCEDURE public.deduplicate_fieldmodule_paths(text);

CREATE OR REPLACE PROCEDURE public.deduplicate_fieldmodule_paths(IN p_idoilfieldoperations text)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
  rec RECORD;
  v_old_id uuid;
  v_new_id uuid;
  v_new_value TEXT;
BEGIN
  -- Loop over each duplicated path
  FOR rec IN
    SELECT path
    FROM fieldmodule
    WHERE path IS NOT NULL
      AND idOilfieldOperations = p_idOilfieldOperations
    GROUP BY path
    HAVING COUNT(*) > 1
  LOOP
    -- Obtener IDs y valor
    SELECT rowid INTO v_old_id
    FROM fieldmodule
    WHERE path = rec.path
      AND idOilfieldOperations = p_idOilfieldOperations
    ORDER BY modifydate ASC
    LIMIT 1;

    SELECT rowid, openwellsvalue
    INTO v_new_id, v_new_value
    FROM fieldmodule
    WHERE path = rec.path
      AND idOilfieldOperations = p_idOilfieldOperations
    ORDER BY modifydate DESC
    LIMIT 1;

    -- Actualizar el más antiguo
    UPDATE fieldmodule
    SET openwellsvalue = v_new_value
    WHERE rowid = v_old_id;

    -- Eliminar el más nuevo, solo si son diferentes
    IF v_old_id IS DISTINCT FROM v_new_id THEN
      DELETE FROM fieldmodule
      WHERE rowid = v_new_id;
    END IF;
  END LOOP;
END;
$procedure$
;

-- DROP FUNCTION public.delete_related_row();

CREATE OR REPLACE FUNCTION public.delete_related_row()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    sql TEXT;
BEGIN
    -- Build the SQL command dynamically
    sql := 'DELETE FROM ' || quote_ident(OLD.tablename) || ' WHERE id = $1';

    -- Execute the dynamic SQL with the tablerowid as parameter
    EXECUTE sql USING OLD.tablerowid;

    RETURN OLD;
END;
$function$
;
-- DROP FUNCTION public.find_id_by_contained_text(text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.find_id_by_contained_text(mytext text, table_name text, column_name_to_search text, column_name_to_return text, condition text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
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
$function$
;
-- DROP FUNCTION public.find_id_by_text(text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.find_id_by_text(text_to_search text, table_name text, column_name_to_search text, column_name_to_return text, condition text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    query TEXT;
    result TEXT;
BEGIN
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
$function$
;
-- DROP FUNCTION public.find_id_from_chain(text, text, text, text, text, int4, text);

CREATE OR REPLACE FUNCTION public.find_id_from_chain(input_chain text, table_name text, column_name_to_search text, column_name_to_return text, delimiter text DEFAULT '//'::text, part_position integer DEFAULT 2, condition text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
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
$function$
;
-- DROP FUNCTION public.fn_get_element_combinations(text);

CREATE OR REPLACE FUNCTION public.fn_get_element_combinations(p_element_name text)
 RETURNS TABLE(descripcion_concatenada text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  propiedades TEXT[];
  base_query TEXT := '';
  i INT := 1;
  alias TEXT;
BEGIN
  -- Obtener y limpiar lista de propiedades válidas y ordenadas
  SELECT array_agg(nombre ORDER BY orden) INTO propiedades
  FROM (
    SELECT DISTINCT
      regexp_replace(trim(sa.name), '[\s\r\n]+', ' ', 'g') AS nombre,
      sa."orderInDescription" AS orden
    FROM "StandardElements" se
    INNER JOIN "StandardAttributes" sa ON sa."idStandardElement" = se."id"
    WHERE se."name" = p_element_name
      AND sa."orderInDescription" IS NOT NULL
      AND sa."orderInDescription" != 0
      AND sa.name IS NOT NULL
  ) sub
  WHERE nombre IS NOT NULL AND nombre <> '';

  -- Verificar si hay propiedades válidas
  IF propiedades IS NULL OR array_length(propiedades, 1) = 0 THEN
    RAISE NOTICE 'No hay propiedades válidas para el elemento %', p_element_name;
    RETURN;
  END IF;

  -- Construir los CROSS JOIN por propiedad
  FOREACH alias IN ARRAY propiedades LOOP
    IF alias IS NULL OR LENGTH(trim(alias)) = 0 THEN
      CONTINUE;
    END IF;

    base_query := base_query || format(
      'CROSS JOIN (
         SELECT DISTINCT sao.value AS "%I"
         FROM "StandardElements" se
         INNER JOIN "StandardAttributes" sa ON sa."idStandardElement" = se."id"
         INNER JOIN "StandardAttributeOptions" sao ON sao."idStandardAttribute" = sa."id"
         WHERE se."name" = %L AND sa.name = %L
       ) AS t%s ',
      alias, p_element_name, alias, i::text
    );
    i := i + 1;
  END LOOP;

  -- Agregar base inicial para los JOIN
  base_query := 'FROM (SELECT 1) AS base ' || base_query;

  -- Construir SELECT con concatenación
  base_query := 'SELECT ' || (
    SELECT string_agg(format('t%s."%I"', idx::text, val), ' || '' - '' || ')
    FROM unnest(propiedades) WITH ORDINALITY AS u(val, idx)
    WHERE val IS NOT NULL AND LENGTH(trim(val)) > 0
  ) || ' AS descripcion_concatenada ' || base_query;

  -- Ejecutar y retornar
  RETURN QUERY EXECUTE base_query;
END;
$function$
;
-- DROP FUNCTION public.get_field_module_properties(text, text);

CREATE OR REPLACE FUNCTION public.get_field_module_properties(p_tablename text, p_referencetable text)
 RETURNS TABLE(idproperty text, value text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    
SELECT 
    get_property_id_field_module(
        referencetable::TEXT,        
        'nameOpenWells',             
        key::TEXT,                   
        jsonb_build_object(
            'idStandardOilfieldOperationsDataSection', 
            get_property_id_field_module(
                'StandardOilfieldOperationsDataSection', 
                'nameOpenWells', 
                split_part(path, '//', 1), 
                '{"verified": "true"}'::JSONB   
            )
        )                            
    )::TEXT AS idProperty, 
    f.value
FROM fieldmodule f 
WHERE tablename = p_tablename
  AND referencetable = p_referencetable;
END;
$function$
;
-- DROP FUNCTION public.get_max_id(text, text);

CREATE OR REPLACE FUNCTION public.get_max_id(p_table_name text, p_id_column text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    max_id INT;
BEGIN
    -- Build and execute the dynamic SQL query
    EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', p_id_column, p_table_name)
    INTO max_id;

    -- Return the maximum ID
    RETURN max_id;
END;
$function$
;
-- DROP FUNCTION public.get_property_id(text, text, text, text);

CREATE OR REPLACE FUNCTION public.get_property_id(table_name text, property_name text, filter_column text DEFAULT NULL::text, filter_value text DEFAULT NULL::text)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
    query TEXT;
    result_id BIGINT;
BEGIN
    -- Construct the dynamic SQL query
    query := 'SELECT id FROM ' || quote_ident(table_name) || 
             ' WHERE ' || quote_ident(property_name) || ' = $1';

    -- Add optional filter condition
    IF filter_column IS NOT NULL THEN
        query := query || ' AND ' || quote_ident(filter_column) || ' = $2';
    END IF;

    -- Execute the query dynamically
    IF filter_column IS NOT NULL THEN
        EXECUTE query USING filter_value, filter_value INTO result_id;
    ELSE
        EXECUTE query USING filter_value INTO result_id;
    END IF;

    -- If no result is found, return NULL
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN result_id;
END;
$function$
;
-- DROP FUNCTION public.get_property_id(text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.get_property_id(table_name text, column_name text, value text, additional_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
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
$function$
;
-- DROP FUNCTION public.get_property_id(text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.get_property_id(table_name text, column_name text, value text, additional_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
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
$function$
;
-- DROP FUNCTION public.get_property_id_field_module(text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.get_property_id_field_module(table_name text, column_name text, value text, additional_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
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
$function$
;
-- DROP FUNCTION public.get_release_name(int4);

CREATE OR REPLACE FUNCTION public.get_release_name(release_id integer)
 RETURNS SETOF record
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT  w."wellName"  || ' ' || 
	ot."operationCode" || ' ' || TO_CHAR(o."operationNumber", 'FM00') 
	|| ' / ' || r."name"
	AS "name" 
	FROM "OilfieldOperations" as o 
	JOIN "OilfieldTypeOperations" as ot  ON o."idOilfieldTypeOperations" = ot."id"
	JOIN "Well" as w ON o."idWell" = w."id"
	JOIN "Rig" as r ON o."idRig" = r."id"
	WHERE o."id" = release_id;
END;
$function$
;
-- DROP FUNCTION public.getorinsertoilfieldoperations(int4, int4, int4, int4, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.getorinsertoilfieldoperations(p_idwell integer, p_idrig integer, p_idoilfieldtypeoperations integer, p_operationnumber integer, p_enddatetime timestamp with time zone, p_startdatetime timestamp with time zone)
 RETURNS TABLE(oilfieldoperations_id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Busca si la operación ya existe
    IF EXISTS (
        SELECT 1
        FROM public."OilfieldOperations" op
        WHERE op."idWell" IS NOT DISTINCT FROM p_idWell 
        AND op."idRig" IS NOT DISTINCT FROM p_idRig 
        AND op."idOilfieldTypeOperations" IS NOT DISTINCT FROM p_idOilfieldTypeOperations
    ) THEN
        -- Si existe, devuelve la operación existente
        RETURN QUERY 
        SELECT op.id
        FROM public."OilfieldOperations" op
        WHERE op."idWell" IS NOT DISTINCT FROM p_idWell 
        AND op."idRig" IS NOT DISTINCT FROM p_idRig 
        AND op."idOilfieldTypeOperations" IS NOT DISTINCT FROM p_idOilfieldTypeOperations;
    ELSE
        -- Si no existe, inserta la nueva operación y devuelve el registro insertado
        RETURN QUERY
        INSERT INTO public."OilfieldOperations"("idOilfieldTypeOperations", "idWell", "operationNumber", "endDateTime", "idRig", "startDateTime")
        VALUES (p_idOilfieldTypeOperations, p_idWell, p_operationNumber, p_endDateTime, p_idRig, p_startDateTime)
        RETURNING id AS oilfieldOperations_id;
    END IF;
END;
$function$
;
-- DROP FUNCTION public.getorinsertrecordinoilfieldoperations(varchar, varchar, varchar, varchar, int4, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.getorinsertrecordinoilfieldoperations(p_rigname character varying, p_wellshortname character varying, p_welllongname character varying, p_oilfieldtypeoperations character varying, p_operationnumber integer, p_enddatetime timestamp with time zone, p_startdatetime timestamp with time zone)
 RETURNS TABLE(rig_id integer, well_id integer, oilfieldtypeoperations_id integer, oilfieldoperations_id integer, operationnumber_id integer)
 LANGUAGE plpgsql
AS $function$
DECLARE
    rigRecord RECORD;
    wellRecord RECORD;
    oilfieldTypeOperationsRecord RECORD;
	oilfieldOperationsRecord RECORD;
BEGIN
    -- Iniciar una transacción implícita
    BEGIN
        -- Llamar a GetOrInsertRig y capturar el rig_id devuelto
        SELECT * INTO rigRecord 
        FROM GetOrInsertRig(p_rigName);
        
        -- Llamar a GetOrInsertWell y capturar el well_id devuelto
        SELECT * INTO wellRecord 
        FROM GetOrInsertWell(p_wellShortName, p_wellLongName);

        -- Obtener el id del tipo de operación
        SELECT * INTO oilfieldTypeOperationsRecord
        FROM public."OilfieldTypeOperations" op
        WHERE UPPER(REPLACE(op."avocetName", ' ', '')) = UPPER(REPLACE(p_oilfieldTypeOperations, ' ', ''));

		-- Guardo la tabla en oilfieldOperations
		SELECT * INTO oilfieldOperationsRecord
		FROM GetOrInsertOilfieldOperations(wellRecord.well_id, rigRecord.rig_id, oilfieldTypeOperationsRecord.id, p_operationNumber, p_endDateTime, p_startDateTime);

        -- Si todas las operaciones fueron exitosas, devolver los IDs
        RETURN QUERY
        SELECT rigRecord.rig_id, wellRecord.well_id, oilfieldTypeOperationsRecord.id, oilfieldOperationsRecord.oilfieldOperations_id, p_operationNumber;

    EXCEPTION WHEN OTHERS THEN
        -- Si ocurre un error, capturarlo y lanzar el error
        RAISE NOTICE 'Error detected, rolling back transaction';
        -- Relanzar el error para manejo externo
        RAISE;
    END;
END;
$function$
;
-- DROP FUNCTION public.getorinsertrig(varchar);

CREATE OR REPLACE FUNCTION public.getorinsertrig(p_rigname character varying)
 RETURNS TABLE(rig_id integer, rigname character varying, rigemr double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Busca si el equipo ya existe
    IF EXISTS (
        SELECT 1
        FROM public."Rig" r
        WHERE UPPER(REPLACE(r."name", ' ', '')) = UPPER(REPLACE(p_rigName, ' ', ''))
    ) THEN
        -- Si existe, devuelve el equipo existente
        RETURN QUERY 
        SELECT r.id AS rig_id, r.name AS rigName, r.emr AS rigEmr
        FROM public."Rig" r
        WHERE UPPER(REPLACE(r."name", ' ', '')) = UPPER(REPLACE(p_rigName, ' ', ''));
    ELSE
        -- Si no existe, inserta el nuevo equipo y devuelve el registro insertado
        RETURN QUERY
        INSERT INTO public."Rig"(name, emr)
        VALUES (p_rigName, 0)
        RETURNING id AS rig_id, name AS rigName, emr AS rigEmr;
    END IF;
END;
$function$
;
-- DROP FUNCTION public.getorinsertwell(varchar, varchar);

CREATE OR REPLACE FUNCTION public.getorinsertwell(p_wellshortname character varying, p_welllongname character varying)
 RETURNS TABLE(well_id integer, wellshortname character varying, welllongname character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Busca si el pozo ya existe
    IF EXISTS (
        SELECT 1 
        FROM public."Well" w -- Usamos el alias 'w' para la tabla
        WHERE UPPER(REPLACE(w."wellShortName", ' ', '')) = UPPER(REPLACE(p_wellShortName, ' ', ''))
    ) THEN
        -- Si existe, devuelve el pozo existente
        RETURN QUERY 
        SELECT w.id AS well_id, w."wellShortName", w."wellName" AS wellLongName
        FROM public."Well" w
        WHERE UPPER(REPLACE(w."wellShortName", ' ', '')) = UPPER(REPLACE(p_wellShortName, ' ', ''));
    ELSE
        -- Si no existe, inserta el nuevo pozo y devuelve el registro insertado
        RETURN QUERY
        INSERT INTO public."Well" ("wellName", "wellShortName")
        VALUES (p_wellLongName, p_wellShortName)
        RETURNING id AS well_id, "wellShortName", "wellName" AS wellLongName;
    END IF;
END;
$function$
;
-- DROP FUNCTION public.history_release_state_change();

CREATE OR REPLACE FUNCTION public.history_release_state_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Insertar un nuevo registro en la tabla ReleaseStateHistory
    INSERT INTO public."ReleaseStateHistory" (
        "idRelease", 
        "idNewReleaseState", 
        "idPreviousState", 
        "idChangedBy", 
        "changeTimestamp", 
        "changeReason"
    ) VALUES (
        NEW.id,                            -- ID del Release que fue actualizado
        NEW."idReleaseState",                -- Nuevo estado del release
        OLD."idReleaseState",                -- Estado anterior del release
        NEW."idCreatedBy",                   -- Quién realizó el cambio
        NOW(),                             -- Fecha y hora del cambio
        NEW."changeReason"                    -- Puedes modificar o añadir el motivo del cambio si es necesario
    );

    RETURN NEW;
END;
$function$
;
-- DROP FUNCTION public.insert_elements_of_release(int4, jsonb);

CREATE OR REPLACE FUNCTION public.insert_elements_of_release(id_release integer, element_of_release_list jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE 
	ID_NEW_ELEMENT_RELEASE INT; -- ID del id que se ha creado	
	ELEMENT_RELEASE JSONB;
	ATTRIBUTE_PART JSONB;
	ID_STANDAR_CONDITION INT;
	ID_STANDAR_COUPLING INT;
BEGIN 

FOR ELEMENT_RELEASE IN SELECT * FROM jsonb_array_elements(ELEMENT_OF_RELEASE_LIST)

LOOP
	-- SAVEPOINT sp1; --SE VERIFICA LOS ELEMENTOS DEL RELEASE;
		SELECT id INTO ID_STANDAR_CONDITION
		FROM public."StandardCondition" AS SC
		WHERE SC."condition" ILIKE ELEMENT_RELEASE->>'condition';
		IF ID_STANDAR_CONDITION IS NULL THEN 
			 -- Si no se encontró nombre de la condicion
			RAISE EXCEPTION 'ID DE STANDAR CONDITION NO ENCONTRADO';
		END IF; 

		SELECT id INTO ID_STANDAR_COUPLING
		FROM public."StandardCouplingCondition" AS SCC
		WHERE SCC."couplingCondition" ILIKE ELEMENT_RELEASE->>'observation';
		IF ID_STANDAR_CONDITION IS NULL THEN 
			 -- Si no se encontró nombre de la condicion
			RAISE NOTICE 'ID COUPLING CONDITION NO ENCONTRADO';
		END IF; 
					
	INSERT INTO public."ElementRelease"(serial, "idCondition", "idRelease", quantity, "idCouplingCondition", brand, "idStandardElements", "pecDescription", observations, "approvalStatus", "oitInspection", "oitReparation", heat)
	VALUES(
				ELEMENT_RELEASE->>'serial',
				ID_STANDAR_CONDITION,
				ID_RELEASE,
				CAST(ELEMENT_RELEASE->>'quantity' AS double precision), -- quantity
				ID_STANDAR_COUPLING,
				ELEMENT_RELEASE->>'brand',
				CAST(ELEMENT_RELEASE->>'idElement' AS INTEGER),
				ELEMENT_RELEASE->>'description',
				ELEMENT_RELEASE->>'observations',
				null, -- aproval status
				ELEMENT_RELEASE->>'oitInspection',
				ELEMENT_RELEASE->>'oitReparation',
				ELEMENT_RELEASE->>'heat'
				)
	RETURNING ID INTO ID_NEW_ELEMENT_RELEASE;
	-- Falta Agregar elementos del elemento release 
		FOR ATTRIBUTE_PART IN SELECT * FROM jsonb_array_elements(ELEMENT_RELEASE->'attributeParts')
		LOOP
		INSERT INTO  public."ElementDetail"( "idElementRelease", "idStandardAttributes", "idStandardAttributeOptions" )
		VALUES(	ID_NEW_ELEMENT_RELEASE,
				CAST(ATTRIBUTE_PART->>'idAttribute' AS INTEGER),
				CAST(ATTRIBUTE_PART->>'idOptionAttribute'AS INTEGER)
				);
		END LOOP;
	END LOOP;
END; 
$function$
;
-- DROP PROCEDURE public.insert_oilfield_operations_data(int4);

CREATE OR REPLACE PROCEDURE public.insert_oilfield_operations_data(IN p_idoilfieldoperations integer)
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
          AND f."idoilfieldoperations" = p_idoilfieldoperations::text
          and f."uploadstate" = 'raw'
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
                'nameOpenWells',              
                current_row.key::TEXT,                  
                jsonb_build_object(
                    'idStandardOilfieldOperationsDataSection', 
                    get_property_id_field_module(
                        'StandardOilfieldOperationsDataSection', 
                        'nameOpenWells', 
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
        	,uploadstate = 'saved'
        WHERE rowid = current_row."rowid"; -- Use the original row ID from fieldmodule
    END LOOP;
END;
$procedure$
;
-- DROP PROCEDURE public.insert_oilfield_operations_data_by_property_name(int4);

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
          AND f."idoilfieldoperations" = p_idoilfieldoperations::text
          AND f."uploadstate" = 'raw'
          
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
-- DROP PROCEDURE public.insert_oilfield_operations_perforation_data(int4);

CREATE OR REPLACE PROCEDURE public.insert_oilfield_operations_perforation_data(IN p_idoilfieldoperations integer)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    var_path TEXT;
    var_idOilfieldOperationsSandPerforation INT;
    var_rowid TEXT;
    var_value TEXT;
    var_referencetable TEXT;
    var_referenceproperty TEXT;
    var_inserted_id INT;
    var_key TEXT;
BEGIN
    -- Step 1: Loop through each unique path
    FOR var_path IN
        SELECT DISTINCT split_part(fieldmodule.path::text, '//', 2)
        FROM fieldmodule
        WHERE tablename = 'OilfieldOperationsSandPerforationAttributes'
          AND referencetable = 'StandardOilfieldOperationsSandPerforationAttributes'
          AND "idoilfieldoperations" = p_idoilfieldoperations::text
          AND "uploadstate" = 'raw'
    LOOP
        -- Step 2: Create a new id for each path
        var_idOilfieldOperationsSandPerforation := get_max_id('OilfieldOperationsSandPerforation', 'id') + 1;

        -- Step 3: Insert into OilfieldOperationsSandPerforation
        INSERT INTO public."OilfieldOperationsSandPerforation" (
            "id", "idOilfieldOperationsSand"
        ) VALUES (
            var_idOilfieldOperationsSandPerforation,
            get_max_id('OilfieldOperationsSand', 'id')  -- You can move this out of the loop if it should only happen once
        );

        -- Step 4: Process attributes for this specific path
        FOR var_rowid, var_value, var_referencetable, var_referenceproperty, var_key IN
            SELECT rowid, value, referencetable, referenceproperty, key
            FROM fieldmodule
            WHERE tablename = 'OilfieldOperationsSandPerforationAttributes'
              AND referencetable = 'StandardOilfieldOperationsSandPerforationAttributes'
              AND "idoilfieldoperations" = p_idoilfieldoperations::text
              AND "uploadstate" = 'raw'
              AND path LIKE '%' || var_path || '%'
        LOOP
            INSERT INTO public."OilfieldOperationsSandPerforationAttributes" (
                "idStandardOilfieldOperationsSandPerforationAttributes",
                "idOilfieldOilfieldOperationsSandPerforation",
                value
            ) VALUES (
                get_property_id_field_module(
                    var_referencetable::TEXT,
                    var_referenceproperty::TEXT,
                    var_key,
                    '{"verified": "true"}'::JSONB
                ),
                var_idOilfieldOperationsSandPerforation,
                var_value
            )
            RETURNING id::TEXT INTO var_inserted_id;

            -- Update fieldmodule
            UPDATE fieldmodule
            SET tablerowid = var_inserted_id,
                uploadstate = 'saved'
            WHERE rowid::TEXT = var_rowid::TEXT;
        END LOOP;
    END LOOP;

END;
$procedure$
;
-- DROP PROCEDURE public.insert_oilfield_operations_sand_data(int4);

CREATE OR REPLACE PROCEDURE public.insert_oilfield_operations_sand_data(IN p_idoilfieldoperations integer)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    idOilfieldOperationsSand INT;
    var_idOilfieldOperationsSandPerforation INT;
    var_rowid TEXT;
    var_value TEXT;
    var_referencetable TEXT;
    var_referenceproperty TEXT;
    var_inserted_id INT;
 	var_key TEXT;
BEGIN
    -- Generate a new ID for OilfieldOperationsSand
    idOilfieldOperationsSand := get_max_id('OilfieldOperationsSand', 'id') + 1;

    -- Insert into OilfieldOperationsSand
    INSERT INTO public."OilfieldOperationsSand" ("id", "idOilfieldOperations")
    VALUES (idOilfieldOperationsSand, p_idoilfieldoperations);

    -- Process OilfieldOperationsSandAttributes
    FOR var_rowid, var_value, var_referencetable, var_referenceproperty, var_key IN
        SELECT rowid, value, referencetable, referenceproperty, key
        FROM fieldmodule
        WHERE tablename = 'OilfieldOperationsSandAttributes'
          AND referencetable = 'StandardOilfieldOperationsSandAttributes'
          AND "idoilfieldoperations" = p_idoilfieldoperations::text
          and "uploadstate" = 'raw'
    LOOP
        -- Insert into OilfieldOperationsSandAttributes
        INSERT INTO public."OilfieldOperationsSandAttributes" (
            "idStandardOilfieldOperationsSandAttributes", 
            "idOilfieldOperationsSand", 
            value
        ) VALUES (
            get_property_id_field_module(
                var_referencetable::TEXT,        
                var_referenceproperty::TEXT,             
                var_key,                   
                '{"verified": "true"}'::JSONB                          
            ),
            idOilfieldOperationsSand,
            var_value
        )
        RETURNING id INTO var_inserted_id;

        -- Update fieldmodule with the generated ID
        UPDATE fieldmodule
        SET tablerowid = var_inserted_id::text
        ,uploadstate = 'saved'
        WHERE rowid::TEXT = var_rowid::TEXT;
    END LOOP;
END;
$procedure$
;
-- DROP PROCEDURE public.insert_oilfield_operations_sand_data2(int4);

CREATE OR REPLACE PROCEDURE public.insert_oilfield_operations_sand_data2(IN p_idoilfieldoperations integer)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    idOilfieldOperationsSand INT;
    var_idOilfieldOperationsSandPerforation INT;
    var_rowid TEXT;
    var_value TEXT;
    var_referencetable TEXT;
    var_referenceproperty TEXT;
    var_inserted_id INT;
 	var_key TEXT;
BEGIN
    -- Generate a new ID for OilfieldOperationsSand
    idOilfieldOperationsSand := get_max_id('OilfieldOperationsSand', 'id');

   
   var_idOilfieldOperationsSandPerforation := get_max_id('OilfieldOperationsSandPerforation', 'id') + 1;

    -- Insert into OilfieldOperationsSand
    INSERT INTO public."OilfieldOperationsSandPerforation" ("id", "idOilfieldOperationsSand")
    VALUES (var_idOilfieldOperationsSandPerforation, idOilfieldOperationsSand);

    -- Process OilfieldOperationsSandAttributes
    FOR var_rowid, var_value, var_referencetable, var_referenceproperty, var_key IN
        SELECT rowid, value, referencetable, referenceproperty, key
        FROM fieldmodule
        WHERE tablename = 'OilfieldOperationsSandPerforationAttributes'
          AND referencetable = 'StandardOilfieldOperationsSandPerforationAttributes'
          AND "idoilfieldoperations" = p_idoilfieldoperations::text
    LOOP
        -- Insert into OilfieldOperationsSandAttributes
        INSERT INTO public."OilfieldOperationsSandPerforationAttributes" (
            "idStandardOilfieldOperationsSandPerforationAttributes", 
            "idOilfieldOilfieldOperationsSandPerforation", 
            value
        ) VALUES (
            get_property_id_field_module(
                var_referencetable::TEXT,        
                var_referenceproperty::TEXT,             
                var_key,                   
                '{"verified": "true"}'::JSONB                          
            ),
            var_idOilfieldOperationsSandPerforation,
            var_value
        )
        RETURNING id::TEXT INTO var_inserted_id;

        -- Update fieldmodule with the generated ID
        UPDATE fieldmodule
        SET tablerowid = var_inserted_id
        WHERE rowid::TEXT = var_rowid::text;
    END LOOP;

END;
$procedure$
;
-- DROP FUNCTION public.insert_release(int4, int4, int4, int4, int4);

CREATE OR REPLACE FUNCTION public.insert_release(id_standar_condition integer, id_standar_business_line integer, id_standar_coupling integer, id_release_state integer, id_user integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE 
	ID_NEW_RELEASE INT; -- ID del id que se ha creado	
	--AUX VARIABLES
	transaction_start_time TIMESTAMP; -- variable timestamp
BEGIN 
	transaction_start_time := CURRENT_TIMESTAMP;

		INSERT INTO public."Release"("idBusinessLine", "timestamp", "idReleaseState", "idOilfieldOperations", "idCreatedBy")
		-- Flata que se configure el idoildfieldoperation
		VALUES (ID_STANDAR_BUSINESS_LINE, transaction_start_time, ID_RELEASE_STATE, 1,ID_USER )
		RETURNING id INTO ID_NEW_RELEASE;
		
		-- Verificacion si se ha insertado el pedido
		IF ID_NEW_RELEASE IS NULL THEN 
       	 	RAISE EXCEPTION 'Error al insertar el release';
		END IF;

		

		RAISE NOTICE 'RELASE.... El ID de condicion es: % y el ID de biselado es %, y el estado es % , y el businessLine ID_STANDAR_BUSINESS_LINE , a la hora %, BY: %', 
			ID_STANDAR_CONDITION, 
			ID_STANDAR_COUPLING, 
			ID_RELEASE_STATE, 
			transaction_start_time,
			ID_USER;
		RETURN ID_NEW_RELEASE;
		
END; $function$
;
-- DROP FUNCTION public.insert_release(int4, int4, int4, int4, int4, jsonb);

CREATE OR REPLACE FUNCTION public.insert_release(id_standar_condition integer, id_standar_business_line integer, id_standar_coupling integer, id_release_state integer, id_user integer, element_of_release jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE 
	ID_NEW_RELEASE INT; -- ID del id que se ha creado	
	--AUX VARIABLES
	transaction_start_time TIMESTAMP; -- variable timestamp
BEGIN 
	transaction_start_time := CURRENT_TIMESTAMP;

		INSERT INTO public."Release"("idBusinessLine", "timestamp", "idReleaseState", "idOilfieldOperations", "idCreatedBy")
		-- Flata que se configure el idoildfieldoperation
		VALUES (ID_STANDAR_BUSINESS_LINE, transaction_start_time, ID_RELEASE_STATE, 1,ID_USER )
		RETURNING id INTO ID_NEW_RELEASE;
		
		-- Verificacion si se ha insertado el pedido
		IF ID_NEW_RELEASE IS NULL THEN 
       	 	RAISE EXCEPTION 'Error al insertar el release';
		END IF;

		

		RAISE NOTICE 'RELASE.... El ID de condicion es: % y el ID de biselado es %, y el estado es % , y el businessLine ID_STANDAR_BUSINESS_LINE , a la hora %, BY: %', 
			ID_STANDAR_CONDITION, 
			ID_STANDAR_COUPLING, 
			ID_RELEASE_STATE, 
			transaction_start_time,
			ID_USER;

		
END; $function$
;
-- DROP PROCEDURE public.insert_well_historical_infrastructure_elements();

CREATE OR REPLACE PROCEDURE public.insert_well_historical_infrastructure_elements()
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    row RECORD;
    inserted_row_id INTEGER;
BEGIN
    -- Cursor to iterate over the grouped query
    FOR row IN
        SELECT 
            f.idoilfieldoperations,
            f.propertyname,
            f.value,
            find_id_by_contained_text(
                f.value,
                'StandardElements',
                'name',
                'id',
                '"idStandardWellInfrastructureType" = ' || f.idStandardWellInfrastructureType
            ) AS idStandardElement,
            f.idStandardWellInfrastructureType,
            find_id_by_contained_text(
                f.value,
                'StandardCondition',
                'condition',
                'id'
            ) AS idCondition,
            find_id_by_contained_text(
                f.value,
                'StandardCouplingCondition',
                'couplingCondition',
                'id'
            ) AS idCouplingCondition,
            f.parent,
            f.key
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
            WHERE path LIKE '%ensambles%'
              AND tablename = 'WellHistoricalInfrastructureElements'
        ) f
        ORDER BY f.parent, f.key
    LOOP
        -- Insert the row if propertyname = 'openWellsDescription'
        IF row.propertyname = 'openWellsDescription' THEN
            INSERT INTO "WellHistoricalInfrastructureElements" (
                "idOilfieldOperations",
                "openWellsDescription",
                "idStandardElements",
                "idStandardWellInfrastructureType",
                "idCondition",
                "idCouplingCondition",
                "mdTop", -- Default value of 1
                "mdBase", -- Default value of 1
                quantity -- Default value of 1
            )
            VALUES (
                row.idoilfieldoperations::INTEGER,
                row.value,
                row.idStandardElement::INTEGER,
                row.idStandardWellInfrastructureType::INTEGER,
                row.idCondition::INTEGER,
                row.idCouplingCondition::INTEGER,
                1, -- Default value for mdTop
                1, -- Default value for mdBase
                1  -- Default value for quantity
            )
            RETURNING id INTO inserted_row_id;

            -- Update the fieldmodule with the inserted row ID
            UPDATE fieldmodule
            SET tablerowid = inserted_row_id::TEXT
            WHERE parent = row.parent
              AND key = row.key;
        ELSE
            -- Update the previously inserted row
            UPDATE "WellHistoricalInfrastructureElements"
            SET 
                "mdTop" = CASE WHEN row.propertyname = 'mdtop' THEN row.value::NUMERIC ELSE "mdTop" END,
                "mdBase" = CASE WHEN row.propertyname = 'mdbase' THEN row.value::NUMERIC ELSE "mdBase" END,
                quantity = CASE WHEN row.propertyname = 'quantity' THEN row.value::NUMERIC ELSE quantity END
            WHERE id::TEXT = inserted_row_id::TEXT;
        END IF;
    END LOOP;
END;
$procedure$
;
-- DROP PROCEDURE public.insert_well_historical_infrastructure_elements(int4, text);

CREATE OR REPLACE PROCEDURE public.insert_well_historical_infrastructure_elements(IN p_idchangedby integer, IN p_idoilfieldoperations text)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    row RECORD;
    inserted_row_id INTEGER;
BEGIN
    -- Cursor to iterate over the grouped query
    FOR row IN
        SELECT 
            f.idoilfieldoperations,
            f.propertyname,
            f.value,
            find_id_by_contained_text(
                f.value,
                'StandardElements',
                'name',
                'id',
                '"idStandardWellInfrastructureType" = ' || f.idStandardWellInfrastructureType
            ) AS idStandardElement,
            f.idStandardWellInfrastructureType,
            find_id_by_contained_text(
                f.value,
                'StandardCondition',
                'condition',
                'id'
            ) AS idCondition,
            find_id_by_contained_text(
                f.value,
                'StandardCouplingCondition',
                'couplingCondition',
                'id'
            ) AS idCouplingCondition,
            f.parent,
            f.key
        FROM (
            SELECT 
            --find_id_from_chain(
            --    "path",
            --    'OpenWellsAssemblyTypes',
            --    'name',
            --    '"idStandardWellInfrastructureType"',
            --    '//',
            --    2
            --) AS idStandardWellInfrastructureType, 
            COALESCE(find_id_from_chain(
                "path",
                'OpenWellsAssemblyTypes',
                'name',
                '"idStandardWellInfrastructureType"',
                '//',
                2
            ),find_id_from_chain(
                "path",
                'StandardWellInfrastructureType',
                'name',
                '"id"',
                '//',
                2
            )) AS idStandardWellInfrastructureType, *
            FROM fieldmodule f
            WHERE path LIKE '%ensambles%'
              AND tablename = 'WellHistoricalInfrastructureElements'
              AND f.idoilfieldoperations = p_idOilfieldOperations
              --and f.parent= '03227552-2868-4fc0-8347-739a0101d407'
        ) f
        ORDER BY f.parent, f.key
    LOOP
        BEGIN
            -- Insert the row if propertyname = 'openWellsDescription'
            IF row.propertyname = 'openWellsDescription' THEN
                INSERT INTO "WellHistoricalInfrastructureElements" (
                    "idOilfieldOperations",
                    "openWellsDescription",
                    "idStandardElements",
                    "idStandardWellInfrastructureType",
                    "idCondition",
                    "idCouplingCondition",
                    "mdTop",                 -- Default value of 1
                    "mdBase",                -- Default value of 1
                    quantity,                -- Default value of 1
                    "changeTimestamp",       -- Current timestamp
                    "idChangedBy"            -- User making the change
                )
                VALUES (
                    row.idoilfieldoperations::INTEGER,
                    row.value,
                    row.idStandardElement::INTEGER,
                    row.idStandardWellInfrastructureType::INTEGER,
                    row.idCondition::INTEGER,
                    row.idCouplingCondition::INTEGER,
                    coalesce((select value::numeric from fieldmodule f1 where f1.parent::TEXT = row.parent::TEXT and f1.idoilfieldoperations::TEXT=row.idoilfieldoperations::TEXT and f1.key = 'md_top'),1), -- Default value for mdTop
                    coalesce((select value::numeric from fieldmodule f1 where f1.parent::TEXT = row.parent::TEXT and f1.idoilfieldoperations::TEXT=row.idoilfieldoperations::TEXT and f1.key = 'md_base'),1), -- Default value for mdTop, -- Default value for mdBase
                    coalesce((select value::numeric  from fieldmodule f1 where f1.parent::TEXT = row.parent::TEXT and f1.idoilfieldoperations::TEXT=row.idoilfieldoperations::TEXT and f1.key = 'quantity'),1), -- Default value for mdTop, -- Default value for quantity
                    NOW(), -- Current timestamp
                    p_idChangedBy -- User making the change
                )
                RETURNING id INTO inserted_row_id;

                -- Update the fieldmodule with the inserted row ID
                UPDATE fieldmodule
                SET tablerowid = inserted_row_id::TEXT
                WHERE parent = row.parent;
                  --AND key = row.key;
            --ELSE
                -- Update the previously inserted row
            --    UPDATE "WellHistoricalInfrastructureElements"
            --    SET 
            --        "mdTop" = CASE WHEN row.propertyname = 'mdTop' THEN row.value::NUMERIC ELSE "mdTop" END,
            --        "mdBase" = CASE WHEN row.propertyname = 'mdBase' THEN row.value::NUMERIC ELSE "mdBase" END,
            --        quantity = CASE WHEN row.propertyname = 'quantity' THEN row.value::NUMERIC ELSE quantity END
            --    WHERE id::TEXT = inserted_row_id::TEXT;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Optionally log the error
                RAISE NOTICE 'Error processing row with parent %, key %: %', row.parent, row.key, SQLERRM;
                -- Skip to the next iteration
                CONTINUE;
        END;
    END LOOP;
END;
$procedure$
;
-- DROP FUNCTION public.trg_element_tally_after_delete();

CREATE OR REPLACE FUNCTION public.trg_element_tally_after_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Si la fila eliminada es un padre (no tiene padre asignado)
  IF OLD."tallyGroupParent" IS NULL AND OLD."tallyGroup" IS NOT NULL THEN
    DELETE FROM "ElementTally"
    WHERE "tallyGroupParent" = OLD."tallyGroup";
  END IF;

  RETURN NULL;
END;
$function$
;
-- DROP FUNCTION public.trg_element_tally_after_insert();

CREATE OR REPLACE FUNCTION public.trg_element_tally_after_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  i INTEGER;
  new_group UUID;
BEGIN
  -- Evitar que el trigger se dispare sobre los hijos
  IF NEW."tallyGroupParent" IS NOT NULL THEN
    RETURN NULL;
  END IF;

  -- Generar UUID para la fila original
  new_group := gen_random_uuid();

  -- Asignar el grupo a la fila original
  UPDATE "ElementTally"
  SET "tallyGroup" = new_group
  WHERE id = NEW.id;

  -- Insertar filas hijas solo si quantity > 0
  IF NEW."quantity" > 0 and NEW."quantity" < 100 THEN
    FOR i IN 1..(NEW."quantity") LOOP
      INSERT INTO "ElementTally" (
        "element_id",
        "tally_id",
        "sequence_number",
        "idWellSegment",
        "quantity",
        "tallyGroup",
        "tallyGroupParent"
      )
      VALUES (
        NEW."element_id",
        NEW."tally_id",
        i,
        NEW."idWellSegment",
        1,
        gen_random_uuid(), -- nuevo grupo para cada hijo
        new_group           -- referencia al grupo padre
      );
    END LOOP;

   
  END IF;

  RETURN NULL;
END;
$function$
;
-- DROP PROCEDURE public.update_all_fieldmodule_paths(int4);

CREATE OR REPLACE PROCEDURE public.update_all_fieldmodule_paths(IN p_idoilfieldoperations integer)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
  row_data RECORD;
BEGIN
  FOR row_data IN
    SELECT parent, value
    FROM fieldmodule
    WHERE key = 'assembly_comp_id'
      AND idOilfieldOperations = p_idOilfieldOperations
  LOOP
    UPDATE fieldmodule
    SET path = path || '//' || row_data.value
    WHERE parent = row_data.parent
      AND idOilfieldOperations::integer = p_idOilfieldOperations::integer
      AND key <> 'assembly_comp_id'; -- opcional: no tocar las filas base
  END LOOP;
END;
$procedure$
;
-- DROP PROCEDURE public.update_all_fieldmodule_paths(text);

CREATE OR REPLACE PROCEDURE public.update_all_fieldmodule_paths(IN p_idoilfieldoperations text)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
  row_data RECORD;
BEGIN
  FOR row_data IN
    SELECT parent, value
    FROM fieldmodule
    WHERE key = 'assembly_comp_id'
      AND idOilfieldOperations = p_idOilfieldOperations
      AND uploadstate = 'raw'
  LOOP
    UPDATE fieldmodule
    SET path = path || '//' || row_data.value
    WHERE parent = row_data.parent
      AND idOilfieldOperations = p_idOilfieldOperations
      AND key <> 'assembly_comp_id'
      AND (path IS NULL OR path NOT LIKE '%' || '//' || row_data.value || '%');
  END LOOP;
END;
$procedure$
;
-- DROP PROCEDURE public.update_all_fieldmodule_paths(uuid);

CREATE OR REPLACE PROCEDURE public.update_all_fieldmodule_paths(IN p_idoilfieldoperations uuid)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
  row_data RECORD;
BEGIN
  FOR row_data IN
    SELECT parent, value
    FROM fieldmodule
    WHERE key = 'assembly_comp_id'
      AND idOilfieldOperations = p_idOilfieldOperations
  LOOP
    UPDATE fieldmodule
    SET path = path || '//' || row_data.value
    WHERE parent = row_data.parent
      AND idOilfieldOperations = p_idOilfieldOperations
      AND key <> 'assembly_comp_id'; -- opcional: no tocar las filas base
  END LOOP;
END;
$procedure$
;
-- DROP FUNCTION public.update_dynamic_table();

CREATE OR REPLACE FUNCTION public.update_dynamic_table()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    dynamic_query TEXT;
BEGIN

	-- Construct the dynamic SQL query with different logic for 'welhistorical'
    IF NEW.tablename = 'WellHistoricalInfrastructureElements' THEN
        dynamic_query := 'UPDATE "' || NEW.tablename || 
                         '" SET "' || NEW.propertyname || 
                         '" = $1::float WHERE id = $2::integer';
    ELSE
        dynamic_query := 'UPDATE "' || NEW.tablename || 
                         '" SET value = $1 WHERE id = $2::integer';
    END IF;
    -- Execute the dynamic SQL query
    EXECUTE dynamic_query USING NEW.value, NEW.tablerowid;

    RETURN NEW;
END;
$function$
;
-- DROP FUNCTION public.update_modify_date();

CREATE OR REPLACE FUNCTION public.update_modify_date()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.modifyDate = NOW(); -- Set modifyDate to current timestamp
  RETURN NEW;
END;
$function$
;
-- DROP FUNCTION public.update_modify_date_and_modify_by();

CREATE OR REPLACE FUNCTION public.update_modify_date_and_modify_by()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update modifyDate and modifiedBy only if specific columns change
  IF NEW.value IS DISTINCT FROM OLD.value OR
     NEW.key IS DISTINCT FROM OLD.key THEN
    NEW.modifyDate = NOW();
  END IF;
  RETURN NEW;
END;
$function$
;
-- DROP FUNCTION public.update_modify_date_and_user();

CREATE OR REPLACE FUNCTION public.update_modify_date_and_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update modifyDate and modifiedBy only if specific columns change
  IF NEW.value IS DISTINCT FROM OLD.value OR
     NEW.key IS DISTINCT FROM OLD.key THEN
    NEW.modifyDate = NOW();
    NEW.modifiedBy = current_user; -- Capture the user who performed the update
  END IF;
  RETURN NEW;
END;
$function$
;
-- DROP FUNCTION public.update_modify_date_and_user2();

CREATE OR REPLACE FUNCTION public.update_modify_date_and_user2()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update modifyDate and modifiedBy only if specific columns change
  IF NEW.value IS DISTINCT FROM OLD.value OR
     NEW.key IS DISTINCT FROM OLD.key THEN
    NEW.modifyDate = NOW();
    NEW.modifiedBy = OLD.modifiedBy  ; -- Capture the user who performed the update
  END IF;
  RETURN NEW;
END;
$function$
;
create trigger trigger_after_insert_wellhistoricalinfrastructureelements after
insert
    on
    public."WellHistoricalInfrastructureElements" for each row execute function after_insert_wellhistoricalinfrastructureelements()create trigger set_modify_date before
update
    on
    public.fieldmodule for each row execute function update_modify_date_and_modify_by()
    
create trigger trigger_delete_related_row after
delete
    on
    public.fieldmodule for each row
    when (((old.tablename is not null)
        and (old.tablerowid is not null))) execute function delete_related_row()
        create trigger update_dynamic_table_trigger after
update
    of value on
    public.fieldmodule for each row
    when ((old.value is distinct
from
    new.value)) execute function update_dynamic_table()

create trigger trg_element_tally_insert after
insert
    on
    public."ElementTally" for each row execute function trg_element_tally_after_insert()

create trigger trg_element_tally_delete after
delete
    on
    public."ElementTally" for each row execute function trg_element_tally_after_delete()
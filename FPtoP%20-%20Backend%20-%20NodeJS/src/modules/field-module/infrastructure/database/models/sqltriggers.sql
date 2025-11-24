----------------------------process to update values on fptop datamodel--------------------------
CREATE OR REPLACE FUNCTION update_dynamic_table()
RETURNS TRIGGER AS $$
DECLARE
    dynamic_query TEXT;
BEGIN
    -- Construct the dynamic SQL query with quoted table name
    dynamic_query := 'UPDATE "' || NEW.tablename || 
                     '" SET value = $1 WHERE id = $2::integer';

    -- Execute the dynamic SQL query
    EXECUTE dynamic_query USING NEW.value, NEW.tablerowid;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER update_dynamic_table_trigger
AFTER UPDATE OF value ON fieldmodule
FOR EACH ROW
WHEN (OLD.value IS DISTINCT FROM NEW.value)
EXECUTE FUNCTION update_dynamic_table();


CREATE OR REPLACE FUNCTION delete_related_row()
RETURNS TRIGGER AS $$
DECLARE
    sql TEXT;
BEGIN
    -- Build the SQL command dynamically
    sql := 'DELETE FROM ' || quote_ident(OLD.tablename) || ' WHERE id = $1';

    -- Execute the dynamic SQL with the tablerowid as parameter
    EXECUTE sql USING OLD.tablerowid;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_delete_related_row
AFTER DELETE ON fieldmodule
FOR EACH ROW
WHEN (OLD.tablename IS NOT NULL AND OLD.tablerowid IS NOT NULL)
EXECUTE FUNCTION delete_related_row();


si no funciona el uuid 
npm install --save-dev @types/uuid
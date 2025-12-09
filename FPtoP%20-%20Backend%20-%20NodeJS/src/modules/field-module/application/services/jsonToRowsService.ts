import { v4 as uuidv4 } from 'uuid';
import { postgres_sequelize } from '../../infrastructure/database/sequelize';
import { QueryTypes } from 'sequelize';
import schema from '../../infrastructure/config/fieldMappingConfig.json'; // Load the schema at the top
import { table } from 'console';
/**
 * Parse JSON data and save it to the database
 * @param jsonData The JSON data to parse
 * @param masterTable The name of the master table
 */
export async function parseAndSaveJsonToDB(
  jsonData: Record<string, any>,
  masterTable: string,
  idoilfieldoperations: string,
  modifiedby: string,
) {
  try {
    const masterRowId = uuidv4();

    // Insert the master row
    console.log("modifiedby", modifiedby);
    await postgres_sequelize.query(
      `INSERT INTO ${masterTable} (rowId, parent, idoilfieldoperations, type, key, value, path, tableName, propertyName, referenceTable, referenceProperty, openwellsvalue, uploadState, modifiedby)
       VALUES (:rowId, :parent, :idoilfieldoperations, :type, :key, :value, :path, :tableName, :propertyName, :referenceTable, :referenceProperty, :openwellsvalue, :uploadState, :modifiedby)`,
      {
        replacements: {
          rowId: masterRowId,
          parent: null,
          idoilfieldoperations: idoilfieldoperations,
          type: 'master',
          key: null,
          value: null,
          path: null,
          tableName: masterTable,
          propertyName: null,
          referenceTable: null,
          referenceProperty: null,
          openwellsvalue: null,
          uploadState: 'raw',
          modifiedby: modifiedby,
        },
        type: QueryTypes.INSERT,
      },
    );

    // Recursively parse JSON and save rows
    await parseJsonToRows(
      jsonData,
      masterRowId,
      '',
      masterTable,
      schema,
      idoilfieldoperations,
      modifiedby,
    );

    console.log('Data processed and saved successfully!');
  } catch (error) {
    console.error('Error processing and saving JSON data:', error);
    throw error;
  }
}

/**
 * Recursively parse JSON and save rows
 * @param jsonData The JSON data to parse
 * @param parentId The parent row ID
 * @param path The current path in the hierarchy
 * @param masterTable The name of the master table
 */
async function parseJsonToRows(
  jsonData: Record<string, any>,
  parentId: string,
  path: string,
  masterTable: string,
  currentSchema: any,
  idoilfieldoperations: string,
  modifiedby: string,
) {
  const batch = [];
  console.log('path', path)
  for (const key in jsonData) {
    console.log(`Processing key: ${key}, parentId: ${parentId}`);

    let schemaNode = currentSchema?.children?.[key];

    // Dynamic schema handling for 'ensambles'
    if (path.startsWith('ensambles') && !schemaNode) {
      schemaNode = {
        type: 'value',
        tableName: 'WellHistoricalInfrastructureElements',
        propertyName: null,
        referenceTable: null,
        referenceProperty: null,
        children: jsonData[key] && typeof jsonData[key] === 'object' ? {} : undefined,
      };

      switch (key) {
        case 'joints':
          schemaNode.propertyName = 'quantity';
          schemaNode.referenceTable = 'StandardOilfieldOperationsDataSectionElement';
          schemaNode.referenceProperty = 'nameOpenWells';
          break;
        case 'catalog_key_desc':
          schemaNode.propertyName = 'openWellsDescription';
          break;
        case 'md_top':
          schemaNode.propertyName = 'mdTop';
          break;
        case 'md_base':
          schemaNode.propertyName = 'mdBase';
          break;
        //case 'assembly_comp_id':
        //  schemaNode.propertyName = 'assembly_comp_id';
        //  break;
        default:
          schemaNode.referenceTable = '';
          schemaNode.referenceProperty = '';
          schemaNode.propertyName = '';
          schemaNode.tableName = 'WellHistoricalInfrastructureElementsDetail';
      }
    }

    // Skip invalid keys
    if (!schemaNode) {
      console.log(`Skipping key: ${key} (not in schema)`);
      continue;
    }

    const type = schemaNode.type || 'property';
    const currentPath = path ? `${path}//${key}` : key;

    if (Array.isArray(jsonData[key])) {
      for (const item of jsonData[key]) {
        if (typeof item === 'object' && !Array.isArray(item)) {
          const arrayRowId = uuidv4();
          batch.push({
            rowId: arrayRowId,
            parent: parentId,
            idoilfieldoperations: idoilfieldoperations,
            type: 'array-item',
            key,
            value: null,
            path: currentPath,
            tableName: schemaNode.tableName || null,
            propertyName: schemaNode.propertyName || null,
            referenceTable: schemaNode.referenceTable || null,
            referenceProperty: schemaNode.referenceProperty || null,
            openwellsvalue: null,
            uploadState: 'raw',
          });

          await parseJsonToRows(
            item,
            arrayRowId,
            currentPath,
            masterTable,
            schemaNode,
            idoilfieldoperations,
            modifiedby,
          );
        } else {
          batch.push({
            rowId: uuidv4(),
            parent: parentId,
            idoilfieldoperations: idoilfieldoperations,
            type: 'array-item',
            key,
            value: item,
            path: currentPath,
            tableName: schemaNode.tableName || null,
            propertyName: schemaNode.propertyName || null,
            referenceTable: schemaNode.referenceTable || null,
            referenceProperty: schemaNode.referenceProperty || null,
            openwellsvalue: item,
            uploadState: 'raw',
          });
        }
      }
      continue;
    }

    if (schemaNode.children) {
      const childData = jsonData[key]?.children || jsonData[key];
      if (childData) {
        await parseJsonToRows(
          childData,
          parentId,
          currentPath,
          masterTable,
          schemaNode,
          idoilfieldoperations,
          modifiedby,
        );
      }
      continue;
    }

    batch.push({
      rowId: uuidv4(),
      parent: parentId,
      idoilfieldoperations: idoilfieldoperations,
      type,
      key,
      value: schemaNode.noValue === true ? '' : (typeof jsonData[key] === 'object' ? null : jsonData[key]),
      path: currentPath,
      tableName: schemaNode.tableName || null,
      propertyName: schemaNode.propertyName || null,
      referenceTable: schemaNode.referenceTable || null,
      referenceProperty: schemaNode.referenceProperty || null,
      openwellsvalue: typeof jsonData[key] === 'object' ? null : jsonData[key],
      uploadState: 'raw',
    });
  }

  console.log('Batch before insert:', batch);

  if (batch.length > 0) {
    // Build the VALUES part with placeholders and a flat array of replacements
    const rowPlaceholders: string[] = [];
    const flatValuesArray: any[] = [];

    batch.forEach(row => {
      rowPlaceholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      flatValuesArray.push(
        row.rowId,
        row.parent,
        row.idoilfieldoperations,
        row.type,
        row.key,
        row.value,
        row.path,
        row.tableName,
        row.propertyName,
        row.referenceTable,
        row.referenceProperty,
        row.openwellsvalue,
        row.uploadState,
        modifiedby
      );
    });

    const insertQuery = `
      INSERT INTO ${masterTable} 
      (rowId, parent, idoilfieldoperations, type, key, value, path, tableName, propertyName, referenceTable, referenceProperty, openwellsvalue, uploadState, modifiedby) 
      VALUES ${rowPlaceholders.join(', ')}
    `;

    await postgres_sequelize.query(insertQuery, {
      type: QueryTypes.INSERT,
      replacements: flatValuesArray
    });

  } else {
    console.log('No rows to insert for this batch.');
  }

}

export async function parseAndSaveJsonToDBnoEnsambles(
  jsonData: Record<string, any>,
  masterTable: string,
  idoilfieldoperations: string,
  modifiedby: string,
) {
  try {
    const masterRowId = uuidv4();

    // Insert the master row
    console.log("modifiedby", modifiedby)
    await postgres_sequelize.query(
      `INSERT INTO ${masterTable} (rowId, parent,idoilfieldoperations, type, key, value, path, tableName, propertyName, referenceTable, referenceProperty,openwellsvalue, uploadState, modifiedby) 
       VALUES (:rowId, :parent,:idoilfieldoperations, :type, :key, :value, :path, :tableName, :propertyName, :referenceTable, :referenceProperty, :openwellsvalue , :uploadState, :modifiedby)`,
      {
        replacements: {
          rowId: masterRowId,
          parent: null,
          idoilfieldoperations: idoilfieldoperations,
          type: 'master',
          key: null,
          value: null,
          path: null,
          tableName: masterTable,
          propertyName: null,
          referenceTable: null,
          referenceProperty: null,
          openwellsvalue: null,
          uploadState: 'raw',
          modifiedby: modifiedby,
        },
        type: QueryTypes.INSERT,
      },
    );

    // Recursively parse JSON and save rows
    await parseJsonToRowsNoEnsambles(
      jsonData,
      masterRowId,
      '',
      masterTable,
      schema,
      idoilfieldoperations,
      modifiedby,
    );

    console.log('Data processed and saved successfully!');
  } catch (error) {
    console.error('Error processing and saving JSON data:', error);
    throw error;
  }
}

/**
 * Recursively parse JSON and save rows
 * @param jsonData The JSON data to parse
 * @param parentId The parent row ID
 * @param path The current path in the hierarchy
 * @param masterTable The name of the master table
 */
async function parseJsonToRowsNoEnsambles(
  jsonData: Record<string, any>,
  parentId: string,
  path: string,
  masterTable: string,
  currentSchema: any, // Pass the relevant part of the schema
  idoilfieldoperations: string,
  modifiedby: string,
) {
  const batch = [];

  for (const key in jsonData) {
    console.log(`Processing key: ${key}, parentId: ${parentId}`);

    const schemaNode = currentSchema?.children?.[key];

    // Skip validation for dynamic keys like "3NT8m" and process their children
    if (!schemaNode && currentSchema?.children?.children) {
      console.log(
        `Detected dynamic key: ${key}, skipping validation and processing children`,
      );

      // Recursively process the inner content of the dynamic key
      await parseJsonToRowsNoEnsambles(
        jsonData[key],
        parentId,
        `${path}//${key}`,
        masterTable,
        currentSchema.children, // Continue with the current schema's children
        idoilfieldoperations,
        modifiedby,
      );

      continue;
    }

    if (!schemaNode) {
      console.log(
        `Skipping key: ${key} (not in schema or schema has no children for this key)`,
      );
      continue;
    }

    console.log(`Schema node for key ${key}:`, schemaNode);

    const type = schemaNode.type || 'property';
    const currentPath = path ? `${path}//${key}` : key;

    if (Array.isArray(jsonData[key])) {
      //console.log(`Processing array for key: ${key}`);
      for (const item of jsonData[key]) {
        if (typeof item === 'object' && !Array.isArray(item)) {
          const arrayRowId = uuidv4();
          batch.push({
            rowId: arrayRowId,
            parent: parentId,
            idoilfieldoperations: idoilfieldoperations,
            type: 'array-item',
            key,
            value: null,
            path: currentPath,
            tableName: schemaNode.tableName || null,
            propertyName: schemaNode.propertyName || null,
            referenceTable: schemaNode.referenceTable || null,
            referenceProperty: schemaNode.referenceProperty || null,
            openwellsvalue: null,
            uploadState: 'raw',
          });

          await parseJsonToRowsNoEnsambles(
            item,
            arrayRowId,
            currentPath,
            masterTable,
            schemaNode,
            idoilfieldoperations,
            modifiedby,
          );
        } else {
          batch.push({
            rowId: uuidv4(),
            parent: parentId,
            idoilfieldoperations: idoilfieldoperations,
            type: 'array-item',
            key,
            value: item,
            path: currentPath,
            tableName: schemaNode.tableName || null,
            propertyName: schemaNode.propertyName || null,
            referenceTable: schemaNode.referenceTable || null,
            referenceProperty: schemaNode.referenceProperty || null,
            openwellsvalue: item,
            uploadState: 'raw',
          });
        }
      }
      continue;
    }

    if (schemaNode.children) {
      console.log(`Processing children for key: ${key}`);
      const childData = jsonData[key]?.children || jsonData[key];
      if (childData) {
        await parseJsonToRowsNoEnsambles(
          childData,
          parentId,
          currentPath,
          masterTable,
          schemaNode,
          idoilfieldoperations,
          modifiedby,
        );
      }
      continue;
    }

    batch.push({
      rowId: uuidv4(),
      parent: parentId,
      idoilfieldoperations: idoilfieldoperations,
      type,
      key,
      value: schemaNode.noValue === true ? '' : (typeof jsonData[key] === 'object' ? null : jsonData[key]),
      path: currentPath,
      tableName: schemaNode.tableName || null,
      propertyName: schemaNode.propertyName || null,
      referenceTable: schemaNode.referenceTable || null,
      referenceProperty: schemaNode.referenceProperty || null,
      openwellsvalue: typeof jsonData[key] === 'object' ? null : jsonData[key],
      uploadState: 'raw',
    });
  }

  console.log('Batch before insert:', batch);

  if (batch.length > 0) {
    const values = batch
      .map(
        row =>
          `('${row.rowId}', '${row.parent}','${row.idoilfieldoperations}', '${row.type}', '${row.key}', '${row.value}', '${row.path}', '${row.tableName}', '${row.propertyName}', '${row.referenceTable}', '${row.referenceProperty}', '${row.value}', '${row.uploadState}', '${modifiedby}')`,
      )
      .join(', ');

    await postgres_sequelize.query(
      `INSERT INTO ${masterTable} 
       (rowId, parent, idoilfieldoperations, type, key, value, path, tableName, propertyName, referenceTable, referenceProperty,openwellsvalue, uploadState, modifiedby) 
       VALUES ${values}`,
      { type: QueryTypes.INSERT },
    );
  } else {
    console.log('No rows to insert for this batch.');
  }
}

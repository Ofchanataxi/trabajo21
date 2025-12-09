import { postgres_sequelize } from '../../infrastructure/database/sequelize';
import { QueryTypes } from 'sequelize';

export const processRows = async (idoilfieldoperations: string) => {
  try {
    // Insert the master row
    const userid = 2;
    await postgres_sequelize.query(
      'CALL insert_oilfield_operations_data(:idoilfieldoperations);CALL insert_oilfield_operations_sand_data(:idoilfieldoperations);CALL insert_well_historical_infrastructure_elements(:userid,:idoilfieldoperations);CALL insert_oilfield_operations_perforation_data(:idoilfieldoperations);CALL update_all_fieldmodule_paths(:idoilfieldoperations);CALL deduplicate_fieldmodule_paths(:idoilfieldoperations);',
      {
        replacements: { idoilfieldoperations, userid },
        type: QueryTypes.INSERT,
      },
    );
    
    console.log('Data processed and saved successfully!');
  } catch (error) {
    console.error('Error processing and saving JSON data:', error);
    throw error;
  }
};

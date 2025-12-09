import { Router } from 'express';
import { createGenericController } from '../controllers/GenericController';
import { GenericService } from '../../../application/services/GenericService';
import { GenericRepository } from '../../../domain/repositories/GenericRepository';
import { postgres_sequelize } from '../../../infrastructure/database/sequelize';
//import { processAndSaveJson } from '../../../application/services/saveJsonService';
//import { fieldMapping } from '../../../infrastructure/config/fieldMappingConfig';
import { parseAndSaveJsonToDB } from '../../../application/services/jsonToRowsService';

import * as fs from 'fs';
import {
  getExcelReportDH,
  getExcelReportSumarioWO,
  getExcelReportTally,
} from '../controllers/reportingController';
import { getExcelReportSumarioCPI } from '../controllers/reportingController';

import {
  createModel,
  getRelatedModelsForTable,
  defineAssociationsFromForeignKeys,
  getInfoData,
  getSandsStandardAttributes,
  getElements,
  updateRows,
  getLastUpdateDateUser,
  updateFields,
  getEquipmentsOptions,
  deleteByIdOilfieldOperations,
  getTallyElements,
  getReports,
} from '../../../infrastructure/database/models/dynamicModel';

const router = Router();
export const tableControllers: Record<string, any> = {};

async function createService(baseTableName: string) {
  const { model } = await createModel(baseTableName);

  const relatedModels = getRelatedModelsForTable(baseTableName);

  const service = new GenericService(new GenericRepository(model));
  return { service, relatedModels };
}

async function registerDynamicRoutes() {
  const tableNames = [
    //'Tally',
    //'ElementTally',
    'fieldmodule',
    'OilfieldOperations',
    //'ApplicationPages',
    //'ElementDetail',
    //'ElementRelease',
    //'UserGroupsAccess',
    'Users',
    'Well',
    //'oilfieldOperationsData',
    //'oilfieldOperationsDataHistory',
    //'MetaDataOperationDocuments',
    //'OilfieldOperationsCasingAssembly',
    //'OilfieldOperationsCasingAssemblyAttributes',
    //'OilfieldOperationsCasingAssemblyAttributesHistory',
    //'OilfieldOperationsCasingAssemblyHistory',
    //'OilfieldOperationsSand',
    //'OilfieldOperationsSandAttributes',
    //'OilfieldOperationsSandAttributesHistory',
    //'OilfieldOperationsSandHistory',
    //'OilfieldOperationsSandPerforation',
    //'OilfieldOperationsSandPerforationAttributes',
    //'OilfieldOperationsSandPerforationAttributesHistory',
    //'OilfieldOperationsSandPerforationHistory',
    'OilfieldTypeOperations',
    //'OpenWellsAssemblyTypes',
    //'OpenWellsSections',
    //'OperationDocuments',
    //'PagesAllowAccess',
    //'PermissionsGroups',
    //'Release',
    //'ReleaseState',
    //'ReleaseStateHistory',
    'Rig',
    //'StandardAttributeOptions',
    //'StandardAttributeTypes',
    //'StandardAttributes',
    //       'StandardBusinessLines',
    //      'StandardCommonAttributes',
    //     'StandardCondition',
    //     'StandardCouplingCondition',
    'StandardElements',
    'v_standard_element_attributes',
    'StandardElements_CommonAttributes',
    //     'StandardGenericFileAssociations',
    'StandardOilfieldOperationsDataSection',
    'StandardOilfieldOperationsDataSectionElement',
    'StandardOilfieldOperationsSandAttributes',
    'StandardOilfieldOperationsSandPerforationAttributes',
    'StandardWellInfrastructureType',
    //     'StandardRequiredFiles',
    //     'StandardWellSections',
    //     'StoredFilesAzure',s
    //     'StandardAttributes',*/
  ];

  for (const tableName of tableNames) {
    try {
      await createModel(tableName);
      const service = new GenericService(
        new GenericRepository(postgres_sequelize.models[tableName]),
      );
      const controller = createGenericController(service);
      tableControllers[tableName] = controller;

      router.get(`/${tableName}`, controller.getAll);
      router.get(`/${tableName}/:id`, controller.getOne);
      router.post(`/${tableName}`, controller.create);
      router.put(`/${tableName}/:id`, controller.update);
      router.delete(`/${tableName}/:id`, controller.delete);

      //console.log(`Routes registered for ${tableName}`);
    } catch (error) {
      console.log(`faile to register route for  ${tableName}`, error);
      continue;
    }
  }

  //await defineAssociationsFromForeignKeys();

  /*router.post('/joinTables', async (req, res) => {
        try {
            const { baseTableName } = req.body;
            const { service, relatedModels } = await createService(baseTableName);
            const data = await service.getWithJoins(relatedModels);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error });
        }
    });*/
  router.post('/infoData', async (req, res) => {
    try {
      const { baseTableName, idOilFielOperations } = req.body;
      //const { service, relatedModels } = await createService(baseTableName);
      const data = await getInfoData(idOilFielOperations);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post('/sandStandardAttributes', async (req, res) => {
    try {
      const { baseTableName, idOilFielOperations } = req.body;
      const data = await getSandsStandardAttributes(idOilFielOperations);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  router.post('/well-elements', async (req, res) => {
    try {
      console.log('well-elements');
      const { baseTableName, idOilFielOperations } = req.body;
      //const { service, relatedModels } = await createService(baseTableName);
      const data = await getElements(idOilFielOperations);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post('/well-reports', async (req, res) => {
    try {
      console.log('well-reports')
      const { idOilFielOperations } = req.body;
      //const { service, relatedModels } = await createService(baseTableName);
      const data = await getReports(idOilFielOperations);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post('/tally-elements', async (req, res) => {
    try {
      console.log('tally-elements');
      const { idOilFielOperations } = req.body;
      //const { service, relatedModels } = await createService(baseTableName);
      const data = await getTallyElements(idOilFielOperations);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  router.get('/EquipmentsOptions', async (req, res) => {
    try {
      const data = await getEquipmentsOptions();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  /*
  router.post('/inser', async (req, res) => {
    try {
      const jsonResult = {
        encabezado: {
          equipo: 'ORIENDRILL S.A., ORD-903, ',
        },
      };
      const masterTable = 'OilfieldOperations';

      const masterTableData = {
        id: 10003,
        idOilfieldTypeOperations: 2, // Example values
        idWell: 1,
        idRig: 1,
        operationNumber: 10001,
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
      };

      await processAndSaveJson(
        jsonResult,
        fieldMapping,
        masterTable,
        masterTableData,
      );

      console.log('Data saved successfully!');
    } catch (error) {
      res.status(500).json({ error });
    }
  });
*/
  router.post('/insert', async (req, res) => {
    try {
      const filePath =
        'C:\\Users\\fburneo3\\OneDrive - SLB\\Desktop\\desktop\\doc\\SHAYA\\FPtoP\\FPtoP - Backend - NodeJS\\test3.json'; // Replace with the actual file path
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent); // Parse the JSON content from the file
      const { idOilFielOperations, modifiedby } = req.body;
      //console.log('modifiedby from dynamic routes', modifiedby)
      await parseAndSaveJsonToDB(
        jsonData,
        'fieldModule',
        idOilFielOperations,
        modifiedby,
      );
      //await processRows(idOilFielOperations);

      //console.log('Data saved successfully!');
      res
        .status(200)
        .json({ message: 'Data processed and saved successfully!' });
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post('/update', async (req, res) => {
    try {
      const { idOilFielOperations, rows, user } = req.body;
      //await processRows(idOilFielOperations);
      await updateRows(idOilFielOperations, rows, user);
      res
        .status(200)
        .json({ message: 'Data processed and saved successfully!' });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  router.post('/deletebyIdOilfieldOperation', async (req, res) => {
    try {
      const { idOilfielOperations } = req.body;
      //await processRows(idOilFielOperations);
      await deleteByIdOilfieldOperations(idOilfielOperations);
      res.status(200).json({ message: 'Data deleted' });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  router.post('/sumarioCPI', async (req, res) => {
    try {
      await getExcelReportSumarioCPI(req, res);
      console.log('fin CPI');
      // No need to send another res.status after that — the Excel is streamed directly.
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Error generating report' });
    }
  });

  // router.post('/runBesXslRepot', async (req, res) => {
  //   try {
  //     await getExcelReportRUNBES(req, res);
  //     // No need to send another res.status after that — the Excel is streamed directly.
  //   } catch (error) {
  //     console.error('Error generating report:', error);
  //     res.status(500).json({ error: 'Error generating report' });
  //   }
  // });

  router.post('/sumarioWO', async (req, res) => {
    try {
      await getExcelReportSumarioWO(req, res);
      console.log('fin WO');
      // No need to send another res.status after that — the Excel is streamed directly.
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Error generating report' });
    }
  });

  router.post('/tally', async (req, res) => {
    try {
      await getExcelReportTally(req, res);
      console.log('fin Tally')
      // No need to send another res.status after that — the Excel is streamed directly.
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Error generating report' });
    }
  });

  router.post('/dh', async (req, res) => {
    try {
      await getExcelReportDH(req, res);
      console.log('fin dh');
      // No need to send another res.status after that — the Excel is streamed directly.
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Error generating report' });
    }
  });

  router.post('/lastUpdateInfo', async (req, res) => {
    try {
      const { idOilFielOperations } = req.body;
      //console.log('idOilFielOperations', req.body);
      //const { service, relatedModels } = await createService(baseTableName);
      const data = await getLastUpdateDateUser(idOilFielOperations);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  router.post('/updateFields', async (req, res) => {
    try {
      const { rows, user } = req.body;
      //console.log('Field to update', req.body);
      //await processRows(idOilFielOperations);
      await updateFields(rows, user);
      res
        .status(200)
        .json({ message: 'Data processed and saved successfully!' });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
}

registerDynamicRoutes();

export default router;

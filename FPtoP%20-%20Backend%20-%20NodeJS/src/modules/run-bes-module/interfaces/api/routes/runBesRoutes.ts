import { getExcelReportRUNBES } from './../../../../field-module/interfaces/api/controllers/reportingController';
import { Router } from 'express';
import {
  createRunBesData,
  getInfoOperationDetails,
  getMechanicalDetails,
  getUndergroundEquipmentDetails,
  getDiametersCamisaCirculacion,
  getDiametersFlowCoupling,
  getDiametersNoGo,
  getYToolDetails,
  getDownholeHeaders,
  getCableProtectoresCant,
  getHeadersColumnsDownhole,
  getAnyReleaseALSvalidation,
  getProtectolizersCant,
  getBandasCant,
  getLowProfileCant,
  getInfDownholeBomb,
  getInfDownholeCabezaDescarga,
  getInfDownholeIntkSepGas,
  getInfDownholeProtectors,
  getInfDownholeMotores,
  getInfDownholeSensors,
  getInfDownholeTransferline,
  getInfDownholeCable,
  getInfDownholePenetrador,
  getDataRunBes,
  getDataRigTime,
  getReportSignFlow,
  signReportStep,
  createRunBesStateHistory,
  getLastRunBesState,
  getFilesOfOilFieldOperations,
  getStandardElementGroups,
  insertRunBesElementDetail,
  getElementDetailTemporals,
  getFileOfReportRunBes,
} from '../../../infrastructure/database/models/runBesModel';

const router = Router();

async function registerRunBesRoutes() {
  router.get('/operation-details', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfoOperationDetails(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/mechanical-details', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getMechanicalDetails(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/undergroundEquip-details', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getUndergroundEquipmentDetails(
          idOilFieldOperationNumber,
        );
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/anyReleaseALSvalidation', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getAnyReleaseALSvalidation(
          idOilFieldOperationNumber,
        );
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/diameters-camisaCircul', async (req, res) => {
    try {
      const data = await getDiametersCamisaCirculacion();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/diameters-flowCoupling', async (req, res) => {
    try {
      const data = await getDiametersFlowCoupling();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/diameters-noGo', async (req, res) => {
    try {
      const data = await getDiametersNoGo();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/undergroundEquip-YToolDetails', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getYToolDetails(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/cable-protectors', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getCableProtectoresCant(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/protectolizers', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getProtectolizersCant(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/bandas', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getBandasCant(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/low-profile', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getLowProfileCant(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/downhole-headers', async (req, res) => {
    try {
      const data = await getDownholeHeaders();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/downhole-headersColumns', async (req, res) => {
    try {
      const data = await getHeadersColumnsDownhole();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-cabezaDescarga', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeCabezaDescarga(
          idOilFieldOperationNumber,
        );
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-bombs', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeBomb(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-intkSepGas', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeIntkSepGas(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-protectors', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeProtectors(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-motors', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeMotores(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-sensors', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeSensors(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-transferline', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeTransferline(
          idOilFieldOperationNumber,
        );
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-cable', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholeCable(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-downhole-penetrador', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getInfDownholePenetrador(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-data-run-bes', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getDataRunBes(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.get('/information-data-rig-time', async (req, res) => {
    try {
      const { idOilFieldOperation } = req.query;
      if (idOilFieldOperation !== undefined) {
        const idOilFieldOperationNumber = parseInt(
          idOilFieldOperation.toString(),
          10,
        );
        if (isNaN(idOilFieldOperationNumber)) {
          return res.status(400).send('Invalid oilFieldOperationId');
        }
        const data = await getDataRigTime(idOilFieldOperationNumber);
        res.status(200).json(data);
      } else {
        res.status(400).send('Missing oilFieldOperation Id parameter');
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post('/createRunBesData', async (req, res) => {
    try {
      const data = req.body;
      const runBesId = await createRunBesData(data);
      res.status(200).json({ runBesId, data });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear RunBes' });
    }
  });

  router.post('/get-permissions-signature', async (req, res) => {
    try {
      const { idUser, idOilFieldOperation } = req.body;
      const data = await getReportSignFlow(idUser, idOilFieldOperation);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
}

router.post('/sign-report', async (req, res) => {
  try {
    const firmaId = req.body.firmaId;
    const { userId } = req.body;
    await signReportStep(userId, firmaId);
    res.status(200).json({ mensaje: 'Firma registrada correctamente' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post('/createRunBesStateHistory', async (req, res) => {
  try {
    const {
      idOilfieldOperations,
      fecha_notificacion,
      idUser,
      idPreviousState,
      idNewState,
      idFile,
    } = req.body;
    await createRunBesStateHistory(
      idOilfieldOperations,
      fecha_notificacion,
      idUser,
      idPreviousState,
      idNewState,
      idFile,
    );
    res
      .status(200)
      .json({ mensaje: 'createRunBesStateHistory registrada correctamente' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/getLastRunBesState', async (req, res) => {
  try {
    const { idOilFieldOperation } = req.query;
    if (idOilFieldOperation !== undefined) {
      const idOilFieldOperationNumber = parseInt(
        idOilFieldOperation.toString(),
        10,
      );
      if (isNaN(idOilFieldOperationNumber)) {
        return res.status(400).send('Invalid oilFieldOperationId');
      }
      const data = await getLastRunBesState(idOilFieldOperationNumber);
      res.status(200).json(data);
    } else {
      res.status(400).send('Missing oilFieldOperation Id parameter');
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/getFilesOfOilFieldOperations', async (req, res) => {
  try {
    const { idOilFieldOperation } = req.query;
    if (idOilFieldOperation !== undefined) {
      const idOilFieldOperationNumber = parseInt(
        idOilFieldOperation.toString(),
        10,
      );
      if (isNaN(idOilFieldOperationNumber)) {
        return res.status(400).send('Invalid oilFieldOperationId');
      }
      const data = await getFilesOfOilFieldOperations(
        idOilFieldOperationNumber,
      );
      res.status(200).json(data);
    } else {
      res.status(400).send('Missing oilFieldOperation Id parameter');
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/getStandardElementGroups', async (req, res) => {
  try {
    const data = await getStandardElementGroups();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post('/insertRunBesElementDetail', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload?.idRunBes || !Array.isArray(payload.attributes)) {
      return res.status(400).json({ error: 'Payload inválido' });
    }
    await insertRunBesElementDetail(payload);
    res.status(200).json({ message: 'Detalles insertados correctamente' });
  } catch (error: any) {
    console.error('Error al insertar RunBes details:', error);
    res
      .status(500)
      .json({ message: 'Error al insertar RunBes details', error });
  }
});

router.get('/getRunBesElementDetailTemporals', async (req, res) => {
  try {
    const { idOilFieldOperation } = req.query;
    if (idOilFieldOperation !== undefined) {
      const idOilFieldOperationNumber = parseInt(
        idOilFieldOperation.toString(),
        10,
      );
      if (isNaN(idOilFieldOperationNumber)) {
        return res.status(400).send('Invalid oilFieldOperationId');
      }
      const data = await getElementDetailTemporals(idOilFieldOperationNumber);
      res.status(200).json(data);
    } else {
      res.status(400).send('Missing oilFieldOperation Id parameter');
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post('/runBesXslRepot', async (req, res) => {
  try {
    await getExcelReportRUNBES(req, res);
    // No need to send another res.status after that — the Excel is streamed directly.
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

router.get('/getFileOfReportRunBes', async (req, res) => {
  try {
    const { idOilFieldOperation } = req.query;
    if (idOilFieldOperation !== undefined) {
      const idOilFieldOperationNumber = parseInt(
        idOilFieldOperation.toString(),
        10,
      );
      if (isNaN(idOilFieldOperationNumber)) {
        return res.status(400).send('Invalid oilFieldOperationId');
      }
      const data = await getFileOfReportRunBes(idOilFieldOperationNumber);
      res.status(200).json(data);
    } else {
      res.status(400).send('Missing oilFieldOperation Id parameter');
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});
registerRunBesRoutes();

export default router;

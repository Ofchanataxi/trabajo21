import { Request, Response } from 'express';
import { generateExcelSumarioCPI } from '../../../infrastructure/reporting/excelServiceSumarioCPI';
import { generateExcelSumarioWO } from '../../../infrastructure/reporting/excelServiceSumarioWO';
import { generateExcelRUNBES } from '../../../infrastructure/reporting/excelServiceRUNBES';
import { generateExcelTally } from '../../../infrastructure/reporting/excelServiceTALLY';
//import { generateWord } from '../services/reporting/wordService';

export const getExcelReportSumarioCPI = async (req: Request, res: Response) => {
  const { idOilFielOperations } = req.body;
  await generateExcelSumarioCPI(idOilFielOperations);
  res.status(200).json({ message: 'Archivo cargado correctamente' });
};

export const getExcelReportSumarioWO = async (req: Request, res: Response) => {
  const { idOilFielOperations } = req.body;
  await generateExcelSumarioWO(idOilFielOperations, res);
  res.status(200).json({ message: 'Archivo cargado correctamente' });
};

export const getExcelReportTally = async (req: Request, res: Response) => {
  const { idOilFielOperations } = req.body;
  await generateExcelTally(idOilFielOperations);
  res.status(200).json({ message: 'Archivo cargado correctamente' });
};

export const getExcelReportRUNBES = async (req: Request, res: Response) => {
  const { idOilFieldOperation } = req.body;
  await generateExcelRUNBES(idOilFieldOperation, res);
  res.status(200).json({ message: 'Archivo cargado correctamente' });
};

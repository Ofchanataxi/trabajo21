import { Request, Response } from 'express';
import { generateExcelSumarioCPI } from '../../../infrastructure/reporting/excelServiceSumarioCPI';
import { generateExcelSumarioWO } from '../../../infrastructure/reporting/excelServiceSumarioWO';
import { generateExcelRUNBES } from '../../../infrastructure/reporting/excelServiceRUNBES';
import { generateExcelTally } from '../../../infrastructure/reporting/excelServiceTALLY';
import { generateExcelDH } from '../../../infrastructure/reporting/excelServiceDH';
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

export const getExcelReportDH = async (req: Request, res: Response) => {
  const { idOilFielOperations, cpiwotype } = req.body;
  await generateExcelDH(idOilFielOperations, cpiwotype);
  res.status(200).json({ message: 'Archivo cargado correctamente' });
};

export const getExcelReportRUNBES = async (req: Request) => {
  const { idOilFieldOperation } = req.body;
  const filesReportRunBes = await generateExcelRUNBES(idOilFieldOperation);
  return filesReportRunBes;
};

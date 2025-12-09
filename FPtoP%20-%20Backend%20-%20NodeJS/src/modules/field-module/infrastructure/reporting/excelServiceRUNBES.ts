import { ReportManagementController } from './../../../file-management/interfaces/controllers/ReportManagementController';
import ExcelJS from 'exceljs';
import { Response } from 'express';
import pLimit from 'p-limit';
import { JSDOM } from 'jsdom';

import {
  getInfoOperationDetails,
  getDataRunBes,
  getMechanicalDetails,
  getInfDownholeCabezaDescarga,
  getInfDownholeBomb,
  getInfDownholeIntkSepGas,
  getInfDownholeProtectors,
  getInfDownholeMotores,
  getInfDownholeSensors,
  getInfDownholeTransferline,
  getInfDownholeCable,
  getDataRigTime,
  getCableProtectoresCant,
  getProtectolizersCant,
  getBandasCant,
  getLowProfileCant,
  getFileOfReportRunBes,
} from '../../../run-bes-module/infrastructure/database/models/runBesModel';
import path from 'path';

function extractPlaceholderKeys(text: string): string[] {
  const matches = text.match(/{{(.*?)}}/g);
  return matches ? matches.map(m => m.replace(/{{|}}/g, '').trim()) : [];
}

function getValueFromPath(obj: any, pathStr: string): any {
  return pathStr.split('.').reduce((acc, key) => acc?.[key], obj);
}

async function replacePlaceholdersWithMultipleRowsN(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  dataMap: { [key: string]: any[] },
): Promise<void> {
  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    const placeholderCells: { col: number; value: string }[] = [];
    row.eachCell((cell, colNumber) => {
      if (typeof cell.value === 'string' && cell.value.includes('{{')) {
        placeholderCells.push({ col: colNumber, value: cell.value });
      }
    });
    if (placeholderCells.length === 0) continue;
    const allPlaceholders = placeholderCells.flatMap(cell =>
      extractPlaceholderKeys(cell.value),
    );
    const involvedObjects = Array.from(
      new Set(allPlaceholders.map(k => k.split('.')[0])),
    );
    const mainRepeatObject = involvedObjects.find(
      obj => Array.isArray(dataMap[obj]) && dataMap[obj].length > 1,
    );
    const repeatCount = mainRepeatObject ? dataMap[mainRepeatObject].length : 1;
    if (repeatCount > 1) {
      worksheet.duplicateRow(rowIndex, repeatCount - 1, true);
    }
    for (let i = 0; i < repeatCount; i++) {
      const currentRow = worksheet.getRow(rowIndex + i);
      placeholderCells.forEach(cell => {
        let newValue = cell.value;
        for (const keyPath of extractPlaceholderKeys(cell.value)) {
          const [objName, ...fieldParts] = keyPath.split('.');
          const records = dataMap[objName];
          if (!records || records.length === 0) continue;
          const record = records[Math.min(i, records.length - 1)];
          const value = getValueFromPath(record, fieldParts.join('.'));
          let safeValue: any = value ?? '';
          if (typeof safeValue === 'string' && safeValue.includes('<')) {
            safeValue = htmlToPlainText(safeValue);
          }
          if (safeValue instanceof Date) {
            safeValue = safeValue.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          } else if (
            typeof safeValue === 'string' &&
            !isNaN(Date.parse(safeValue)) &&
            safeValue.includes('GMT')
          ) {
            const d = new Date(safeValue);
            safeValue = d.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          }
          newValue = newValue.replace(`{{${keyPath}}}`, safeValue);
        }
        const newCell = currentRow.getCell(cell.col);
        const prevStyle = { ...newCell.style };
        newCell.value = newValue;
        newCell.style = prevStyle;
      });
    }
    rowIndex += repeatCount - 1;
  }
}

async function replacePlaceholdersWithMultipleRows(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  dataMap: { [key: string]: any[] },
): Promise<void> {
  const workbookClean = new ExcelJS.Workbook();
  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    const placeholderCells: { col: number; value: string }[] = [];

    row.eachCell((cell, colNumber) => {
      if (typeof cell.value === 'string' && cell.value.includes('{{')) {
        placeholderCells.push({ col: colNumber, value: cell.value });
      }
    });

    if (placeholderCells.length === 0) continue;

    const allPlaceholders = placeholderCells.flatMap(cell =>
      extractPlaceholderKeys(cell.value),
    );
    const involvedObjects = new Set(allPlaceholders.map(k => k.split('.')[0]));
    for (const objectName of involvedObjects) {
      const records = dataMap[objectName];
      if (!records || records.length === 0) continue;
      for (let i = 0; i < records.length; i++) {
        const currentRow = i === 0 ? row : worksheet.getRow(rowIndex + i);
        placeholderCells.forEach(cell => {
          const originalValue = cell.value;
          const replacedValue = extractPlaceholderKeys(originalValue).reduce(
            (acc, keyPath) => {
              const [objName, ...fieldParts] = keyPath.split('.');
              if (objName === objectName) {
                const value = getValueFromPath(
                  records[i],
                  fieldParts.join('.'),
                );
                const safeValue =
                  typeof value === 'string' && value.includes('<')
                    ? htmlToPlainText(value)
                    : value ?? '';
                return acc.replace(`{{${keyPath}}}`, safeValue);
              }
              return acc;
            },
            originalValue,
          );
          const newCell = currentRow.getCell(cell.col);
          newCell.value = replacedValue;
        });
        const estimatedHeight = estimateRowHeight(currentRow);
        if (estimatedHeight > 15) {
          currentRow.height = estimatedHeight;
        }
      }
      if (records.length > 1) break;
    }
  }
}

function estimateRowHeight(row: ExcelJS.Row): number {
  let maxLines = 1;

  row.eachCell({ includeEmpty: false }, cell => {
    if (typeof cell.value === 'string') {
      const lines = cell.value.split('\n').length;
      if (lines > maxLines) {
        maxLines = lines;
      }
    }
  });

  // Puedes ajustar este factor según el tamaño de fuente
  const lineHeight = 15;
  return maxLines * lineHeight;
}
async function fillMechanicalDetails(
  worksheet: ExcelJS.Worksheet,
  data: any[],
) {
  const startRow = 16; // inicio de datos
  const endStaticRow = 20; // filas fijas
  const totalRows = data.length;
  const staticRows = endStaticRow - startRow + 1;
  for (let i = 0; i < Math.min(totalRows, staticRows); i++) {
    const rowIndex = startRow + i;
    const record = data[i];
    const row = worksheet.getRow(rowIndex);
    row.getCell(2).value = record.nameStandardElement || '';
    row.getCell(4).value = record.topeMD || '';
    row.getCell(5).value = record.fondoMD || '';
    row.getCell(6).value = record.outerDiameter || '';
    row.getCell(7).value = record.innerDiameter || '';
    row.getCell(8).value = record.peso || '';
    row.getCell(9).value = record.drift || '';
    row.getCell(10).value = record.rosca || '';
    row.getCell(11).value = record.clase || '';
    row.commit();
  }
  if (totalRows < staticRows) {
    for (let r = startRow + totalRows; r <= endStaticRow; r++) {
      const row = worksheet.getRow(r);
      for (let col = 2; col <= 11; col++) {
        row.getCell(col).value = '';
      }
      row.commit();
    }
  }
  const extraRows = totalRows - staticRows;
  if (extraRows > 0) {
    for (let i = 0; i < extraRows; i++) {
      const record = data[staticRows + i];
      const newRowIndex = endStaticRow + 1 + i;
      const newRow = worksheet.insertRow(newRowIndex, []);
      const templateRow = worksheet.getRow(endStaticRow);
      newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const templateCell = templateRow.getCell(colNumber);
        cell.style = { ...templateCell.style };
      });
      newRow.getCell(2).value = record.nameStandardElement || '';
      newRow.getCell(4).value = record.topeMD || '';
      newRow.getCell(5).value = record.fondoMD || '';
      newRow.getCell(6).value = record.outerDiameter || '';
      newRow.getCell(7).value = record.innerDiameter || '';
      newRow.getCell(8).value = record.peso || '';
      newRow.getCell(9).value = record.drift || '';
      newRow.getCell(10).value = record.rosca || '';
      newRow.getCell(11).value = record.clase || '';
      newRow.commit();
    }
  }
}

export async function generateExcelRUNBES(idOilFieldOperations: any) {
  const limit = pLimit(10);
  const [
    encabezado,
    datos_generales,
    detalles_mecanicos,
    dw_cabeza_descarga,
    dw_bombas,
    dw_intake_separador,
    dw_protectors,
    dw_motors,
    dw_sensors,
    dw_capilars,
    dw_cable,
    rig_time,
    protectores_cable,
    protectolizers,
    bandas,
    low_profile,
  ] = await Promise.all([
    limit(() => getInfoOperationDetails(idOilFieldOperations)),
    limit(() => getDataRunBes(idOilFieldOperations)),
    limit(() => getMechanicalDetails(idOilFieldOperations)),
    limit(() => getInfDownholeCabezaDescarga(idOilFieldOperations)),
    limit(() => getInfDownholeBomb(idOilFieldOperations)),
    limit(() => getInfDownholeIntkSepGas(idOilFieldOperations)),
    limit(() => getInfDownholeProtectors(idOilFieldOperations)),
    limit(() => getInfDownholeMotores(idOilFieldOperations)),
    limit(() => getInfDownholeSensors(idOilFieldOperations)),
    limit(() => getInfDownholeTransferline(idOilFieldOperations)),
    limit(() => getInfDownholeCable(idOilFieldOperations)),
    limit(() => getDataRigTime(idOilFieldOperations)),
    limit(() => getCableProtectoresCant(idOilFieldOperations)),
    limit(() => getProtectolizersCant(idOilFieldOperations)),
    limit(() => getBandasCant(idOilFieldOperations)),
    limit(() => getLowProfileCant(idOilFieldOperations)),
  ]);

  const workbook = new ExcelJS.Workbook();
  const templatePath = path.resolve(
    process.cwd(),
    'dist/modules/field-module/infrastructure/templates/',
    'RUNBES_TEMPLATE.xlsx',
  );
  await workbook.xlsx.readFile(templatePath);

  const dw_cabezaDescarga = pivotData(dw_cabeza_descarga);
  const dw_bombas_manejadores = pivotData(dw_bombas);
  const dw_bombas_manejadores_labeled = applyGroupLabels(
    dw_bombas_manejadores,
    2,
  );
  const dw_intakeSeparador = pivotData(dw_intake_separador);
  const dw_protectores = pivotData(dw_protectors);
  const dw_protectores_labeled = applyGroupLabels(dw_protectores, 5);
  const dw_motores = pivotData(dw_motors);
  const dw_sensores = pivotData(dw_sensors);
  const dw_capilares = pivotData(dw_capilars);
  const dw_cables = pivotData(dw_cable);

  const dataMap: { [key: string]: any[] } = {
    CABEZA_DESCARGA: Array.isArray(dw_cabezaDescarga)
      ? dw_cabezaDescarga
      : [dw_cabezaDescarga],
    BOMBAS_MANEJADOR: Array.isArray(dw_bombas_manejadores_labeled)
      ? dw_bombas_manejadores_labeled
      : [dw_bombas_manejadores_labeled],
    INTAKE_SEPARADORES: Array.isArray(dw_intakeSeparador)
      ? dw_intakeSeparador
      : [dw_intakeSeparador],
    PROTECTORES: Array.isArray(dw_protectores_labeled)
      ? dw_protectores_labeled
      : [dw_protectores_labeled],
    MOTOR: Array.isArray(dw_motores) ? dw_motores : [dw_motores],
    SENSOR: Array.isArray(dw_sensores) ? dw_sensores : [dw_sensores],
    CAPILARES: Array.isArray(dw_capilares) ? dw_capilares : [dw_capilares],
    CABLE: Array.isArray(dw_cables) ? dw_cables : [dw_cables],
  };
  const cleanData = cleanDataMap(dataMap);

  const dataMapOp: { [key: string]: any[] } = {
    DETALLE_OPERACIONES: Array.isArray(encabezado) ? encabezado : [encabezado],
    DATA_RUN_BES: Array.isArray(datos_generales)
      ? datos_generales
      : [datos_generales],
  };

  const mechanicalDetails = Array.isArray(detalles_mecanicos)
    ? detalles_mecanicos
    : [detalles_mecanicos];
  const rigTimeSummary = calculateSummaryRigTime(rig_time);

  const dataRigTime: { [key: string]: any[] } = {
    DETALLE_OPERACIONES: Array.isArray(encabezado) ? encabezado : [encabezado],
    DATA_RUN_BES: Array.isArray(datos_generales)
      ? datos_generales
      : [datos_generales],
    RIG_TIME: Array.isArray(rig_time) ? rig_time : [rig_time],
    RIG_TIME_MIN_MAX: Array.isArray(rigTimeSummary)
      ? rigTimeSummary
      : [rigTimeSummary],
  };

  const dataMapProtectoresCable: { [key: string]: any[] } = {
    PROTECTORES_CABLE: Array.isArray(protectores_cable)
      ? protectores_cable
      : [protectores_cable],
    PROTECTOLIZERS: Array.isArray(protectolizers)
      ? protectolizers
      : [protectolizers],
    BANDAS: Array.isArray(bandas) ? bandas : [bandas],
    LOW_PROFILE: Array.isArray(low_profile) ? low_profile : [low_profile],
  };
  for (const worksheet of workbook.worksheets) {
    const sheetName = worksheet.name.toUpperCase();

    if (sheetName.includes('RUNBES')) {
      // --- Hoja 1: RUNBES ---
      await replacePlaceholdersWithMultipleRowsN(
        workbook,
        worksheet,
        dataMapOp,
      );
      // await replacePlaceholdersWithMultipleRows(workbook, worksheet, dataMap);
      await replacePlaceholdersWithMultipleRows(workbook, worksheet, cleanData);
      await fillMechanicalDetails(worksheet, mechanicalDetails);
      await replaceMultiRecordPlaceholdersInSingleCell(
        worksheet,
        dataMapProtectoresCable,
      );
    } else if (sheetName.includes('RIGTIME')) {
      // --- Hoja 2: RIG TIME ---
      await replacePlaceholdersWithMultipleRowsN(
        workbook,
        worksheet,
        dataRigTime,
      );
    }
    //Limpieza y ajustes generales
    await removeRowsWithMarkerPreserveMergesFast(worksheet, 'remove');
    await setDynamicSumFormula(worksheet);
    await clearAllPlaceholders(worksheet);

    //Aplicar limpieza final (borra placeholders que quedaron sin llenar)
    worksheet.eachRow(row => {
      row.eachCell(cell => {
        if (typeof cell.value === 'string' && cell.value.includes('{{')) {
          cell.value = cell.value.replace(/\{\{[^}]+\}\}/g, '').trim();
          if (cell.value === '') cell.value = null;
        }
      });
    });
  }
  const pozo = (encabezado[0] as any)?.wellName || 'pozo';

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const reportManagementController = new ReportManagementController();
  const filename =
    (encabezado[0] as any)?.nombreArchivoPrincipal ||
    `REPORTE_RUNBES_${pozo}.xlsx`;

  //PDF-Docker
  const pdfBuffer = await convertExcelToPdf(buffer);
  const pdfFilename = filename.replace('.xlsx', '.pdf');

  const uploadResult = await reportManagementController.uploadReportExcelPdf(
    buffer,
    pozo + '/' + idOilFieldOperations + '/reporte_run_bes',
    filename,
    idOilFieldOperations,
    'xlsx',
  );
  const uploadPdfResult = await reportManagementController.uploadReportExcelPdf(
    pdfBuffer,
    `${pozo}/${idOilFieldOperations}/reporte_run_bes`,
    pdfFilename,
    idOilFieldOperations,
    'pdf',
  );

  const [storedFile] = await getFileOfReportRunBes(idOilFieldOperations);
  console.log({
    id: storedFile?.id ?? null,
    filePath: uploadPdfResult.filePath,
    fileName: pdfFilename,
  });
  return [
    {
      id: storedFile?.id ?? null,
      filePath: uploadPdfResult.filePath,
      fileName: pdfFilename,
    },
  ];
}

import axios from 'axios';
import FormData from 'form-data'; // <-- importante en Node.js

async function convertExcelToPdf(buffer: Buffer): Promise<Buffer> {
  const formData = new FormData();
  formData.append('file', buffer, { filename: 'reporte.xlsx' }); // usamos el buffer directamente

  const response = await axios.post('http://localhost:3000/convert-to-pdf', formData, {
    headers: formData.getHeaders(),
    responseType: 'arraybuffer', // recibimos PDF binario
  });

  return Buffer.from(response.data);
}

function clearAllPlaceholders(worksheet: ExcelJS.Worksheet) {
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      if (typeof cell.value === 'string' && cell.value.includes('{{')) {
        cell.value = ''; // Clear the placeholder
      }
    });
  });
}

function htmlToPlainText(html: string): string {
  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
  const body = dom.window.document.body;

  body.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  body.querySelectorAll('li').forEach(li => {
    const text = li.textContent || '';
    li.replaceWith(`\u2022 ${text}\n`);
  });
  body.querySelectorAll('p').forEach(p => {
    const text = p.textContent || '';
    p.replaceWith(`${text}\n\n`);
  });
  body.querySelectorAll('ol, ul').forEach(list => {
    list.replaceWith(`${list.textContent || ''}\n`);
  });

  return body.textContent?.trim() || '';
}

/* ---------------- helpers ---------------- */
function toA1(row: number, col: number): string {
  let s = '';
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) {
    s = String.fromCharCode(((n - 1) % 26) + 65) + s;
  }
  return `${s}${row}`;
}

function getMergeAddresses(worksheet: ExcelJS.Worksheet): string[] {
  const fromModel = Array.isArray((worksheet as any).model?._merges)
    ? ((worksheet as any).model._merges as string[])
    : [];
  const fromInternalObj = (worksheet as any)._merges;
  const fromInternal =
    fromInternalObj && typeof fromInternalObj === 'object'
      ? Object.keys(fromInternalObj)
      : [];
  return Array.from(new Set([...fromModel, ...fromInternal]));
}

function removeRowsWithMarkerPreserveMergesFast(
  worksheet: ExcelJS.Worksheet,
  marker: string = 'remove',
) {
  const wsAny = worksheet as any;
  const lastCol = 36;
  const rowsToDelete: number[] = [];

  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    for (let col = 1; col <= Math.max(lastCol, row.cellCount); col++) {
      const v = row.getCell(col).value;
      if (typeof v === 'string' && v.includes(marker)) {
        rowsToDelete.push(rowIndex);
        break;
      }
    }
  }
  if (rowsToDelete.length === 0) return;
  const originalMerges: Array<{
    top: number;
    bottom: number;
    left: number;
    right: number;
  }> = [];
  for (const a1 of getMergeAddresses(worksheet)) {
    const r = wsAny._merges?.[a1];
    if (r?.model) {
      const { top, bottom, left, right } = r.model;
      originalMerges.push({ top, bottom, left, right });
    }
  }
  for (const a1 of Object.keys(wsAny._merges || {})) {
    try {
      worksheet.unMergeCells(a1);
    } catch {}
  }
  wsAny._merges = {};
  if (Array.isArray(wsAny.model?._merges)) {
    wsAny.model._merges = [];
  }
  rowsToDelete.sort((a, b) => b - a);
  for (const rowIndex of rowsToDelete) {
    worksheet.spliceRows(rowIndex, 1);
  }
  for (const { top, bottom, left, right } of originalMerges) {
    let removedAbove = rowsToDelete.filter(r => r < top).length;
    let removedWithin = rowsToDelete.filter(
      r => r >= top && r <= bottom,
    ).length;
    if (removedWithin === bottom - top + 1) {
      continue; // merge completamente eliminado
    }
    const newTop = top - removedAbove;
    const newBottom = bottom - removedAbove - removedWithin;
    if (newBottom < newTop) continue;
    const a1 = `${toA1(newTop, left)}:${toA1(newBottom, right)}`;
    try {
      worksheet.mergeCells(a1);
    } catch {}
  }
}

function setDynamicSumFormula(worksheet: ExcelJS.Worksheet) {
  const startCol = 33; // Columna AG
  const endCol = 36; // Columna AJ

  let inversionRow: number | null = null;
  let pruebasRow: number | null = null;

  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellValue = worksheet.getRow(rowIndex).getCell(col).value;
      if (typeof cellValue === 'string') {
        const normalized = cellValue.trim().toUpperCase();

        if (normalized === 'INVERSIÓN' && inversionRow === null) {
          inversionRow = rowIndex + 1;
        }

        if (normalized === '4. PRUEBAS DE PRODUCCIÓN' && pruebasRow === null) {
          pruebasRow = rowIndex - 2;
        }

        if (inversionRow !== null && pruebasRow !== null) break;
      }
    }
    if (inversionRow !== null && pruebasRow !== null) break;
  }

  if (
    inversionRow !== null &&
    pruebasRow !== null &&
    inversionRow <= pruebasRow
  ) {
    // 🔁 Convertir a números
    for (let row = inversionRow; row <= pruebasRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = worksheet.getRow(row).getCell(col);
        if (typeof cell.value === 'string') {
          const parsed = parseFloat(cell.value.replace(/[^0-9.-]/g, '')); // Elimina símbolos
          if (!isNaN(parsed)) {
            cell.value = parsed;
          }
        }
      }
    }

    // 🧮 Aplicar fórmula en la fila siguiente a PRUEBAS
    const formula = `=SUM(AG${inversionRow}:AJ${pruebasRow})`;
    worksheet.getCell('AG' + (pruebasRow + 1)).value = { formula };
    console.log(`Fórmula aplicada: ${formula} en AG${pruebasRow + 1}`);
  } else {
    console.warn(
      'No se encontraron ambas palabras clave o el rango es inválido.',
    );
  }
}

/*--------------pivot data-----------------*/
function pivotData(rows: any) {
  const pivotedMap = new Map();
  const attrMap: Record<string, string> = {
    'NO. PARTE': 'NO_PARTE',
    'NO. SERIE': 'NO_SERIE',
    'W.C': 'WC',
    'AISLAMIENTO F-T': 'AISLAMIENTO',
    'CALIBRE AWG': 'CALIBRE',
    'RESISTENCIA F-F': 'RESISTENCIA',
    'RL (DIAS)': 'RL',
  };

  for (const row of rows) {
    const key = row.idelementtally;

    if (!pivotedMap.has(key)) {
      pivotedMap.set(key, {
        idelementtally: row.idelementtally,
        namestandardelement: row.namestandardelement,
        sequence_number: row.sequence_number,
      });
    }

    const pivotRow = pivotedMap.get(key);
    const attrName =
      attrMap[row.standardattributename] || row.standardattributename;
    // pivotRow[row.standardattributename] = row.standardattributeoptions;
    pivotRow[attrName] = row.standardattributeoptions;
  }

  return Array.from(pivotedMap.values()).sort(
    (a, b) => a.sequence_number - b.sequence_number,
  );
}

function applyGroupLabels(rows: any[], group: number): any[] {
  const grouped: Record<string, any[]> = {};
  for (const row of rows) {
    const key = row.namestandardelement as string;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }
  for (const key in grouped) {
    const items = grouped[key].sort(
      (a: any, b: any) => a.sequence_number - b.sequence_number,
    );
    items.forEach((item: any, index: number) => {
      const lastIndex = items.length - 1;
      let label = '';
      if (group === 2) {
        if (index === 0) label = 'BOMBA SUPERIOR';
        else if (index === lastIndex) label = 'AGH/MGH';
        else if (index === lastIndex - 1) label = 'BOMBA INFERIOR';
        else label = 'BOMBA INTERMEDIA';
      } else if (group === 5) {
        const tipo = (item.TIPO || '').toUpperCase();
        if (tipo.endsWith('UT')) label = 'PROTECTOR SUPERIOR';
        else if (tipo.endsWith('LT')) label = 'PROTECTOR INFERIOR';
        else label = item.namestandardelement; // fallback
      } else {
        //Otros grupos, se puede extender
        label = item.namestandardelement;
      }
      item.namestandardelement = label;
    });
  }
  return rows;
}

async function replaceMultiRecordPlaceholdersInSingleCell(
  worksheet: ExcelJS.Worksheet,
  dataMap: Record<string, { cantidad: any; descripcion: any }[]>,
): Promise<void> {
  for (const [placeholderKey, records] of Object.entries(dataMap)) {
    if (!records || records.length === 0) continue;
    const placeholder = `{{${placeholderKey}}}`;
    for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
      const row = worksheet.getRow(rowIndex);
      row.eachCell((cell, colNumber) => {
        if (
          typeof cell.value === 'string' &&
          cell.value.includes(placeholder)
        ) {
          const combinedText = records
            .map(r => `${r.cantidad ?? ''} ${r.descripcion ?? ''}`.trim())
            .join('\n');
          const prevStyle = { ...cell.style };
          const newValue = cell.value.replace(placeholder, combinedText);
          cell.value = newValue;
          cell.alignment = { ...prevStyle.alignment, wrapText: true };
          cell.style = { ...prevStyle, alignment: cell.alignment };
          const lineCount = combinedText.split('\n').length;
          const baseHeight = 15;
          const adjustedHeight = Math.max(
            baseHeight * lineCount,
            row.height || baseHeight,
          );
          row.height = adjustedHeight;
          row.commit();
        }
      });
    }
  }
}

function calculateSummaryRigTime(records: any[]) {
  if (!records || records.length === 0) return null;
  const validRecords = records.filter(r => r.fechaHoraInicio && r.fechaHoraFin);
  if (validRecords.length === 0) return null;
  let fechaInicioMax: Date = new Date(validRecords[0].fechaHoraInicio);
  let fechaFinMax: Date = new Date(validRecords[0].fechaHoraFin);
  let duracionTotalMs = 0;
  for (const r of validRecords) {
    const inicio = new Date(r.fechaHoraInicio);
    const fin = new Date(r.fechaHoraFin);
    if (inicio > fechaInicioMax) fechaInicioMax = inicio;
    if (fin > fechaFinMax) fechaFinMax = fin;
    duracionTotalMs += fin.getTime() - inicio.getTime();
  }
  const duracionTotalMin = Math.floor(duracionTotalMs / 1000 / 60);
  const horas = Math.floor(duracionTotalMin / 60);
  const minutos = duracionTotalMin % 60;
  return {
    fechaInicioMax: fechaInicioMax.toISOString().split('T')[0],
    horaInicioMax: fechaInicioMax.toISOString().split('T')[1].split('.')[0],
    fechaFinMax: fechaFinMax.toISOString().split('T')[0],
    horaFinMax: fechaFinMax.toISOString().split('T')[1].split('.')[0],
    duracionTotal: `${horas}h ${minutos}m`,
  };
}

function cleanDataMap(dataMap: { [key: string]: any[] }) {
  const cleaned: { [key: string]: any[] } = {};
  for (const [key, value] of Object.entries(dataMap)) {
    if (Array.isArray(value) && value.length > 0) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

import ExcelJS from 'exceljs';
import { Response } from 'express';
import path from 'path';
import pLimit from 'p-limit';
import { JSDOM } from 'jsdom';
import { ReportManagementController } from '../../../file-management/interfaces/controllers/ReportManagementController';

import {
  ENCABEZADO,
  DATOS_GENERALES,
  OBJETIVO,
  CUMPLIMIENTO_DEL_OBJETIVO,
  ANTES_DEL_TRABAJO,
  DESPUES_DEL_TRABAJO,
  BOMBEO_HIDRAULICO,
  INYECCION,
  RETORNO,
  BOMBA,
  BOMBEO_ELECTRICO,
  PARAMETROS,
  TIEMPO_DE_EVALUACION,
  PRUEBAS_DE_PRODUCCION_PARA_POZO_DE_GAS,
  COSTOS_REALES,
  PROCEDIMIENTO_DE_OPERACION,
  DETALLE_DEL_PROCEDIMIENTO,
  SUSPENDEN_OPERACIONES,
  REINICIAN_OPERACIONES,
  ACTIVIDADES_DESPUES_DEL_REINICIO,
  SECCION_FINALIZAN_OPERACIONES,
} from '../database/models/sumarioWOModel';

function extractPlaceholderKeys(text: string): string[] {
  const matches = text.match(/{{(.*?)}}/g);
  return matches ? matches.map(m => m.replace(/{{|}}/g, '').trim()) : [];
}

function getValueFromPath(obj: any, pathStr: string): any {
  return pathStr.split('.').reduce((acc, key) => acc?.[key], obj);
}

async function replacePlaceholdersWithMultipleRows(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  dataMap: { [key: string]: any[] }
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
      extractPlaceholderKeys(cell.value)
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

  row.eachCell({ includeEmpty: false }, (cell) => {
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

export async function generateExcelSumarioWO(idOilFieldOperations: any, res: Response) {
  const limit = pLimit(3);
  const [
    encabezado,
    datos_generales,
    objetivo,
    cumplimiento_del_objetivo,
    antes_del_trabajo,
    despues_del_trabajo,
    bombeo_hidraulico,
    inyeccion,
    retorno,
    bomba,
    bombeo_electrico,
    parametros,
    tiempo_de_evaluacion,
    pruebas_de_produccion_para_pozo_de_gas,
    costos_reales,
    procedimiento_de_operacion,
    detalle_del_procedimiento,
    suspenden_operaciones,
    reinician_operaciones,
    actividades_despues_del_reinicio,
    seccion_finalizan_operaciones,
  ] = await Promise.all([
    limit(() => ENCABEZADO(idOilFieldOperations)),
    limit(() => DATOS_GENERALES(idOilFieldOperations)),
    limit(() => OBJETIVO(idOilFieldOperations)),
    limit(() => CUMPLIMIENTO_DEL_OBJETIVO(idOilFieldOperations)),
    limit(() => ANTES_DEL_TRABAJO(idOilFieldOperations)),
    limit(() => DESPUES_DEL_TRABAJO(idOilFieldOperations)),
    limit(() => BOMBEO_HIDRAULICO(idOilFieldOperations)),
    limit(() => INYECCION(idOilFieldOperations)),
    limit(() => RETORNO(idOilFieldOperations)),
    limit(() => BOMBA(idOilFieldOperations)),
    limit(() => BOMBEO_ELECTRICO(idOilFieldOperations)),
    limit(() => PARAMETROS(idOilFieldOperations)),
    limit(() => TIEMPO_DE_EVALUACION(idOilFieldOperations)),
    limit(() => PRUEBAS_DE_PRODUCCION_PARA_POZO_DE_GAS(idOilFieldOperations)),
    limit(() => COSTOS_REALES(idOilFieldOperations)),
    limit(() => PROCEDIMIENTO_DE_OPERACION(idOilFieldOperations)),
    limit(() => DETALLE_DEL_PROCEDIMIENTO(idOilFieldOperations)),
    limit(() => SUSPENDEN_OPERACIONES(idOilFieldOperations)),
    limit(() => REINICIAN_OPERACIONES(idOilFieldOperations)),
    limit(() => ACTIVIDADES_DESPUES_DEL_REINICIO(idOilFieldOperations)),
    limit(() => SECCION_FINALIZAN_OPERACIONES(idOilFieldOperations)),
  ]);

  const workbook = new ExcelJS.Workbook();
  //const templatePath = 'src/modules/field-module/infrastructure/templates/SUMARIO_WO_TEMPLATE.xlsx';
  const templatePath = path.resolve(
    process.cwd(),
    'dist/modules/field-module/infrastructure/templates/',
    'SUMARIO_WO_TEMPLATE.xlsx',
  );

  await workbook.xlsx.readFile(templatePath);

  const worksheet = workbook.getWorksheet('{{nombrePestana}}');
  if (!worksheet) {
    throw new Error('La hoja SUMARIO no fue encontrada en la plantilla.');
  }

  const dataMap: { [key: string]: any[] } = {
    ENCABEZADO: Array.isArray(encabezado) ? encabezado : [encabezado],
    DATOS_GENERALES: Array.isArray(datos_generales) ? datos_generales : [datos_generales],
    OBJETIVO: objetivo,
    CUMPLIMIENTO_DEL_OBJETIVO: cumplimiento_del_objetivo,
    ANTES_DEL_TRABAJO: antes_del_trabajo,
    DESPUES_DEL_TRABAJO: despues_del_trabajo,
    BOMBEO_HIDRAULICO: bombeo_hidraulico,
    INYECCION: inyeccion,
    RETORNO: retorno,
    BOMBA: bomba,
    BOMBEO_ELECTRICO: bombeo_electrico,
    PARAMETROS: parametros,
    TIEMPO_DE_EVALUACION: tiempo_de_evaluacion,
    PRUEBAS_DE_PRODUCCION_PARA_POZO_DE_GAS:
      pruebas_de_produccion_para_pozo_de_gas,
    COSTOS_REALES: costos_reales,
    PROCEDIMIENTO_DE_OPERACION: procedimiento_de_operacion,
    DETALLE_DEL_PROCEDIMIENTO: detalle_del_procedimiento,
    SUSPENDEN_OPERACIONES: suspenden_operaciones,
    REINICIAN_OPERACIONES: reinician_operaciones,
    ACTIVIDADES_DESPUES_DEL_REINICIO: actividades_despues_del_reinicio,
    SECCION_FINALIZAN_OPERACIONES: seccion_finalizan_operaciones,
  };

  await replacePlaceholdersWithMultipleRows(workbook,worksheet, dataMap);
  await removeRowsWithMarkerPreserveMergesFast(worksheet, 'remove');
  await setDynamicSumFormula(worksheet)
  await clearAllPlaceholders(worksheet)
  worksheet.name = (encabezado[0] as any)?.nombrePestana || 'SUMARIO_WO';
  
  workbook.definedNames.model = [];
  //removeRowsWithMarker(worksheet);
  //await processResumenDeOperacionRows(worksheet, dataMap);
  

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const reportManagementController = new ReportManagementController();
  const filename =
    (encabezado[0] as any)?.nombreArchivoPrincipal || 'SUMARIO_WO.xlsx';
  /*res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.json({
    filename,
    file: Buffer.from(buffer).toString('base64'),
  });*/
  await reportManagementController.uploadReport(
      buffer,
      'sumario_wo',
      filename,
      idOilFieldOperations,
    )
  return {
    filename,
    filePath: '',
  };
  //res.attachment('SUMARIO_WO.xlsx');
  //res.send(buffer);
}

function clearAllPlaceholders(worksheet: ExcelJS.Worksheet) {
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
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
  marker: string = 'remove'
) {
  const wsAny = worksheet as any;
  const lastCol = 36; // A..AJ
  const rowsToDelete: number[] = [];

  // 1. Buscar filas que contengan el marcador
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

  // 2. Capturar todos los merges
  const originalMerges: Array<{ top: number; bottom: number; left: number; right: number }> = [];
  for (const a1 of getMergeAddresses(worksheet)) {
    const r = wsAny._merges?.[a1];
    if (r?.model) {
      const { top, bottom, left, right } = r.model;
      originalMerges.push({ top, bottom, left, right });
    }
  }

  // 3. Eliminar todos los merges del worksheet
  for (const a1 of Object.keys(wsAny._merges || {})) {
    try {
      worksheet.unMergeCells(a1);
    } catch {}
  }
  wsAny._merges = {};
  if (Array.isArray(wsAny.model?._merges)) {
    wsAny.model._merges = [];
  }

  // 4. Eliminar filas (de abajo hacia arriba)
  rowsToDelete.sort((a, b) => b - a); // orden descendente
  for (const rowIndex of rowsToDelete) {
    worksheet.spliceRows(rowIndex, 1);
  }

  // 5. Recalcular y restaurar merges
  for (const { top, bottom, left, right } of originalMerges) {
    let removedAbove = rowsToDelete.filter(r => r < top).length;
    let removedWithin = rowsToDelete.filter(r => r >= top && r <= bottom).length;

    if (removedWithin === (bottom - top + 1)) {
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
  const startCol = 34; // Columna AH
  const endCol = 37;   // Columna AK

  let inversionRow: number | null = null;
  let pruebasRow: number | null = null;

  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellValue = worksheet.getRow(rowIndex).getCell(col).value;
      if (typeof cellValue === 'string') {
        const normalized = cellValue.trim().toUpperCase();

        if (normalized === 'INVERSION' && inversionRow === null) {
          inversionRow = rowIndex + 1;
        }

        if (normalized === '8. PROCEDIMIENTO DE OPERACIÓN' && pruebasRow === null) {
          pruebasRow = rowIndex - 2;
        }

        if (inversionRow !== null && pruebasRow !== null) break;
      }
    }
    if (inversionRow !== null && pruebasRow !== null) break;
  }

  if (inversionRow !== null && pruebasRow !== null && inversionRow <= pruebasRow) {
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
    const formula = `=SUM(AH${inversionRow}:AK${pruebasRow})`;
    worksheet.getCell('AH' + (pruebasRow + 1)).value = { formula };
    console.log(`Fórmula aplicada: ${formula} en AH${pruebasRow + 1}`);
  } else {
    console.warn('No se encontraron ambas palabras clave o el rango es inválido.');
  }
}

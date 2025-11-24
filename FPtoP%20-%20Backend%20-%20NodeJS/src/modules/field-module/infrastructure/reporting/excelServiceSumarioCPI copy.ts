import ExcelJS from 'exceljs';
import { Response } from 'express';
import path from 'path';
import pLimit from 'p-limit';
import { JSDOM } from 'jsdom';

import {
  BOMBEO_ELECTRICO,
  PARAMETROS,
  TIEMPO_DE_EVALUACION,
  COSTOS_REALES,
  DATOS_GENERALES,
  ENCABEZADO,
  PROCEDIMIENTO_DE_OPERACION,
  PRUEBA_DE_PRODUCCION,
  PRUEBAS_DE_PRODUCCION,
  DETALLE_DEL_PROCEDIMIENTO
} from '../database/models/sumarioCPIModel';

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
        const currentRow =
          i === 0 ? row : worksheet.insertRow(rowIndex + i, []);
        /*
        if (i != 0) {
          console.log('to merge', rowIndex + i)
          replicateRowMerges(
            worksheet,
            worksheet.getRow(rowIndex),
            worksheet.getRow(rowIndex + i),
          );
        }*/
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
      }
      if (records.length > 1) break;
    }
  }
}

export async function generateExcelSumarioCPI(idOilFieldOperations: any, res: Response) {
  const limit = pLimit(3);
  const [
    encabezado,
    datos_generales,
    prueba_de_produccion,
    costos_reales,
    pruebas_de_produccion,
    bombeo_electrico,
    parametros,
    tiempo_de_evaluacion,
    procedimiento,
    detalle_del_procedimiento,
  ] = await Promise.all([
    limit(() => ENCABEZADO(idOilFieldOperations)),
    limit(() => DATOS_GENERALES(idOilFieldOperations)),
    limit(() => PRUEBA_DE_PRODUCCION(idOilFieldOperations)),
    limit(() => COSTOS_REALES(idOilFieldOperations)),
    limit(() => PRUEBAS_DE_PRODUCCION(idOilFieldOperations)),
    limit(() => BOMBEO_ELECTRICO(idOilFieldOperations)),
    limit(() => PARAMETROS(idOilFieldOperations)),
    limit(() => TIEMPO_DE_EVALUACION(idOilFieldOperations)),
    limit(() => PROCEDIMIENTO_DE_OPERACION(idOilFieldOperations)),
    limit(() => DETALLE_DEL_PROCEDIMIENTO(idOilFieldOperations)),
  ]);

  const workbook = new ExcelJS.Workbook();
  const templatePath = 'src/modules/field-module/infrastructure/templates/SUMARIO_CPI_TEMPLATE.xlsx';
  await workbook.xlsx.readFile(templatePath);

  const worksheet = workbook.getWorksheet('{{nombrePestana}}');
  if (!worksheet) {
    throw new Error('La hoja SUMARIO no fue encontrada en la plantilla.');
  }

  const dataMap: { [key: string]: any[] } = {
    ENCABEZADO: Array.isArray(encabezado) ? encabezado : [encabezado],
    DATOS_GENERALES: Array.isArray(datos_generales) ? datos_generales : [datos_generales],
    PRUEBA_DE_PRODUCCION: prueba_de_produccion,
    COSTOS_REALES: costos_reales,
    PRUEBAS_DE_PRODUCCION: pruebas_de_produccion,
    BOMBEO_ELECTRICO: bombeo_electrico,
    PARAMETROS: parametros,
    TIEMPO_DE_EVALUACION: tiempo_de_evaluacion,
    PROCEDIMIENTO_DE_OPERACION: procedimiento,
    DETALLE_DEL_PROCEDIMIENTO: detalle_del_procedimiento
  };

  await replacePlaceholdersWithMultipleRows(workbook,worksheet, dataMap);
  fullyResetRow(worksheet, 24);
  worksheet.unMergeCells('A24')
  forceWipeRowAndMerges(worksheet, 24);

  let cellB2 = worksheet.getCell('A24') as any;
    // Check the 'master' property
    if (cellB2.master) {
        console.log('Cell B2 is part of a merged range.');
        console.log('Master cell address:', cellB2.master.address); // Should be A1
    } else {
        console.log('Cell B2 is not part of a merged range, or it is the master cell.');
    }

  //await processResumenDeOperacionRows(worksheet, dataMap);

  const buffer = await workbook.xlsx.writeBuffer();
  res.attachment('SUMARIO_CPI.xlsx');
  res.send(buffer);
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


function forceWipeRowAndMerges(worksheet: ExcelJS.Worksheet, rowNum: number) {
  const wsAny = worksheet as any;

  // Paso 1: eliminar merges que involucren esta fila
  const toDelete: string[] = [];

  for (const a1 in wsAny._merges) {
    const rangeObj = wsAny._merges[a1];
    if (!rangeObj?.model) continue;
    const { top, bottom } = rangeObj.model;
    if (rowNum >= top && rowNum <= bottom) {
      toDelete.push(a1);
    }
  }

  for (const a1 of toDelete) {
    delete wsAny._merges[a1];
    try {
      worksheet.unMergeCells(a1);
    } catch {}
  }

  if (Array.isArray(wsAny.model?._merges)) {
    wsAny.model._merges = wsAny.model._merges.filter((a1: string) => {
      const { row } = fromA1(a1.split(':')[0]);
      return row !== rowNum;
    });
  }

  // Paso 2: eliminar y reiniciar fila
  worksheet.spliceRows(rowNum, 1);
  worksheet.insertRow(rowNum, []);
}





function cleanMergesAffectingRow(worksheet: ExcelJS.Worksheet, rowNum: number) {
  const wsAny = worksheet as any;
  const toDelete: string[] = [];

  // Buscar merges que afectan a la fila
  for (const a1 in wsAny._merges) {
    const rangeObj = wsAny._merges[a1];
    if (!rangeObj?.model) continue;
    const { top, bottom } = rangeObj.model;
    if (rowNum >= top && rowNum <= bottom) {
      toDelete.push(a1);
    }
  }

  // Eliminar del mapa interno
  for (const a1 of toDelete) {
    delete wsAny._merges[a1];
  }

  // Eliminar del modelo
  if (Array.isArray(wsAny.model?._merges)) {
    wsAny.model._merges = wsAny.model._merges.filter((a1: string) => {
      const { row } = fromA1(a1.split(':')[0]);
      return row !== rowNum;
    });
  }

  // Intentar descombinar por si acaso
  for (const a1 of toDelete) {
    try {
      worksheet.unMergeCells(a1);
    } catch (_) {}
  }
}



export function replicateRowMerges(
  worksheet: ExcelJS.Worksheet,
  srcRow: ExcelJS.Row,
  dstRow: ExcelJS.Row
): void {
  const srcRowNum = srcRow.number;
  const dstRowNum = dstRow.number;

  const merges = getMergeAddresses(worksheet);

  for (const a1range of merges) {
    const rangeObj = (worksheet as any)._merges[a1range];

    if (!rangeObj || !rangeObj.model) {
      continue;
    }

    const { top, left, bottom, right } = rangeObj.model;
    if (top === srcRowNum && bottom === srcRowNum) {
      console.log('to merge:',top,left,right,'source',srcRowNum, 'destine',dstRowNum)
      try {
        for (let i = 0; i < right; i++) {
          worksheet.unMergeCells(dstRowNum, i, dstRowNum, i);
        }
        worksheet.unMergeCells(dstRowNum, left, dstRowNum, right);
        worksheet.mergeCells(dstRowNum, left, dstRowNum, right);
        clearMergeInfoFromRow(dstRow);
        forceCleanMerge(worksheet, dstRowNum, left, right);
      } catch (err) {
        console.log(err);
      }
    }
  }
}


function clearMergeInfoFromRow(row: ExcelJS.Row) {
  row.eachCell((cell: any) => {
    console.log('cell', cell)
    if (cell.master) {
      cell.master = undefined;
    }
    if (cell._mergeCount) {
      cell._mergeCount = 0;
    }
    // Limpieza profunda: asegúrate de que ExcelJS no "crea" que está combinada
    delete cell._mergeCount;
    delete cell.master;
  });
}


function forceCleanMerge(
  worksheet: ExcelJS.Worksheet,
  row: number,
  colStart: number,
  colEnd: number
): void {
  const a1Range = `${toA1(row, colStart)}:${toA1(row, colEnd)}`;
  const wsAny = worksheet as any;

  // 🧹 1. Elimina del mapa en memoria (_merges)
  if (wsAny._merges?.[a1Range]) {
    delete wsAny._merges[a1Range];
  }

  // 🧹 2. Elimina del modelo (model._merges)
  const model = wsAny.model;
  if (Array.isArray(model?._merges)) {
    model._merges = model._merges.filter((range: string) => range !== a1Range);
  }

  // 💣 3. Descombinar si hay rastro
  try {
    worksheet.unMergeCells(a1Range);
  } catch (_) {
    // No importa si no estaba realmente combinado
  }

  // ✅ 4. Merge limpio
  try {
    worksheet.mergeCells(a1Range);
  } catch (err) {
    console.error(`❌ Error al combinar ${a1Range}:`, err);
  }
}





/* ---------------- helpers ---------------- */

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

function fromA1(a1: string): { row: number; col: number } {
  const m = /^([A-Z]+)(\d+)$/.exec(a1.toUpperCase());
  if (!m) throw new Error(`Invalid A1: ${a1}`);
  const letters = m[1];
  const row = parseInt(m[2], 10 );
  let col = 0;
  for (const ch of letters) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { row, col };
}

function toA1(row: number, col: number): string {
  let s = '';
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) {
    s = String.fromCharCode(((n - 1) % 26) + 65) + s;
  }
  return `${s}${row}`;
}

function isRangeAlreadyMerged(
  worksheet: ExcelJS.Worksheet,
  row: number,
  colStart: number,
  colEnd: number
): boolean {
  for (let c = colStart; c <= colEnd; c++) {
    const cell = worksheet.getCell(row, c) as any;
    if (cell?.isMerged) return true;
  }
  return false;
}


function fullyResetRow(worksheet: ExcelJS.Worksheet, rowNum: number) {
  const row = worksheet.getRow(rowNum);

  // Collect snapshot of cell values and styles
  const cellsSnapshot: {
    col: number;
    value: any;
    style: Partial<ExcelJS.Style>;
  }[] = [];

  row.eachCell({ includeEmpty: true }, (cell, col) => {
    cellsSnapshot.push({
      col,
      value: cell.value,
      style: { ...cell.style },
    });
  });

  // Remove the entire row and create a new one
  worksheet.spliceRows(rowNum, 1); // this removes the row completely
  worksheet.insertRow(rowNum, []); // re-insert a fresh row

  const newRow = worksheet.getRow(rowNum);
  for (const { col, value, style } of cellsSnapshot) {
    const cell = newRow.getCell(col);
    cell.value = value;
    cell.style = style;
  }

  return newRow;
}

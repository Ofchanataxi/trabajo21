import ExcelJS from 'exceljs';
import pLimit from 'p-limit';
import { JSDOM } from 'jsdom';
import { ReportManagementController } from '../../../file-management/interfaces/controllers/ReportManagementController';
import path from 'path';

import {
  CPIDESCRIPTION,
  CPIDOCUMENTATION,
  WODESCRIPTION,
  CPIDETAILS,
  CPIHEADER,
  WODETAILS,
  WODOCUMENTS,
  WOHEADER,
  WOTYPE
} from '../database/models/DHModel';

const styledCells: { [key: string]: { bold?: boolean; background?: string } } =
  {};

const styledCellsComments: {
  [key: string]: { bold?: boolean; underline?: boolean };
} = {};

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
  dataMap: { [key: string]: any[] },
): Promise<void> {
  console.log('replacePlaceholdersWithMultipleRows');

  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    const placeholderCells: { col: number; row: number; value: string }[] = [];

    // 🔍 collect all cells in the row with placeholders
    row.eachCell((cell, colNumber) => {
      if (typeof cell.value === 'string' && cell.value.includes('{{')) {
        placeholderCells.push({
          col: colNumber,
          row: Number(cell.row),
          value: cell.value,
        });
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

        // 🔄 replace placeholders
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

          let finalValue: any = replacedValue;

          // check if it's a number-like string
          if (
            replacedValue !== null &&
            replacedValue !== undefined &&
            replacedValue !== ''
          ) {
            const num = Number(replacedValue);
            if (!isNaN(num)) {
              finalValue = num;
            }
          }

          const newCell = worksheet.getCell(rowIndex + i, cell.col);
          newCell.value = finalValue;
          /*if (objectName === 'TUBERIA_SECCION_DOS') {
            const bg = records[i]?.backgroundColor;
            const bold = records[i]?.boldText === 'true';
            console.log('format: ', bold, bg, newCell.font);
            worksheet.getCell(cell.row, cell.col).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: bg.replace('#', '') },
            };
            if (bold === true) {
              console.log('format: ', newCell.value, bold, cell.row, cell.col);
              worksheet.getCell(cell.row, cell.col).font.bold = bold; //{ ...(currentRow.getCell(col).font || {}), bold: false };            });
            }
            console.log('format after: ', bold, bg, newCell.font);
          }
          if (objectName === 'COMENTARIOS') {
            const bold = records[i]?.boldText === 'true';
            if (bold) {
              worksheet.getCell(cell.row, cell.col).font = {
                ...(worksheet.getCell(cell.row, cell.col).font || {}),
                bold: true,
              };
            }
          }
          */
        });

        const estimatedHeight = estimateRowHeight(currentRow);
        if (estimatedHeight > 15) {
          currentRow.height = estimatedHeight;
        }
      }
    }
  }
}

async function getCellsToStyle(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  dataMap: { [key: string]: any[] }
): Promise<void> {

  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    const placeholderCells: { col: number; row: number; value: string }[] = [];

    // 🔍 collect all cells in the row with placeholders
    row.eachCell((cell, colNumber) => {
      if (typeof cell.value === 'string' && cell.value.includes('{{')) {
        placeholderCells.push({
          col: colNumber,
          row: Number(cell.row),
          value: cell.value,
        });
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

        // replace placeholders
        placeholderCells.forEach(cell => {
          const newCell = worksheet.getCell(rowIndex + i, cell.col);

          // Crear fuente independiente
          const prevFont = { ...(newCell.font || {}) };
          newCell.font = { ...prevFont }; //  fuerza desacoplamiento aquí
          const cellRef = newCell.address;
          const bold = !!records[i]?.bold;
          const underline = !!records[i]?.underline;
          if (objectName === 'WODESCRIPTION' && rowIndex + i > 13) {
            styledCellsComments[cellRef] = {
              ...(styledCellsComments[cellRef] || {}),
              ...(bold ? { bold: bold } : {}),
              ...(underline ? { underline: underline } : {}),
            };
          }
          if (objectName === 'CPIDESCRIPTION' && rowIndex + i > 31) {
            styledCellsComments[cellRef] = {
              ...(styledCellsComments[cellRef] || {}),
              ...(bold ? { bold: bold } : {}),
              ...(underline ? { underline: underline } : {}),
            };
          }
        });

        const estimatedHeight = estimateRowHeight(currentRow);
        if (estimatedHeight > 15) {
          currentRow.height = estimatedHeight;
        }
      }
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

export async function generateExcelDH(
  idOilFieldOperations: any,
  cpiwotype: any,
) {
  const limit = pLimit(3);

  // Datos que llenaremos según el tipo
  let header: any[] = [];
  let description: any[] = [];
  let details: any[] = [];
  let documentation: any[] = [];
  let typeArr: any[] = []; // solo WO
  let templateFilename = '';

  // 1) Recolecta datasets según el tipo
  if (cpiwotype === 'CPI') {
    [header, description, details, documentation] = await Promise.all([
      limit(() => CPIHEADER(idOilFieldOperations)),
      limit(() => CPIDESCRIPTION(idOilFieldOperations)),
      limit(() => CPIDETAILS(idOilFieldOperations)),
      limit(() => CPIDOCUMENTATION(idOilFieldOperations)),
    ]);
    templateFilename = 'DH_CPI_TEMPLATE.xlsx';
  } else {
    [header, description, details, documentation, typeArr] = await Promise.all([
      limit(() => WOHEADER(idOilFieldOperations)),
      limit(() => WODESCRIPTION(idOilFieldOperations)),
      limit(() => WODETAILS(idOilFieldOperations)),
      limit(() => WODOCUMENTS(idOilFieldOperations)), // nombre de tu función
      limit(() => WOTYPE(idOilFieldOperations)),
    ]);
    templateFilename = 'DH_WO_TEMPLATE.xlsx';
  }

  // 2) Ruta del template
  const templatePath = path.resolve(
    process.cwd(),
    'dist/modules/field-module/infrastructure/templates/',
    templateFilename,
  );

  // 3) Carga workbook + hoja
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  const worksheet = workbook.getWorksheet('nombresPestana');
  if (!worksheet) {
    throw new Error('La hoja "nombresPestana" no fue encontrada en la plantilla.');
  }

  const dataMap: { [key: string]: any[] } =
    cpiwotype === 'CPI'
      ? {
          CPIHEADER: header,
          CPIDESCRIPTION: description,
          CPIDETAILS: details,
          CPIDOCUMENTATION: documentation,
        }
      : {
          WOHEADER: header,
          WODESCRIPTION: description,
          WODETAILS: details,
          WODOCUMENTS: documentation,
          WOTYPE: typeArr,
        };

  // 5) Estilos (usa dataMap que ya existe en el scope)
  await getCellsToStyle(workbook, worksheet, dataMap);
  console.log('styledCellsComments here', styledCellsComments);
  for (const [cellRef, style] of Object.entries(styledCellsComments)) {
    const cell = worksheet.getCell(cellRef);
    cell.font = {
      ...(cell.font || {}),
      name: 'Arial',
      size: 10,
      ...(style.bold ? { bold: true } : {}),
      ...(style.underline ? { underline: true } : {}),
    };
  }

  // 6) Reemplazos / limpieza
  await replacePlaceholdersWithMultipleRows(workbook, worksheet, dataMap);
  await removeRowsWithMarkerPreserveMergesFast(worksheet, 'remove');
  //await clearAllPlaceholders(worksheet);
  //await clearCellsContaining(worksheet, 'delete');

  // 7) Renombra hoja y arma filename/pozo
  const sheet = workbook.getWorksheet('nombresPestana');
  if (!sheet) {
    throw new Error('La hoja "nombresPestana" no fue encontrada tras el procesamiento.');
  }

  const firstHeader = (header?.[0] ?? {}) as any;
  sheet.name = firstHeader.nombrePestana || 'DH';

  const pozo = firstHeader.pozo || 'pozo';
  const filename = firstHeader.nombreArchivoPrincipal || 'DH.xlsx';

  // 8) Sube el archivo
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const reportManagementController = new ReportManagementController();
  await reportManagementController.uploadReport(
    buffer,
    `${pozo}/${idOilFieldOperations}/DH`,
    filename,
    idOilFieldOperations,
  );

  return { filename, filePath: '' };
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
  const lastCol = 23; 
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
  const startCol = 33; // Columna AG
  const endCol = 36;   // Columna AJ

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
    const formula = `=SUM(AG${inversionRow}:AJ${pruebasRow})`;
    worksheet.getCell('AG' + (pruebasRow + 1)).value = { formula };
  } else {
    console.warn('No se encontraron ambas palabras clave o el rango es inválido.');
  }
}



function clearCellsContaining(worksheet: ExcelJS.Worksheet, search: string, exact: boolean = false) {
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      if (typeof cell.value === 'string') {
        const cellText = cell.value.toString();

        // Coincidencia exacta o parcial
        const match = exact
          ? cellText === search
          : cellText.includes(search);

        if (match) {
          cell.value = null; // 👈 deja la celda vacía
          console.log(`Cleared cell ${cell.address} containing "${search}"`);
        }
      }
    });
  });
}

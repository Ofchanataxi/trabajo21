import ExcelJS from 'exceljs';
import pLimit from 'p-limit';
import { JSDOM } from 'jsdom';
import { ReportManagementController } from '../../../file-management/interfaces/controllers/ReportManagementController';
import path from 'path';

import {
  ENCABEZADO,
  COMENTARIOS,
  METADATA,
  TUBERIA_SECCION_DOS,
  TUBERIA_SECCION_UNO,
} from '../database/models/TallyModel';

const styledCells: { [key: string]: { bold?: boolean; background?: string } } =
  {};

const styledCellsComments: { [key: string]: { bold?: boolean; background?: string } } =
  {};


function extractPlaceholderKeys(text: string): string[] {
  const matches = text.match(/{{(.*?)}}/g);
  return matches ? matches.map(m => m.replace(/{{|}}/g, '').trim()) : [];
}

function getValueFromPath(obj: any, pathStr: string): any {
  return pathStr.split('.').reduce((acc, key) => acc?.[key], obj);
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

        // 🔄 replace placeholders
        placeholderCells.forEach(cell => {
          const newCell = worksheet.getCell(rowIndex + i, cell.col);

          // Crear fuente independiente
          const prevFont = { ...(newCell.font || {}) };
          newCell.font = { ...prevFont }; // 👈 fuerza desacoplamiento aquí
          const cellRef = newCell.address; // e.g., "U53"
          const colLetter = cellRef.replace(/[0-9]/g, ''); // quita los números -> "U"

          const bg = records[i]?.backgroundColor;
          const bold = records[i]?.boldText === 'true';

          if (
            objectName === 'TUBERIA_SECCION_DOS' &&
            ['U', 'V', 'W'].includes(colLetter)
          ) {
            styledCells[cellRef] = {
              ...(styledCells[cellRef] || {}),
              ...(bold ? { bold: bold } : {}),
              ...(bg ? { background: bg } : {}),
            };
          }

          if (objectName === 'COMENTARIOS' && rowIndex + i > 224) {
            styledCellsComments[cellRef] = {
              ...(styledCellsComments[cellRef] || {}),
              ...(bold ? { bold: bold } : {}),
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

async function replacePlaceholdersWithMultipleRows(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  dataMap: { [key: string]: any[] }
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
      extractPlaceholderKeys(cell.value)
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
                const value = getValueFromPath(records[i], fieldParts.join('.'));
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

async function replacePlaceholdersGroups(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  dataMap: { [key: string]: any[] }
): Promise<void> {
  console.log('replacePlaceholdersWithMultipleRows')
  //const workbookClean = new ExcelJS.Workbook();
  const placeholderCells: {
    col: number;
    row: number;
    numero: string;
    value: number | string;
  }[] = [];
  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    row.eachCell((cell, colNumber) => {
      if (
        typeof cell.value === 'string' &&
        cell.value.includes('{{TUBERIA_SECCION_UNO.')
      ) {
        placeholderCells.push({
          col: colNumber,
          row: Number(cell.row),
          numero: String(
            worksheet.getCell(Number(cell.row), Number(colNumber) - 1).value,
          ),
          value: Number(cell.value),
        });
      }
    });
  }
  placeholderCells.forEach(cell => {
    console.log('search', cell.numero, cell.col, cell.row);
    const match = dataMap['TUBERIA_SECCION_UNO'].find(
      (item: any) => Number(item.Numero) === Number(cell.numero),
    );
    if (match) {
      cell.value = Number(match.medida);
    } else {
      cell.value = '';
    }
    if (Number(cell.numero) % 10 === 0) {
      const matchTotal = dataMap['TUBERIA_SECCION_UNO'].find(
        (item: any) => Number(item.Numero) === Number(cell.numero) - 9,
      );

      if (matchTotal) {
        worksheet.getCell(Number(cell.row) + 1, cell.col).value = Number(
          matchTotal.total_medida_grupo,
        );
      }
    }

    worksheet.getCell(cell.row, cell.col).value = cell.value;
  });
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

export async function generateExcelTally(idOilFieldOperations: any) {
  const limit = pLimit(3);
  const [
    encabezado,
    metadata,
    comentarios,
    tuberia_seccion_uno,
    tuberia_seccion_dos,
  ] = await Promise.all([
    limit(() => ENCABEZADO(idOilFieldOperations)),
    limit(() => METADATA(idOilFieldOperations)),
    limit(() => COMENTARIOS(idOilFieldOperations)),
    limit(() => TUBERIA_SECCION_UNO(idOilFieldOperations)),
    limit(() => TUBERIA_SECCION_DOS(idOilFieldOperations))
  ]);

  const workbook = new ExcelJS.Workbook();
  //const templatePath = 'src/modules/field-module/infrastructure/templates/TALLY_TEMPLATE.xlsx';

  const templatePath = path.resolve(
    process.cwd(),
    'dist/modules/field-module/infrastructure/templates/',
    'TALLY_TEMPLATE.xlsx',
  );

  await workbook.xlsx.readFile(templatePath);

  const worksheet = workbook.getWorksheet('nombresPestana');
  if (!worksheet) {
    throw new Error('La hoja SUMARIO no fue encontrada en la plantilla.');
  }

  const dataMap: { [key: string]: any[] } = {
    ENCABEZADO: encabezado,
    COMENTARIOS: comentarios,
    METADATA: metadata,
    TUBERIA_SECCION_DOS: tuberia_seccion_dos,
  };

  const dataMapGroups: { [key: string]: any[] } = {
    TUBERIA_SECCION_UNO: tuberia_seccion_uno,
  };

  await getCellsToStyle(workbook, worksheet, dataMap);

  console.log('styledCells', dataMap);
  for (const [cellRef, style] of Object.entries(styledCells)) {
    const cell = worksheet.getCell(cellRef);
    console.log('cellref', cellRef);
    if (style.background) {
      console.log('cellref 2', style.background)
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: style.background.replace('#', '  ') }
      };
    }

    cell.font = {
      ...(cell.font || {}),
      name: 'Arial',
      size: 7,
      ...(style.bold ? { bold: true } : {})
    };

    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
  }

  console.log('styledCellsComments', ENCABEZADO)
  for (const [cellRef, style] of Object.entries(styledCellsComments)) {
    const cell = worksheet.getCell(cellRef);

    // 🖋️ Font (tamaño 7 siempre, bold si corresponde)
    cell.font = {
      ...(cell.font || {}),
      name: 'Arial',
      size: 7,
      ...(style.bold ? { bold: true } : {})
    };
  }


  await replacePlaceholdersWithMultipleRows(workbook, worksheet, dataMap);


  await replacePlaceholdersGroups(workbook, worksheet, dataMapGroups);

  await removeRowsWithMarkerPreserveMergesFast(worksheet, 'remove');

 // await setDynamicSumFormula(worksheet)

  await clearAllPlaceholders(worksheet);
  await clearCellsContaining(worksheet, "delete");


  //await workbook.xlsx.writeFile('temp.xlsx');

  const freshWorkbook = workbook; //new ExcelJS.Workbook();
  //await freshWorkbook.xlsx.readFile('temp.xlsx');
  const sheet = freshWorkbook.getWorksheet('nombresPestana');

  console.log('styledCells: ', styledCells);
  if (!sheet) {
    throw new Error('La hoja SUMARIO no fue encontrada en la plantilla.');
  }

  sheet.name = (metadata[0] as any)?.nombrePestana || 'Tally';

  const pozo = (encabezado[0] as any)?.pozo || 'pozo';

  const arrayBuffer = await freshWorkbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const reportManagementController = new ReportManagementController();
  const filename =
    (encabezado[0] as any)?.nombreArchivoPrincipal || 'Tally.xlsx';
  await reportManagementController.uploadReport(
    buffer,
    pozo + '/' + idOilFieldOperations + '/Tally',
    filename,
    idOilFieldOperations,
  );
  return {
    filename,
    filePath: '',
  };
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

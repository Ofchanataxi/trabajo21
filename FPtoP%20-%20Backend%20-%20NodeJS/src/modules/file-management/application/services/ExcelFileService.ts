import * as fs from 'fs';
import * as xlsx from 'xlsx';

export class ExcelFileService {
  constructor() {}

  readFileAsync = (filePath: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  public obtainSheets = async (excelBufferR: Buffer) => {
    try {
      const excelBuffer: Buffer = excelBufferR;

      // Leer el archivo Excel desde el buffer
      const workbook = xlsx.read(excelBuffer, { type: 'buffer' });

      const sheetNames = workbook.SheetNames;

      // Imprimir los objetos JSON generados
      const response = {
        documentSheets: sheetNames,
      };

      return response;
    } catch (error: any) {
      console.error('Error leyendo el archivo de Excel:', error);
      throw new Error(error.message);
    }
  };

  public readElements = async (
    file: any,
    sheetFile: string,
    startCol: string,
    startRowRegular: number,
    titleCell: string,
  ) => {
    try {
      const startRow = startRowRegular - 1;
      //console.log('file');
      //console.log(file);
      const excelBuffer = file.buffer;

      // Leer el archivo Excel desde el buffer
      const workbook = xlsx.read(excelBuffer, { type: 'buffer' });

      // Seleccionar la hoja de trabajo
      const worksheet = workbook.Sheets[sheetFile];
      const cell = worksheet[titleCell];
      const cellValue = cell ? cell.v : null;
      // Convertir la columna inicial a índice numérico
      const colIndex = xlsx.utils.decode_col(startCol); // Por ejemplo, C = 2
      let currentRow = startRow; // Comenzar desde la fila inicial especificada (por ejemplo, fila 9 para C9)

      // Detectar automáticamente la última fila con datos
      let endRow: null | number = null;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const cellAddress = xlsx.utils.encode_cell({
          r: currentRow,
          c: colIndex,
        });
        const cell = worksheet[cellAddress];
        const cellValue = cell ? cell.v : null;

        if (!cellValue) {
          endRow = currentRow - 1; // La fila anterior es la última con datos
          break;
        }
        currentRow++; // Continuar a la siguiente fila
      }

      //console.log('Ultima celda N' + (endRow + 1));
      // Ahora tenemos el rango dinámico (por ejemplo, C9 hasta N(endRow))
      const range = {
        s: { r: startRow, c: colIndex }, // C9 (r=8, c=2) como punto de partida
        e: { r: endRow, c: xlsx.utils.decode_col('N') }, // Desde C9 hasta N(endRow)
      };

      // Leer los encabezados de la primera fila (por ejemplo, C9)
      const headers: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = xlsx.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        const headerValue = cell ? cell.v : `Column${col}`;
        headers.push(headerValue);
      }

      // Array para almacenar los objetos JSON
      const jsonData: any[] = [];

      // Leer las filas de datos (a partir de la fila siguiente a los encabezados)
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const rowData: any = {};
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = xlsx.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          const cellValue = cell ? cell.v : null;

          // Asignar el valor a la propiedad correspondiente según el encabezado
          rowData[headers[col - range.s.c]] = cellValue;
        }
        jsonData.push(rowData);
      }

      const arrayResponse: any[] = [];
      for (let i = 0; i < jsonData.length; i++) {
        const element = jsonData[i];
        ////console.log(element);
        if (element.DESCRIPCION !== null) {
          const objTemp = {
            description: element.DESCRIPCION,
            condition: element.Column4,
            quantity: element.QTY,
            serial: element['JUNTA #  /  SERIAL'],
            heat: element.COLADA,
            oitInspection: element['OIT INSPECCION'],
            oitReparation: element['OIT REPARACION'],
            observation: element.OBSERVACIONES,
          };
          arrayResponse.push(objTemp);
        }
      }
      // Imprimir los objetos JSON generados
      const response = {
        elements: arrayResponse,
        title: cellValue,
      };

      //console.log(JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.error('Error leyendo el archivo de Excel:', error);
      throw new Error(error.message);
    }
  };
}

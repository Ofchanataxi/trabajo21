import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';
import AdmZip from 'adm-zip';
import GetRequiredEnvVar from '../../../../../shared/utils/GetRequiredEnVar';
import { Buffer as NodeBuffer } from 'node:buffer';

const router = Router();

function loadTemplateXlsx(templateName: string): string {
  const filename = templateName.toLowerCase().endsWith('.xlsx')
    ? templateName
    : `${templateName}.xlsx`;

  const candidates: string[] = [];

  // 1) Override por ENV (puede apuntar al archivo o a la carpeta)
  const envPath = process.env.IWC_TEMPLATE_PATH;
  if (envPath) {
    const abs = path.resolve(envPath);
    try {
      const st = fs.statSync(abs);
      candidates.push(st.isDirectory() ? path.join(abs, filename) : abs);
    } catch {
      candidates.push(abs);
    }
  }

  candidates.push(path.join(__dirname, '..', '..', 'templates', filename));

  candidates.push(path.join(__dirname, 'templates', filename));

  candidates.push(
    path.join(
      process.cwd(),
      'dist',
      'modules',
      'field-module',
      'infrastructure',
      'templates',
      filename,
    ),
  );

  candidates.push(
    path.join(
      process.cwd(),
      'src',
      'modules',
      'field-module',
      'infrastructure',
      'templates',
      filename,
    ),
  );

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error('Template IWC no encontrado:');
}

// =====================
// Configuración Postgres
// =====================
const postgresConfig = {
  host: GetRequiredEnvVar('POSTGRESQL_DB_SERVER'),
  user: GetRequiredEnvVar('POSTGRESQL_DB_USER'),
  password: GetRequiredEnvVar('POSTGRESQL_DB_PWD'),
  database: GetRequiredEnvVar('POSTGRESQL_DB_NAME'),
  port: parseInt(GetRequiredEnvVar('POSTGRESQL_DB_PORT'), 10),
  ssl: true,
};

// =====================
// Helper: eliminar named ranges (_FilterDatabase, etc.)
// =====================
function toNodeBuffer(
  data: NodeBuffer | ArrayBuffer | ArrayBufferView,
): NodeBuffer {
  if (NodeBuffer.isBuffer(data)) return data;
  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView;
    return NodeBuffer.from(view.buffer, view.byteOffset, view.byteLength);
  }
  // ArrayBuffer
  return NodeBuffer.from(new Uint8Array(data as ArrayBuffer));
}

function removeNamedRanges(xlsxBuffer: NodeBuffer): NodeBuffer {
  const zip = new AdmZip(xlsxBuffer);
  const workbookEntry = zip.getEntry('xl/workbook.xml');
  if (!workbookEntry) return xlsxBuffer;

  let workbookXml = workbookEntry.getData().toString('utf-8');
  workbookXml = workbookXml.replace(
    /<definedNames[\s\S]*?<\/definedNames>/g,
    '',
  );

  zip.updateFile('xl/workbook.xml', NodeBuffer.from(workbookXml, 'utf-8'));
  return zip.toBuffer() as NodeBuffer; // salida de AdmZip es Buffer de Node
}

// eslint-disable-next-line no-console
console.log('✅ IWC Routes cargado');

router.get('/iwc/download/:tally_id', async (req: Request, res: Response) => {
  const { tally_id } = req.params;

  // Validación de ID
  const id = Number(tally_id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'tally_id inválido' });
  }

  const postgresClient = new Client(postgresConfig);

  try {
    await postgresClient.connect();

    // Query 1: seccion superior derecha
    const queryDetalles = `
    SELECT medida, description, seccion, idelementtally FROM public.report_iwc_obtain_elements_from_upper_section($1)
    `;
    const resultDetalles = await postgresClient.query(queryDetalles, [id]);

    // Query 2: seccion inferior derecha
    const queryDetallesDown = `
    SELECT medida, description, seccion, idelementtally FROM public.report_iwc_obtain_elements_from_down_section($1)
    `;
    const resultDetallesDown = await postgresClient.query(queryDetallesDown, [
      id,
    ]);

    // Query 3: info de Tally
    const queryTally = `
      SELECT 	
        t."id" AS "idTally", 
        t."idOilfieldOperations" AS "idOilfieldOperations"
      FROM public."Tally" t
      WHERE t."id" = $1
    `;
    const resultTally = await postgresClient.query(queryTally, [id]);

    // Query 4: tuberías FP2P
    const queryTubos = `
    SELECT "No.", "idTuberiaFP2P", "descripcionFP2P", "medidaFP2PActual", "diametro" 
    FROM public.report_iwc_obtain_elements_from_tubing_section($1)    
    `;
    const resultTubos = await postgresClient.query(queryTubos, [id]);

    // 🚫 Bloquear descarga si falta data en alguna consulta
    const missing: string[] = [];
    if (!resultTally.rows.length) missing.push('tally');
    if (!resultTubos.rows.length) missing.push('tuberias');
    if (!resultDetalles.rows.length) missing.push('seccion superior derecha');
    if (!resultDetallesDown.rows.length)
      missing.push('seccion inferior derecha');

    if (missing.length > 0) {
      return res
        .status(422)
        .json({
          message: 'No es posible generar el IWC: faltan datos.',
          missing,
          hint: 'Los elementos de tally estan incompletos. Por favor seleccione los elementos que se quedaron en pozo para habilitar la descarga.',
        });
    }

    // Resolver template y loguear
    const templatePath = loadTemplateXlsx('Tally_Equipo_IWC');
    // eslint-disable-next-line no-console
    console.log('📄 IWC usando template:', templatePath);

    // Abrir template IWC
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // Fallback: por nombre o por índice 1
    const worksheet =
      workbook.getWorksheet('Sheet1') ?? workbook.getWorksheet(1);
    if (!worksheet) {
      return res
        .status(500)
        .json({ message: 'No se encontró ninguna hoja en el template' });
    }

    // --- Llenar datos de la primera consulta ---
    if (resultDetalles.rows.length > 0) {
      const row = resultDetalles.rows[0];
      worksheet.getCell('AU10').value = row.medida ?? '';
      worksheet.getCell('AV10').value = row.description ?? '';
      worksheet.getCell('AV14').value = row.seccion ?? '';
      worksheet.getCell('AY10').value = row.idelementtally ?? '';
    }

    // --- Llenar datos de la segunda consulta ---
    if (resultDetallesDown.rows.length > 0) {
      resultDetallesDown.rows.forEach((row2, index) => {
        const excelRow = worksheet.getRow(index + 20); // Empieza en la fila 20
        excelRow.getCell('AU').value = row2.medida ?? '';
        excelRow.getCell('AV').value = row2.description ?? '';
        excelRow.getCell('AY').value = row2.idelementtally ?? '';
        excelRow.commit();
      });
    }

    // --- Llenar datos de la tercera consulta ---
    if (resultTally.rows.length > 0) {
      const row2 = resultTally.rows[0];
      worksheet.getCell('A6').value = row2.idTally ?? '';
      worksheet.getCell('D6').value = row2.idOilfieldOperations ?? '';
    }

    // --- Llenar datos de la cuarta consulta ---
    if (resultTubos.rows.length > 0) {
      resultTubos.rows.forEach((row3, index) => {
        const excelRow = worksheet.getRow(index + 9); // Empieza en fila 9
        excelRow.getCell('A').value = row3.no ?? '';
        excelRow.getCell('C').value = row3.idTuberiaFP2P ?? '';
        excelRow.getCell('D').value = row3.descripcionFP2P ?? '';
        excelRow.getCell('E').value = row3.medidaFP2PActual ?? '';
        excelRow.commit();
      });
    }

    // Generar buffer (Uint8Array), convertir a Buffer y limpiar Named Ranges
    const rawBuffer = await workbook.xlsx.writeBuffer(); // ArrayBuffer | Uint8Array | Buffer
    let nodeBuffer: NodeBuffer = toNodeBuffer(rawBuffer);
    nodeBuffer = removeNamedRanges(nodeBuffer);

    // Configurar descarga (en una sola línea para evitar trailing commas)
    res.setHeader('Content-Disposition', `attachment; filename=IWC_${id}.xlsx`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Length', String(nodeBuffer.length));
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Template-Path', templatePath);

    return res.status(200).send(nodeBuffer);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('❌ Error generando IWC:', err);
    return res
      .status(500)
      .json({
        message: 'Error generando IWC',
        error: err?.message,
        stack: err?.stack,
      });
  } finally {
    await postgresClient.end();
  }
});

/**
 * POST /iwc/bulk-update-tally-lengths
 * Body: { idElementTally: number[], length: (number|null)[] }
 * Llama a public.report_iwc_update_length(ids[], lengths[])
 */
router.post(
  '/iwc/bulk-update-tally-lengths',
  async (req: Request, res: Response) => {
    const idsRaw = req.body?.idElementTally;
    const lensRaw = req.body?.length;

    // Validaciones mínimas
    if (
      !Array.isArray(idsRaw) ||
      !Array.isArray(lensRaw) ||
      idsRaw.length === 0
    ) {
      return res.status(400).json({ message: 'Payload inválido o vacío.' });
    }
    if (idsRaw.length !== lensRaw.length) {
      return res
        .status(400)
        .json({ message: 'Los arreglos no miden lo mismo.' });
    }

    // Normaliza
    const ids: number[] = idsRaw.map((v: any) => Number(v));
    const lens: (number | null)[] = lensRaw.map((v: any) =>
      v === null || v === '' ? null : Number(v),
    );

    if (ids.some(n => !Number.isFinite(n))) {
      return res
        .status(400)
        .json({ message: 'Algún idElementTally no es numérico.' });
    }

    // Si NO quieres actualizar cuando length es null, filtramos esas posiciones
    const filteredIds: number[] = [];
    const filteredLens: number[] = [];
    ids.forEach((id, i) => {
      const v = lens[i];
      if (v !== null && Number.isFinite(v)) {
        filteredIds.push(id);
        filteredLens.push(v as number);
      }
    });

    if (filteredIds.length === 0) {
      return res.json({ updated: 0, errors: [] });
    }

    const client = new Client(postgresConfig);
    try {
      await client.connect();

      // Timeouts defensivos por si la función tarda
      await client.query('SET LOCAL statement_timeout = 60000'); // 60s
      await client.query(
        'SET LOCAL idle_in_transaction_session_timeout = 60000',
      ); // 60s

      /* eslint-disable no-console */
      console.info(
        `[IWC BULK] pairs=${filteredIds.length} sample=${filteredIds[0]}->${filteredLens[0]}`,
      );
      /* eslint-enable no-console */

      // 🔧 Ajuste de casts a firma típica: integer[] y numeric[]
      // Si tu función usa otro tipo, cambia aquí (p.ej., bigint[] o double precision[])
      const sql = `
        SELECT public.report_iwc_update_length($1::integer[], $2::numeric[]) AS updated
      `;

      const q = await client.query(sql, [filteredIds, filteredLens]);

      // Usa lo que devuelva la función; si no, el tamaño filtrado
      const updated =
        q?.rows?.[0]?.updated ??
        (typeof q.rowCount === 'number' ? q.rowCount : filteredIds.length);

      return res.json({ updated, errors: [] });
    } catch (e: any) {
      return res
        .status(500)
        .json({
          message: 'Error ejecutando report_iwc_update_length',
          sqlstate: e?.code,
          detail: e?.detail,
          hint: e?.hint,
          where: e?.where,
          error: e?.message,
        });
    } finally {
      await client.end().catch(() => {});
    }
  },
);

export default router;

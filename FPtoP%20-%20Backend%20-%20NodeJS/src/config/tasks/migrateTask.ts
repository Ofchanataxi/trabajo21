// src/tasks/migrateTask.ts

import * as sql from 'mssql';
import { ConnectionPool } from 'mssql';
import { Client } from 'pg';
import 'dotenv/config';
import GetRequiredEnVar from '../../shared/utils/GetRequiredEnVar';
import moment from 'moment-timezone';

// Configuración de conexión para SQL Server
const sqlServerConfig = {
  user: GetRequiredEnVar('SQLSERVER_DB_USER'),
  password: GetRequiredEnVar('SQLSERVER_DB_PWD'),
  server: GetRequiredEnVar('SQLSERVER_DB_SERVER'),
  database: GetRequiredEnVar('SQLSERVER_DB_NAME'),
  options: {
    encrypt: !!GetRequiredEnVar('SQLSERVER_ENCRYPT_V'),
    enableArithAbort: true, // Recomendado para conexiones estables
  },
  port: parseInt(GetRequiredEnVar('SQLSERVER_PORT'), 10),
  requestTimeout: 60000, // Configurar timeout global a 60 segundos (60000 ms)
};

// Configuración de conexión para PostgreSQL
const postgresConfig = {
  host: GetRequiredEnVar('POSTGRESQL_DB_SERVER'),
  user: GetRequiredEnVar('POSTGRESQL_DB_USER'),
  password: GetRequiredEnVar('POSTGRESQL_DB_PWD'),
  database: GetRequiredEnVar('POSTGRESQL_DB_NAME'),
  port: parseInt(GetRequiredEnVar('POSTGRESQL_DB_PORT')),
  ssl: true,
};

async function migrateData() {
  let pool: ConnectionPool | undefined;
  const postgresClient = new Client(postgresConfig);
  console.log('Conectado a la DB!');

  try {
    // Conectar a SQL Server
    const pool = await new sql.ConnectionPool(sqlServerConfig).connect();
    const request = pool.request();

    // sqlServerPool = sql.connect(sqlServerConfig);
    const result = await request.query(
      'SELECT vw.ITEM_NAME, vw.STATUS, vw.ENG_JOBLOG_START_DATE, vw.ENG_JOBLOG_END_DATE, vw.JOBLOG_TYPE, vw.JOBLOG_WO_NUMBER, vw.JOBLOG_ACTIVITY, vw.JOBLOG_WO_EQUIP, vw.LONG_WELL_NAME, vw.JOBLOG_START_SUSPEN, vw.JOBLOG_END_SUSPEN FROM V_AIS_ARS_CC_LDC_BY_WELL vw ORDER BY vw.JOBLOG_START_DATE DESC',
    );

    // Conectar a PostgreSQL
    await postgresClient.connect();
    await postgresClient.query('begin;');
    if (result) {
      await postgresClient.query('truncate table shaya_wells;');
      // Insertar datos en PostgreSQL
      for (const row of result.recordset) {
        const startDateUTC = moment
          .tz(row.ENG_JOBLOG_START_DATE, 'America/Bogota')
          .toISOString(); // UTC-5 -> UTC
        const endDateUTC = moment
          .tz(row.ENG_JOBLOG_END_DATE, 'America/Bogota')
          .toISOString(); // UTC-5 -> UTC

        const startDateSuspenUTC = moment
          .tz(row.JOBLOG_START_SUSPEN, 'America/Bogota')
          .toISOString(); // UTC-5 -> UTC

        const startEndSuspenUTC = moment
          .tz(row.JOBLOG_END_SUSPEN, 'America/Bogota')
          .toISOString(); // UTC-5 -> UTC

        await postgresClient.query(
          `INSERT INTO public.shaya_wells(
                    item_name, status, joblog_start_date, joblog_end_date, joblog_type, joblog_wo_number, joblog_activity, joblog_wo_equip, long_well_name, joblog_start_suspen, joblog_end_suspen)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
          [
            row.ITEM_NAME,
            row.STATUS,
            startDateUTC,
            endDateUTC,
            row.JOBLOG_TYPE,
            row.JOBLOG_WO_NUMBER,
            row.JOBLOG_ACTIVITY,
            row.JOBLOG_WO_EQUIP,
            row.LONG_WELL_NAME,
            startDateSuspenUTC,
            startEndSuspenUTC,
          ],
        );
      }
      await postgresClient.query('commit;');
      console.log('Datos migrados exitosamente!');
    }
  } catch (err) {
    await postgresClient.query('rollback;');
    console.error('Error migrando datos:', err);
  } finally {
    // Cerrar conexiones
    if (pool) {
      await pool.close();
      console.log('Connection closed');
    }
    await postgresClient.end();
  }
}

export async function migrateTask() {
  console.log('🚀 Iniciando migración de datos...');
  try {
    await migrateData();
    // Aquí iría la lógica para migrar datos
    console.log('✅ Migración completada con éxito.');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

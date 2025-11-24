import { Pool } from 'pg';
import { IDatabase } from './IDatabase';
import GetRequiredEnVar from '../../utils/GetRequiredEnVar';
import dotenv from 'dotenv';
dotenv.config();
type QueryResponse = {
  data: any[];
  totalRows: number;
};

export default class PostgreSQLDatabase implements IDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: GetRequiredEnVar('POSTGRESQL_DB_SERVER'),
      user: GetRequiredEnVar('POSTGRESQL_DB_USER'),
      password: GetRequiredEnVar('POSTGRESQL_DB_PWD'),
      database: GetRequiredEnVar('POSTGRESQL_DB_NAME'),
      port: parseInt(GetRequiredEnVar('POSTGRESQL_DB_PORT')),
      ssl: true,
    });
  }

  //Esto no usarlo, el pool deberia gestionar solo las conexiones
  async connect(): Promise<void> {
    //await this.pool.connect();
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
    } catch (error: any) {
      console.error(error.message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query(sql: string, params?: any[]): Promise<QueryResponse> {
    const responseQuery = await this.pool.query(sql, params);

    const { rows } = responseQuery;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return

    const response = rows;
    const data: any = [];
    for (let i = 0; i < response.length; i++) {
      const element = response[i];
      data.push(element);
    }

    let newResponse = {
      data: data,
      totalRows: rows.length,
    };

    if (responseQuery.command === 'UPDATE') {
      let totalRows = 0;
      if (responseQuery.rowCount !== null) {
        totalRows = responseQuery.rowCount;
      }
      newResponse = {
        data: data,
        totalRows: totalRows,
      };
    }

    return newResponse;
  }
}

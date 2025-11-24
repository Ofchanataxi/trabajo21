import { IDatabase } from './IDatabase';
import PostgreSQLDatabase from './PostgreSQLDatabase';
import SQLServerDatabase from './SQLServerDatabase';

export function createDatabase(type: string): IDatabase {
  switch (type) {
    case 'POSTGRESQL':
      return new PostgreSQLDatabase();
    case 'SQLSERVER':
      //throw new Error('Database type not supported');
      return new SQLServerDatabase();
    default:
      throw new Error('Database type not supported');
  }
}

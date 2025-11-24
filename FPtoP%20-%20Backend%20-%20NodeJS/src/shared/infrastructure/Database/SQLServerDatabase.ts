// import { Connection, ConnectionConfiguration, Request } from 'tedious';
// import { IDatabase } from './IDatabase';
// import GetRequiredEnVar  from '../../utils/GetRequiredEnVar';
// import dotenv from 'dotenv';

// dotenv.config();

// // Define el tipo del objeto de respuesta completo
// type QueryResponse = {
//   data: any[];
//   totalRows: number;
// };

// export default class SQLServerDatabase implements IDatabase {
//   private connection: Connection;

//   constructor() {
//     const config:ConnectionConfiguration = {
//         server: GetRequiredEnVar('SQLSERVER_DB_SERVER'),
//         authentication: {
//             type: 'default',
//             options: {
//                 userName: GetRequiredEnVar('SQLSERVER_DB_USER'),
//                 password: GetRequiredEnVar('SQLSERVER_DB_PWD')
//             }
//         },
//         options: {
//             encrypt: !!GetRequiredEnVar('SQLSERVER_ENCRYPT') ,
//             database: GetRequiredEnVar('SQLSERVER_DB_NAME'),
//             rowCollectionOnRequestCompletion: true,
//             port: parseInt(GetRequiredEnVar('SQL_PORT')),
//         }
//     };

//     this.connection = new Connection(config);
//   }

//   async connect(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       this.connection.on('connect', function(err) {
//           if (err) {
//               console.error(err);
//               reject(`Connection Failed: ${err.message}`);
//           }
//           //console.log("Connected");
//           resolve();
//       });
//       this.connection.connect();
//     });
//   }

//   async disconnect(): Promise<void> {
//     this.connection.close();
//   }

//   async query(sql: string, params?: any[]): Promise<QueryResponse> {
//     return new Promise((resolve, reject) => {
//       // Implementar lógica para manejar parámetros y ejecutar consultas
//       const dbQuery = sql;
//       const request = new Request(dbQuery, function(err:any, rowCount, rows) {
//         if (err) {
//             //console.log(err);
//             reject(`SQL Query: ${err}`);
//         }

//         let response = rows;
//         let data: any = [];
//         for (let i = 0; i < response.length; i++) {
//           const element = response[i];
//           let valoresFila = {};
//           interface Element2 {
//               value: any;
//               metadata: any;
//           }
//           for (let j = 0; j < element.length; j++) {

//             const element2: Element2 = element[j];
//             let objFila = {
//               [element2.metadata.colName]: element2.value
//             }
//             let aux = {...valoresFila};
//             valoresFila = {...aux, ...objFila}
//           }

//           data.push(valoresFila)
//         }

//         let rowCountResponse: number = rowCount === undefined ? 0 : rowCount;
//         let newResponse = {
//           data: data,
//           totalRows: rowCountResponse
//         }
//         resolve(newResponse);
//       });

//       // Si luego necesito optimizar las consultas porque se demoran mucho
//       /* request.on('row', function(columns) {
//         //console.log("On row");
//         columns.forEach(function(column: { value: string | null; }) {
//           if (column.value === null) {
//             //console.log('NULL');
//           } else {
//             result+= column.value + " ";
//           }
//         });
//         //console.log(result);
//         result ="";
//       });   */

//       /* request.on('done', function(rowCount, more) {
//         //console.log(rowCount + ' rows returned');
//         //resolve(rowCount);
//       });   */

//       this.connection.execSql(request);
//     });

//   }
// }
import sql from 'mssql';
import { IDatabase } from './IDatabase';
import GetRequiredEnVar from '../../utils/GetRequiredEnVar';
import dotenv from 'dotenv';

dotenv.config();

// Define el tipo del objeto de respuesta completo
type QueryResponse = {
  data: any[];
  totalRows: number;
};

export default class SQLServerDatabase implements IDatabase {
  private pool: sql.ConnectionPool;

  constructor() {
    const config: sql.config = {
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

    this.pool = new sql.ConnectionPool(config);
  }

  async connect(): Promise<void> {
    try {
      //console.log('Inicio el intento de conexion con el servidor');
      await this.pool.connect();
      //console.log('Connected to SQL Server');
    } catch (err) {
      console.error('SQL Connection Error:', err);
      throw new Error('Connection Failed');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.close();
      //console.log('Disconnected from SQL Server');
    } catch (err) {
      console.error('Error closing SQL connection:', err);
    }
  }

  async query(sqlQuery: string, params?: any[]): Promise<QueryResponse> {
    try {
      const request = this.pool.request();

      // Si hay parámetros, añádelos a la solicitud
      if (params) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
      }

      const result = await request.query(sqlQuery);

      return {
        data: result.recordset, // Los datos resultantes de la consulta
        totalRows: result.rowsAffected[0], // El número de filas afectadas
      };
    } catch (err) {
      console.error('SQL Query Error:', err);
      throw new Error('Query Failed');
    }
  }
}

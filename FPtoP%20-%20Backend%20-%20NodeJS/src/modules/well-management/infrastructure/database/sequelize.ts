// infrastructure/database/sequelize.ts
import { Sequelize } from 'sequelize';

// Configuración de la conexión a SQL Server
const sequelize = new Sequelize(
  process.env.SQLSERVER_DB_NAME!,
  process.env.SQLSERVER_DB_USER!,
  process.env.SQLSERVER_DB_PWD!,
  {
    host: process.env.SQLSERVER_DB_SERVER,
    port: parseInt(process.env.SQLSERVER_PORT!, 10),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.SQLSERVER_ENCRYPT, // Utiliza SSL para las conexiones a Azure SQL
      },
    },
    logging:
      process.env.DB_LOGGING === 'true'
        ? msg => console.log(`[Sequelize] ${msg}`)
        : false, // Configura según sea necesario
  },
);

const postgres_sequelize = new Sequelize(
  process.env.POSTGRESQL_DB_NAME as string,
  process.env.POSTGRESQL_DB_USER as string,
  process.env.POSTGRESQL_DB_PWD as string,
  {
    host: process.env.POSTGRESQL_DB_SERVER,
    dialect: 'postgres', // Cambia esto a 'mysql', 'sqlite', etc. según sea necesario
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Usar esta configuración depende de tu entorno y configuración de SSL
      },
    },
    port: Number(process.env.POSTGRESQL_DB_PORT) || 5432, // Puerto por defecto para PostgreSQL
    logging:
      process.env.DB_LOGGING === 'true'
        ? msg => console.log(`[Sequelize] ${msg}`)
        : false, // Configura según sea necesario
  },
);

export { sequelize, postgres_sequelize };

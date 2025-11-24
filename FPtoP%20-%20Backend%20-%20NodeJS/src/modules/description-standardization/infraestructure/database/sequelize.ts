import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
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
    logging: false, // Puedes habilitar o deshabilitar el logging de consultas SQL
  },
);

export { sequelize };

import { DataTypes } from 'sequelize';

export function getColumnsForTable(tableName: string) {
  switch (tableName) {
    case 'users':
      return {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
      };
    case 'Tally':
      return {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        idOilfieldOperations: { type: DataTypes.INTEGER, allowNull: false },
      };
    case 'orders':
      return {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        orderDate: { type: DataTypes.DATE },
        totalPrice: { type: DataTypes.FLOAT },
      };
    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
}

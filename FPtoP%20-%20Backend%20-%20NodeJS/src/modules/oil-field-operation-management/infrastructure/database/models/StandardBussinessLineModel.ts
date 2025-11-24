import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';

class StandardBussinessLine extends Model {
  public id!: number;
  public name!: String;
}

StandardBussinessLine.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'StandardBusinessLines',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

export { StandardBussinessLine }
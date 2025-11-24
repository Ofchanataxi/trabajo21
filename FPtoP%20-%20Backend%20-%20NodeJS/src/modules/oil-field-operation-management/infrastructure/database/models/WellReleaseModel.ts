import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';

class Well extends Model {
  public id!: number;
  public wellName!: String;
  public wellShortName!: String;
}

Well.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    wellName: { type: DataTypes.STRING, allowNull: false },
    wellShortName: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'Well',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

export { Well };

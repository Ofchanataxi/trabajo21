import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { StandardBussinessLine } from './StandardBussinessLineModel';
import { OilfieldOperations } from './oilfieldOperationsModels';

class OilfieldTypeOperations extends Model {
  public id!: number;
  public operationType!: Text;
  public operationDescription!: Text;
  public operationCode!: Text;
}

OilfieldTypeOperations.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    operationType: { type: DataTypes.TEXT, allowNull: false },
    operationDescription: { type: DataTypes.TEXT, allowNull: false },
    operationCode: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: 'OilfieldTypeOperations',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

OilfieldTypeOperations.hasOne(OilfieldOperations, {
  foreignKey: 'idOilfieldTypeOperations',
});
OilfieldOperations.belongsTo(OilfieldTypeOperations, {
  foreignKey: 'idOilfieldTypeOperations',
});

export { OilfieldTypeOperations };

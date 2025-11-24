import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { StandardBussinessLine } from './StandardBussinessLineModel';
import { OilfieldOperations } from './oilfieldOperationsModels';

class Rig extends Model {
  public id!: number;
  public name!: Text;
  public emr!: number;
}

Rig.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    emr: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'Rig',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

Rig.hasMany(OilfieldOperations, {
  foreignKey: 'idRig',
});
OilfieldOperations.belongsTo(Rig, { foreignKey: 'idRig' });

export { Rig };

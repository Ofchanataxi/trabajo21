import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { Well } from './WellReleaseModel';
import { Release } from './releaseModel';

class OilfieldOperations extends Model {
  public id!: number;
  public idOilfieldTypeOperations!: number;
  public idWell!: number;
  public operationNumber!: number;
  public endDateTime!: Date;
  public idRig!: number;
}

OilfieldOperations.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idOilfieldTypeOperations: {
      type: DataTypes.INTEGER,
    },
    idWell: {
      type: DataTypes.INTEGER,
    },
    operationNumber: {
      type: DataTypes.INTEGER,
    },
    endDateTime: {
      type: DataTypes.TIME,
    },
    idRig: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'OilfieldOperations',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

// Relaciones

OilfieldOperations.belongsTo(Well, {
  foreignKey: 'idWell',
});
Well.hasMany(OilfieldOperations, {
  foreignKey: 'idWell',
});

Release.belongsTo(OilfieldOperations, {
  foreignKey: 'idOilfieldOperations',
});
OilfieldOperations.hasMany(Release, {
  foreignKey: 'idOilfieldOperations',
});

export { OilfieldOperations };

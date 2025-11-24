import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { StandardBussinessLine } from './StandardBussinessLineModel';
import { OilfieldOperations } from './oilfieldOperationsModels';
import { ReleaseStateHistory } from './ReleaseStateHistoryModel';

class Release extends Model {
  public id!: number;
  public idBusinessLine!: number;
  public timestamp!: Date;
  public idReleaseState!: number;
  public idOilfieldOperations!: number;
  public idCreatedBy!: number;
}

Release.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idBusinessLine: {
      type: DataTypes.INTEGER,
    },
    timestamp: { type: DataTypes.TIME, allowNull: false },
    idReleaseState: { type: DataTypes.INTEGER, allowNull: false },
    idOilfieldOperations: { type: DataTypes.INTEGER, allowNull: false },
    idCreatedBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'Release',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

StandardBussinessLine.hasMany(Release, {
  foreignKey: 'idBusinessLine',
});
ReleaseStateHistory.belongsTo(Release, {
  foreignKey: 'idRelease',
});
Release.hasMany(ReleaseStateHistory, {
  foreignKey: 'idRelease',
});

Release.belongsTo(StandardBussinessLine, { foreignKey: 'idBusinessLine' });

export { Release };

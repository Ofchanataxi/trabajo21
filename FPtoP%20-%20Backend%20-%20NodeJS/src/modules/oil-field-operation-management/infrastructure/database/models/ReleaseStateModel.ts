import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { Release } from './releaseModel';
import { ReleaseStateHistory } from './ReleaseStateHistoryModel';

class ReleaseState extends Model {
  public id!: number;
  public name!: String;
}

ReleaseState.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'ReleaseState',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

ReleaseState.hasMany(Release, {
  foreignKey: 'idReleaseState',
});
Release.belongsTo(ReleaseState, { foreignKey: 'idReleaseState' });

ReleaseState.hasMany(ReleaseStateHistory, {
  foreignKey: 'idRelease',
});
ReleaseStateHistory.belongsTo(ReleaseState, {
  foreignKey: 'idNewReleaseState',
});
ReleaseStateHistory.belongsTo(ReleaseState, {
  foreignKey: 'idPreviousState',
});

export { ReleaseState };

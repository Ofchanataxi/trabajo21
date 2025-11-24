import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';

class ReleaseStateHistory extends Model {
  public id!: number;
  public idRelease!: number;
  public idNewReleaseState!: number;
  public idPreviousState!: number;
  public idChangedBy!: number;
  public changeTimestamp!: Date;
  public changeReason!: String;
}

ReleaseStateHistory.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idRelease: { type: DataTypes.INTEGER },
    idNewReleaseState: { type: DataTypes.INTEGER },
    idPreviousState: { type: DataTypes.INTEGER },
    idChangedBy: { type: DataTypes.INTEGER },
    changeTimestamp: { type: DataTypes.TIME },
    changeReason: { type: DataTypes.TEXT },
  },
  {
    tableName: 'ReleaseStateHistory',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

export { ReleaseStateHistory };

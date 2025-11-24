import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { Release } from './releaseModel';

class ElementRelease extends Model {
  public id!: number;
  public serial!: Text;
  public idCondition!: number;
  public idRelease!: number;
  public quatity!: number;
  public idCouplingCondition!: number;
  public brand!: Text;
  public idStandardElements!: number;
  public pecDescription!: Text;
  public observations!: Text;
  public approvalStatus!: boolean;
}

ElementRelease.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    serial: { type: DataTypes.STRING, allowNull: true },
    idCondition: { type: DataTypes.STRING, allowNull: false },
    idRelease: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.STRING, allowNull: false },
    idCouplingCondition: { type: DataTypes.STRING, allowNull: true },
    brand: { type: DataTypes.STRING, allowNull: true },
    idStandardElements: { type: DataTypes.STRING, allowNull: false },
    pecDescription: { type: DataTypes.STRING, allowNull: false },
    observations: { type: DataTypes.STRING, allowNull: true },
    approvalStatus: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'ElementRelease',
    sequelize: postgres_sequelize,
    timestamps: false,
  },
);

// Relations
ElementRelease.belongsTo(Release, {
  foreignKey: 'idRelease',
});

Release.hasMany(ElementRelease, {
  foreignKey: 'idRelease',
});

export { ElementRelease };

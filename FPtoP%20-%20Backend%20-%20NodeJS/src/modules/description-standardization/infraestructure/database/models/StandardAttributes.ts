import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';
import { StandardAttributeTypes } from './StandardAttributeTypes';

class StandardAttributes extends Model {
  public id!: number;
  public name!: string;
  public idStandardAttributeTypes!: number;
  public required!: boolean;
  public orderInDescription!: number;
  public idStandardElement!: number;
  public alwaysShow!: boolean;
  public onlyShowWith_idStandardAttributes!: number;
  public onlyShowWith_idStandardAttributeOptions!: number;
}

StandardAttributes.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    idStandardAttributeTypes: { type: DataTypes.INTEGER, allowNull: false },
    required: { type: DataTypes.BOOLEAN, allowNull: false },
    orderInDescription: { type: DataTypes.INTEGER, allowNull: false },
    idStandardElement: { type: DataTypes.INTEGER, allowNull: false },
    alwaysShow: { type: DataTypes.BOOLEAN, allowNull: false },
    onlyShowWith_idStandardAttributes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    onlyShowWith_idStandardAttributeOptions: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'StandardAttributes',
    sequelize,
    timestamps: false,
  },
);

// Asociaciones
StandardAttributes.belongsTo(StandardAttributeTypes, {
  foreignKey: 'idStandardAttributeTypes',
});

export { StandardAttributes };

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';
import { StandardAttributes } from './StandardAttributes';

class StandardAttributeOptions extends Model {
  public id!: number;
  public value!: string;
  public idStandardAttribute!: number;
}

StandardAttributeOptions.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.STRING, allowNull: false },
    idStandardAttribute: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'StandardAttributeOptions',
    sequelize,
    timestamps: false,
  },
);

// Asociaciones
StandardAttributeOptions.belongsTo(StandardAttributes, {
  foreignKey: 'idStandardAttribute',
});
StandardAttributes.hasMany(StandardAttributeOptions, {
  foreignKey: 'idStandardAttribute',
});

export { StandardAttributeOptions };

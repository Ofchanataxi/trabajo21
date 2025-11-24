import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

class StandardAttributeTypes extends Model {
  public id!: number;
  public type!: string;
}

StandardAttributeTypes.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'StandardAttributeTypes',
    sequelize,
    timestamps: false,
  },
);

export { StandardAttributeTypes };

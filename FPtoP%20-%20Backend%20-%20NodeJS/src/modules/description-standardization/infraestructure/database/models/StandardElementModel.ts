import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize'; // Asegúrate de tener configurado tu objeto `sequelize`
import { StandardAttributes } from './StandardAttributes';

class StandardElementModel extends Model {
  public id!: number;
  public name!: string;
  public businessLineId!: number;
  public wellSectionId!: number;

  // Timestamps
  //   public readonly createdAt!: Date;
  //   public readonly updatedAt!: Date;
}

StandardElementModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    businessLineId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'idStandardBusinessLines', // Si el nombre del campo en la base de datos es diferente
    },
    wellSectionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'idStandardWellSections', // Si el nombre del campo en la base de datos es diferente
    },
  },
  {
    tableName: 'StandardElements',
    sequelize, // passing the `sequelize` instance is required
    timestamps: false, // Desactiva createdAt y updatedAt
  },
);

// Asociaciones
StandardElementModel.hasMany(StandardAttributes, {
  foreignKey: 'idStandardElement',
});
StandardAttributes.belongsTo(StandardElementModel, {
  foreignKey: 'idStandardElement',
});

export { StandardElementModel };

import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';
import { ApplicationPages } from './ApplicationPages';
import { PermissionsGroups } from './PermissionsGroups';

class PagesAllowAccess extends Model {
    public id!: number;
    public group_id!: number;
    public page_id!: number;
    public allow!: boolean
}

PagesAllowAccess.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    group_id: {
        type: DataTypes.INTEGER, allowNull: false, references: {
            model: PermissionsGroups,
            key: "id"
        }
    },
    page_id: {
        type: DataTypes.INTEGER, allowNull: false, references: {
            model: ApplicationPages,
            key: "id"
        }
    },
    allow: { type: DataTypes.BOOLEAN, allowNull: false },

}, {
    tableName: 'PagesAllowAccess',
    sequelize: postgres_sequelize,
    timestamps: false,
},);

export { PagesAllowAccess }

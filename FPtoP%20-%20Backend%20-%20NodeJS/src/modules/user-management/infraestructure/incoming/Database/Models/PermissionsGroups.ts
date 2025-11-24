import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';
import { UserGroupsAccess } from './UserGroupsAccess';
import { PagesAllowAccess } from './PagesAllowAccess';
import { ApplicationPages } from './ApplicationPages';

class PermissionsGroups extends Model {
    public id!: number;
    public name!: String;
}

PermissionsGroups.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },

}, {
    tableName: 'PermissionsGroups',
    sequelize: postgres_sequelize,
    timestamps: false,
},);

PermissionsGroups.hasMany(UserGroupsAccess, {
    foreignKey: 'idGroup'
});
UserGroupsAccess.belongsTo(PermissionsGroups, {
    foreignKey: 'idGroup'
});



// PermissionsGroups.hasMany(PagesAllowAccess, {
//     foreignKey: 'group_id'
// });
// PagesAllowAccess.belongsTo(PermissionsGroups, {
//     foreignKey: 'group_id'
// });

export { PermissionsGroups }
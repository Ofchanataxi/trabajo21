import { Model, DataTypes } from 'sequelize';
import { UserGroupsAccess } from './UserGroupsAccess';
import { postgres_sequelize } from '../../../../well-management/infrastructure/database/sequelize';
import { Users } from './UserModel';

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

// PermissionsGroups.hasMany(UserGroupsAccess, {
//     foreignKey: 'idGroup'
// });
// UserGroupsAccess.belongsTo(PermissionsGroups, {
//     foreignKey: 'idGroup'
// });

PermissionsGroups.belongsToMany(Users, { through: UserGroupsAccess, foreignKey: 'idGroup' });
Users.belongsToMany(PermissionsGroups, { through: UserGroupsAccess, foreignKey: 'idUser' });





// PermissionsGroups.hasMany(PagesAllowAccess, {
//     foreignKey: 'group_id'
// });
// PagesAllowAccess.belongsTo(PermissionsGroups, {
//     foreignKey: 'group_id'
// });

export { PermissionsGroups }
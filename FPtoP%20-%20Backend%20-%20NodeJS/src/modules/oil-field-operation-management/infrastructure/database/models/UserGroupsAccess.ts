import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../../../../../shared/infrastructure/Database/sequelize';

class UserGroupsAccess extends Model {
    public id!: number;
    public idGroup!: number;
    public idUser!: number;
}

UserGroupsAccess.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idGroup: { type: DataTypes.INTEGER},
    idUser: { type: DataTypes.INTEGER },

}, {
    tableName: 'UserGroupsAccess',
    sequelize: postgres_sequelize,
    timestamps: false,
},);


export { UserGroupsAccess };
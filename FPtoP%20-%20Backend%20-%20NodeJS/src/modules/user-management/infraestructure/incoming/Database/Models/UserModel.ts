import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';
import { UserGroupsAccess } from './UserGroupsAccess';

class Users extends Model {
    public id!: number;
    public idBusinessLine!: number;
    public email!: String;
    public firstName!: String;
    public lastName!: String;
}



Users.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        idBusinessLine: { type: DataTypes.INTEGER },
        email: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
    },
    {
        tableName: 'Users',
        sequelize: postgres_sequelize,
        timestamps: false,
    },
);

Users.hasMany(UserGroupsAccess, {
    foreignKey: 'idUser'
});
UserGroupsAccess.belongsTo(Users, {
    foreignKey: 'idUser'
});

export { Users };

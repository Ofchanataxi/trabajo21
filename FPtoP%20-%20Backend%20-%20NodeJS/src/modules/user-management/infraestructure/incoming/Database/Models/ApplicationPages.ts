import { Model, DataTypes } from 'sequelize';
import { postgres_sequelize } from '../sequelize';
import { PagesAllowAccess } from './PagesAllowAccess';
import { PermissionsGroups } from './PermissionsGroups';

class ApplicationPages extends Model {
    public id!: number;
    public path!: String;
    public parent!: String;
}

ApplicationPages.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    path: { type: DataTypes.STRING, allowNull: false },
    parent: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'ApplicationPages',
    sequelize: postgres_sequelize,
    timestamps: false,
},
);

ApplicationPages.belongsToMany(PermissionsGroups, {
    through: PagesAllowAccess,
    foreignKey: 'page_id',
});
PermissionsGroups.belongsToMany(ApplicationPages, {
    through: PagesAllowAccess,
    foreignKey: 'group_id',
});


// ApplicationPages.hasMany(PagesAllowAccess, {
//     foreignKey: 'page_id'
// });
// PagesAllowAccess.belongsTo(ApplicationPages, {
//     foreignKey: 'page_id'
// });


export { ApplicationPages };

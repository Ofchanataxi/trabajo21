import { Sequelize } from 'sequelize';
import {
  User,
  UserApplicationPagesAccess,
  UserGroups,
} from '../../../../domain/entities/UserApplicationPagesAccess';
import { UserRepository } from '../../../../domain/repositories/UserRepository';
import { ApplicationPages } from '../Models/ApplicationPages';
import { PermissionsGroups } from '../Models/PermissionsGroups';
import { UserGroupsAccess } from '../Models/UserGroupsAccess';
import { Users } from '../Models/UserModel';
import { Exception } from 'handlebars';

export class SequelizeUserRepository implements UserRepository {
  constructor() {}

  async pagesAccessPermissions(userId: any): Promise<any> {
    try {
      let userApplicationPageAccess = await Users.findOne({
        where: {
          id: userId,
        },
        include: [
          {
            model: UserGroupsAccess,
            required: true,
            include: [
              {
                model: PermissionsGroups,
                required: true,
                include: [
                  {
                    model: ApplicationPages,
                    required: true,
                    through: {
                      where: { allow: true },
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      if (
        userApplicationPageAccess === null ||
        userApplicationPageAccess === undefined
      ) {
        return new UserApplicationPagesAccess();
      }
      let userAppPageAccessJson = userApplicationPageAccess?.toJSON();
      if (userAppPageAccessJson !== null) {
        let user = new User(
          userAppPageAccessJson.id,
          userAppPageAccessJson.idBussinessLine,
          userAppPageAccessJson.firstName,
          userAppPageAccessJson.lastName,
          userAppPageAccessJson.email,
        );
        let userGroups: UserGroups[] = [];
        let pageAllAccess: string[] = [];
        let modulesAllAccess = new Set<string>();

        for (
          let index = 0;
          index < userAppPageAccessJson.UserGroupsAccesses.length;
          index++
        ) {
          let userGroup = userAppPageAccessJson.UserGroupsAccesses[index];
          let permissionGroup = userGroup.PermissionsGroup;
          for (let j = 0; j < permissionGroup.ApplicationPages.length; j++) {
            let page = permissionGroup.ApplicationPages[j];
            pageAllAccess.push(page.parent + page.path);
            modulesAllAccess.add(page.parent);
          }
          userGroups.push(
            new UserGroups(
              permissionGroup.id,
              permissionGroup.name,
              pageAllAccess,
            ),
          );
        }
        return new UserApplicationPagesAccess(
          user,
          userGroups,
          Array.from(modulesAllAccess),
        );
      }
      return new UserApplicationPagesAccess();
    } catch (error) {
      //console.log(error);
      throw new Exception('Error obteniendo grupos de acceso');
    }
  }
}

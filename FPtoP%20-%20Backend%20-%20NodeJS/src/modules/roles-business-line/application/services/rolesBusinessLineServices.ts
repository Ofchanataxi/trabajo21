import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

export class RolesBusinessLineService {
  constructor() {}

  public getAll = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT "idStandardBusinessLines", "idStandardUsersRoles", "idStandardCompany", description
	      FROM public."StandardRolesBusinessLine";
      `;

      const response = await db.query(query, []);

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
}

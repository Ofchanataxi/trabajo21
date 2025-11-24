import { createDatabase } from '../../../../../shared/infrastructure/Database/DatabaseFactory';

export class UserManagementService {
  constructor() {}

  public create = async (
    idBusinessLine: number,
    email: string,
    firstName: string,
    lastName: string,
    microsoftid: string,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        INSERT INTO public."Users" ("email", "idBusinessLine", "firstName", "lastName", "microsoftid", "createdat")
        VALUES ($2, $1, $3, $4, $5, NOW())
        ON CONFLICT ("email") 
        DO UPDATE SET 
            "idBusinessLine" = EXCLUDED."idBusinessLine",
            "firstName" = EXCLUDED."firstName",
            "lastName" = EXCLUDED."lastName",
            "microsoftid" = EXCLUDED."microsoftid"
        RETURNING "id";
      `;

      const data = [idBusinessLine, email, firstName, lastName, microsoftid];

      const responseQuery = await db.query(query, data);
      const idStored = responseQuery.data[0].id;

      const response = { idStored: idStored };

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getByID = async (id: number) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
          u.id AS "idUsers", u."idBusinessLine", u."email", u."firstName", u."lastName", u."microsoftid", u."createdat", u."idStandardRolesBusinessLine",
          sbl.id AS "idStandardBusinessLines", sbl.name AS "NameStandardBusinessLines",
          sur.id AS "idStandardUsersRoles", sur.name AS "NameStandardUsersRoles",
          sc.id AS "idStandardCompany", sc.name AS "NameStandardCompany"
        FROM public."Users" u
        JOIN public."StandardRolesBusinessLine" srbl ON srbl.id = u."idStandardRolesBusinessLine"
        JOIN public."StandardBusinessLines" sbl ON srbl."idStandardBusinessLines" = sbl.id
        JOIN public."StandardUsersRoles" sur ON srbl."idStandardUsersRoles" = sur.id
        JOIN public."StandardCompany" sc ON srbl."idStandardCompany" = sc.id
        WHERE u.id=$1;
      `;

      const data = [id];
      const response = await db.query(query, data); // Pasar idRelease como parámetro

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public getIDByEmail = async (email: string) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT 
          u.id 
        FROM public."Users" u
        WHERE u."email" = LOWER($1);
      `;

      const data = [email];
      const response = await db.query(query, data); // Pasar idRelease como parámetro

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
}

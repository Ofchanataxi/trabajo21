import { createDatabase } from '../../../../shared/infrastructure/Database/DatabaseFactory';

export class BusinessLineService {
  constructor() {}

  public getAll = async () => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
        SELECT id, name
        FROM public."StandardBusinessLines";
      `;

      const response = await db.query(query, []); // Pasar idRelease como parámetro

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  public update = async (
    idBusinessLine: number,
    idUser: number,
    idStandardRolesBusinessLine: number,
  ) => {
    try {
      const db = createDatabase('POSTGRESQL');

      const query = `
      UPDATE public."Users"
      SET "idBusinessLine"=$1, "idStandardRolesBusinessLine"=$3
      WHERE "id" = $2
      RETURNING "id";    
      `;

      const storedFileValues = [
        idBusinessLine,
        idUser,
        idStandardRolesBusinessLine,
      ];

      const responseQuery = await db.query(query, storedFileValues);
      const idUserUpdated = responseQuery.data[0].id;

      const response = { idUser: idUserUpdated };

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

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
      INSERT INTO public."Users"(
      "idBusinessLine", email, "firstName", "lastName", microsoftid, createdat)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING "id";
      `;

      const storedFileValues = [
        idBusinessLine,
        email,
        firstName,
        lastName,
        microsoftid,
      ];

      const responseQuery = await db.query(query, storedFileValues);
      const idStored = responseQuery.data[0].id;

      const response = { idStored: idStored };

      await db.disconnect();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
}

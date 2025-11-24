import { createDatabase } from '../../../../../../shared/infrastructure/Database/DatabaseFactory';
// import { createDatabase } from 'src/shared/infrastructure/Database/DatabaseFactory';

export class UserSSORepository {
  async findByMicrosoftID(microsoftId: string): Promise<Object> {
    const db = createDatabase('POSTGRESQL');
    try {
      const user = await db.query(
        'SELECT * FROM "Users" WHERE microsoftid ILIKE $1',
        [microsoftId],
      );
      return user.data[0];
    } catch (error: any) {
      console.log('No existe el usuario');
      console.log(error.message);
      return false;
    } finally {
      db.disconnect();
    }
  }

  async createUser(userData: any): Promise<object> {
    //TODO: Terminar logica de crear un usuario por medio de SSO
    console.log('Este usuario se crea', userData);
    return new Promise(resolve => {
      setTimeout(() => {
        const response = { message: 'funcionando' };
        return resolve(response);
      }, 1000);
    });
  }
}

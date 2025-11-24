import axios, { AxiosResponse } from 'axios';
import { User } from '../../domain/entities/UserApplicationPagesAccess';
import { UserSSORepository } from '../../infraestructure/incoming/Database/Repositories/UserSSORepository';
import AuthProvider from '../../infraestructure/outgoing/provider/OfficeAuthProvider';
import { UserManagementService } from '../../infraestructure/incoming/services/userManagementServices';

interface MicrosoftResponseObject {
  '@odata.context': string;
  businessPhones: Array<string>;
  displayName: string;
  givenName: string;
  jobTitle: string;
  mail: string;
  mobilePhone: string;
  officeLocation: string | null;
  preferredLanguage: string | null;
  surname: string;
  userPrincipalName: string;
  id: string;
}

interface DataUser {
  firstName: string;
  surName: string;
  email: string;
  microsoftId: string;
}

export class UserService {
  constructor() {}
  private userSSORepository = new UserSSORepository();

  async isUserRegistered(userToken: string): Promise<true | false> {
    const userMSData = await this.getUserMicrosoftID(userToken);
    const user = await this.userSSORepository.findByMicrosoftID(userMSData);
    if (!user) {
      return false;
    }
    return true;
  }

  async returnDataUser(userToken: string): Promise<DataUser> {
    const microsoftData = await this.getUserData(userToken);
    if (microsoftData === undefined) {
      throw new Error('Error al obtener la informacion del usuario');
    }
    return microsoftData;
  }

  async obtainIDByEmail(email: string): Promise<number> {
    const userManagementService = new UserManagementService();
    const response = await userManagementService.getIDByEmail(email);
    if (response.totalRows === 0) {
      throw new Error('No se encontro el email');
    }
    return response.data[0].id;
  }

  async loginOrRegister(userToken: string): Promise<void> {
    const userMSData = await this.getUserMicrosoftID(userToken);
    let user = await this.userSSORepository.findByMicrosoftID(userMSData);

    if (!user) {
      //Needs to create
      user = await this.userSSORepository.createUser(userMSData);
      //   await this.authService.redirectToAssociation(user);
    }
  }

  private getUserMicrosoftID = async (accessToken: any) => {
    const url = 'https://graph.microsoft.com/v1.0/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data.id;
    } catch (error: unknown) {
      console.error('Failed to get user info', error);
    }
  };

  private getUserData = async (accessToken: any): Promise<DataUser> => {
    const url = 'https://graph.microsoft.com/v1.0/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response: AxiosResponse = await axios.get(url, { headers });
      const microsoftData: MicrosoftResponseObject = response.data;

      const objResponse = {
        firstName: microsoftData.givenName,
        surName: microsoftData.surname,
        email: microsoftData.mail,
        microsoftId: microsoftData.id,
      };
      return objResponse;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
}

export default UserService;

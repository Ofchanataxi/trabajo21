import { UserApplicationPagesAccess } from '../entities/UserApplicationPagesAccess';

export interface UserSSORepository {
  loginOrRegisterSSO(microsoftId: any): Promise<any>;
}

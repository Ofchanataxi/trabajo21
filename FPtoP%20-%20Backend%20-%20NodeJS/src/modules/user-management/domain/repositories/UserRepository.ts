import { UserApplicationPagesAccess } from "../entities/UserApplicationPagesAccess";

export interface UserRepository {
    pagesAccessPermissions(userId: any): Promise<void>;
}
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class GetPagesAccess {
    constructor(private userRepository: UserRepository) { }

    async execute(req: Request,
        res: Response,
        next: NextFunction): Promise<any> {
        return this.userRepository.pagesAccessPermissions(req.query.userId);
    }
} 
import { Request, Response, NextFunction } from 'express';
import { UserNotificationRepository } from '../../infraestructure/incoming/Database/Repositories/UserNotificationRepository';

export class GetUserNotification {
    constructor(private notificationRepository: UserNotificationRepository) { }

    async execute(req: Request,
                  res: Response,
                  next: NextFunction): Promise<any> {
    
    return this.notificationRepository.notification(req, req.body);
    }
} 
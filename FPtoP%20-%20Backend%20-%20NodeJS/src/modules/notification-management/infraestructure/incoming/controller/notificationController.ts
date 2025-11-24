import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import { GetUserNotification } from '../../../application/use-cases/GetUserNotification';

export class NotificationController {
  constructor( private getUserNotification: GetUserNotification,
  ){
  }

  async getNotification(req: Request, res: Response, next: NextFunction) {
    const aws = await this.getUserNotification.execute(req, res, next);
    res.json(aws)
   
  }
}

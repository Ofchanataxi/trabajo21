import { Request, Response, NextFunction } from 'express';
import approvalInformationService from '../../../well-management/infrastructure/incoming/services/approvalInformation';

export class PostRejectedWell {
  constructor() { }

  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    approvalInformationService.rejectWellInformation(req, res, next);
  }
}

import { Request, Response, NextFunction } from 'express';
import approvalInformationService from '../../../well-management/infrastructure/incoming/services/approvalInformation';

export class GetAllRejectWells {
  constructor() { }

  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    approvalInformationService.rejectApprovals(req, res, next);
  }
}

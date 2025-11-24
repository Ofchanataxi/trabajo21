import { Request, Response, NextFunction } from 'express';
import approvalInformationService from '../../../well-management/infrastructure/incoming/services/approvalInformation';

export class GetAllApprovedWells {
  constructor() { }

  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    approvalInformationService.acceptApprovals(req, res, next);
  }
}

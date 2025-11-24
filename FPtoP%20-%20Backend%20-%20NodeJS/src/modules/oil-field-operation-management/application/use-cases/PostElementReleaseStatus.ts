import { Request, Response, NextFunction } from 'express';
import approvalInformationService from '../../../well-management/infrastructure/incoming/services/approvalInformation';
import { WellStatusRepository } from '../../domain/repositories/WellStatusRepository';

export class PostElementReleaseStatus {
  constructor(private wellStatusRepository: WellStatusRepository) {}
  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (req.body.releaseIsApproved) {
      //console.log("El well ha se aceptado")
    } else {
      this.wellStatusRepository.OnRejectElementReleaseStatus(
        req.body.releaseId,
        req.body.releaseIsApproved,
        req.body.releaseCommentary,
      );
    }
  }
}

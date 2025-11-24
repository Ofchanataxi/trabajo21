import { Request, Response, NextFunction } from 'express';
import { WellInformationRepository } from '../../domain/repositories/WellInformationRepository';
import {
  ElementRelease,
  PendingReleaseForQAQC,
} from '../../domain/entities/WellInformation';

export class GetElementReleases {
  constructor(private wellInformationRepository: WellInformationRepository) { }
  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<PendingReleaseForQAQC> {
    return this.wellInformationRepository.findReleaseElementInformation(
      req.query.releaseId,
    );
  }
}

import { Request, Response, NextFunction } from 'express';
import { ReleasesRepository } from '../../../domain/repositories/ReleasesRepository';
import { RejectOilFieldOperationRelease } from '../../../domain/entities/Releases';

export class GetRejectReleases {
  constructor(private releasesRepository: ReleasesRepository) { }
  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<RejectOilFieldOperationRelease[]> {
    return this.releasesRepository.rejectByQAQC();
  }
}

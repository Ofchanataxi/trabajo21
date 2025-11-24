import { Request, Response, NextFunction } from 'express';

import { WellInformationRepository } from '../../domain/repositories/WellInformationRepository';
import { release } from '../../domain/entities/WellInformation';

export class PostWellInformation {
  constructor(private wellInformationRepository: WellInformationRepository) { }

  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<release[]> {
    return this.wellInformationRepository.findAll();
  }
}

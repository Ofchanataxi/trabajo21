import { Request, Response, NextFunction } from 'express';
import { WellInformationRepository } from '../../domain/repositories/WellInformationRepository';
import { OilfieldOperation } from '../../domain/entities/WellInformation';

export class GetOilfieldOperations {
  constructor(private wellInformationRepository: WellInformationRepository) { }
  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<OilfieldOperation[]> {
    return this.wellInformationRepository.findAllOilfieldOperations(
      req.query.releaseStatus,
    );
  }
}

import { Request, Response, NextFunction } from 'express';
import { WellDataFromFileRepository } from '../../../domain/repositories/WellDataFromFileRepository';

export class PostNewAttributeList {
  constructor(private wellDataFromFileRepo: WellDataFromFileRepository) {}
  async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    return this.wellDataFromFileRepo.PostNewAttributeList(req.body);
  }
}

import { Request, Response, NextFunction } from 'express';
import { WellDataFromFileRepository } from '../../../domain/repositories/WellDataFromFileRepository';

export class PostUploadWellDataFromFile {
    constructor(private wellDataFromFileRepo: WellDataFromFileRepository){}
    async execute(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        return this.wellDataFromFileRepo.PostUploadWellDataFromFile(req.body)
    }
}

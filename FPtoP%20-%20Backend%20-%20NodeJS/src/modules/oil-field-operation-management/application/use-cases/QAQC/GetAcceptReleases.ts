import { AcceptOilFieldOperationRelease } from "../../../domain/entities/Releases";
import { ReleasesRepository } from "../../../domain/repositories/ReleasesRepository";
import { Request, Response, NextFunction } from 'express';


export class GetAcceptReleases {
    constructor(private releasesRepository: ReleasesRepository) {

    }
    async execute(req: Request,
        res: Response,
        next: NextFunction): Promise<AcceptOilFieldOperationRelease[]> {
        return this.releasesRepository.approvedByQAQC();
    }
}
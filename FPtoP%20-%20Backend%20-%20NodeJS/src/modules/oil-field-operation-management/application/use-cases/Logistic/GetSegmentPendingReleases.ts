import { ReleasesRepository } from "../../../domain/repositories/ReleasesRepository";
import { Request, Response, NextFunction } from 'express';


export class GetSegmentPendingReleases {
    constructor(private releasesRepository: ReleasesRepository) { }

    async execute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        return this.releasesRepository.pendingSegmentSubmissions(req.query.segmentId);
    }
}


import { Request, Response, NextFunction } from 'express';
import { GetAllPendingWells } from '../../../application/use-cases/GetAllPendingWells';
import { GetPendingWellInformation } from '../../../application/use-cases/GetPendingWellInformation';
import { GetAllRejectWells } from '../../../application/use-cases/GetAllRejectedWells';
import { GetAllApprovedWells } from '../../../application/use-cases/GetAllApprovedWells';
import { PostApproveWell } from '../../../application/use-cases/PostApproveWell';
import { PostRejectedWell } from '../../../application/use-cases/PostRejectedWell';
import { GetOilfieldOperations } from '../../../application/use-cases/GetOilFieldOperations';
import { GetElementReleases } from '../../../application/use-cases/GetElementReleases';
import { GetRejectReleases } from '../../../application/use-cases/QAQC/GetRejectReleases';
import { PostElementReleaseStatus } from '../../../application/use-cases/PostElementReleaseStatus';
import { GetAcceptReleases } from '../../../application/use-cases/QAQC/GetAcceptReleases';
import { GetSegmentRejectReleases } from '../../../application/use-cases/Logistic/GetSegmentRejectReleases';
import { GetSegmentApproveReleases } from '../../../application/use-cases/Logistic/GetSegmentApproveReleases';
import { GetSegmentPendingReleases } from '../../../application/use-cases/Logistic/GetSegmentPendingReleases';
import { GetSegmentDraftReleases } from '../../../application/use-cases/Logistic/GetSegmentDraftReleases';
import { PostUploadWellDataFromFile } from '../../../application/use-cases/Logistic/PostUploadWellDataFromFile';
import { PostNewAttributeElements } from '../../../application/use-cases/Logistic/PostNewAttributeElement';
import { PostNewAttributeList } from '../../../application/use-cases/Logistic/PostNewAttributeList';
import { PostNewStandardElementError } from '../../../application/use-cases/Logistic/PostNewStandardElementError';
import { PostNewErrorExtensionDocuments } from '../../../application/use-cases/Logistic/PostNewErrorExtensionDocuments';
import { GetRequieredExtensionDocuments } from '../../../application/use-cases/Logistic/GetRequieredExtensionDocuments';
export class OilfieldOperationController {
  constructor(
    private getAllPendingWells: GetAllPendingWells,
    private getPendingWellInformation: GetPendingWellInformation,
    private getAllRejectWells: GetAllRejectWells,
    private getAllApprovedWells: GetAllApprovedWells,
    private postApprovedWell: PostApproveWell,
    private postRejectedWell: PostRejectedWell,
    private getOilfieldOperations: GetOilfieldOperations,
    private getElementReleases: GetElementReleases,
    private getQAQCRejectOilFieldOperations: GetRejectReleases,
    private postElementReleaseStatus: PostElementReleaseStatus,
    private getQAQCAcceptOilFieldOperations: GetAcceptReleases,
    private getSegmentApprovedRels: GetSegmentApproveReleases,
    private getSegmentRejectedRels: GetSegmentRejectReleases,
    private getSegmentPendingRels: GetSegmentPendingReleases,
    private getSegmentDraftRels: GetSegmentDraftReleases,
    private postUploadWellDataFromFile: PostUploadWellDataFromFile,
    private postNewAttributeElement: PostNewAttributeElements,
    private postNewAttributeList: PostNewAttributeList,
    private postNewStandardElementError: PostNewStandardElementError,
    private postNewErrorExtensionDocuments: PostNewErrorExtensionDocuments,
    private getRequieredExtensionDocuments: GetRequieredExtensionDocuments,
  ) {}

  async getPendingWells(req: Request, res: Response, next: NextFunction) {
    const pendingWells = await this.getAllPendingWells.execute(req, res, next);
  }

  async getPendingWellInfo(req: Request, res: Response, next: NextFunction) {
    const pendingWellInformation = await this.getPendingWellInformation.execute(
      req,
      res,
      next,
    );
  }

  async getRejectWells(req: Request, res: Response, next: NextFunction) {
    const rejectWells = await this.getAllRejectWells.execute(req, res, next);
  }

  async getApprovedWells(req: Request, res: Response, next: NextFunction) {
    const approvedWells = await this.getAllApprovedWells.execute(
      req,
      res,
      next,
    );
  }

  async rejectWell(req: Request, res: Response, next: NextFunction) {
    const approvedWell = await this.postRejectedWell.execute(req, res, next);
  }

  async approveWell(req: Request, res: Response, next: NextFunction) {
    const approvedWell = await this.postApprovedWell.execute(req, res, next);
  }

  async OilfieldOperations(req: Request, res: Response, next: NextFunction) {
    try {
      const OilfieldOperations = await this.getOilfieldOperations.execute(
        req,
        res,
        next,
      );
      res.json(OilfieldOperations);
    } catch (error) {
      res.status(500);
      res.json({ messageError: 'Error getting oil field operations' });
    }
  }
  async ElementReleases(req: Request, res: Response, next: NextFunction) {
    const elementReleases = await this.getElementReleases.execute(
      req,
      res,
      next,
    );
    res.json(elementReleases);
  }

  async RejectByQAQC(req: Request, res: Response, next: NextFunction) {
    const oilfieldOperations =
      await this.getQAQCRejectOilFieldOperations.execute(req, res, next);
    res.json(oilfieldOperations);
  }

  async ApprovedByQAQC(req: Request, res: Response, next: NextFunction) {
    const oilfieldOperations =
      await this.getQAQCAcceptOilFieldOperations.execute(req, res, next);
    res.json(oilfieldOperations);
  }

  async changeReleaseStatus(req: Request, res: Response, next: NextFunction) {
    const ers = await this.postElementReleaseStatus.execute(req, res, next);
    res.json(ers);
  }

  async segmentApprovedSubmissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const submissions = await this.getSegmentApprovedRels.execute(
      req,
      res,
      next,
    );
    res.json(submissions);
  }

  async segmentRejectedSubmissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const submissions = await this.getSegmentRejectedRels.execute(
      req,
      res,
      next,
    );
    res.json(submissions);
  }

  async segmentPendingSubmissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const submissions = await this.getSegmentPendingRels.execute(
      req,
      res,
      next,
    );
    res.json(submissions);
  }

  async segmentDraftSubmissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const submissions = await this.getSegmentDraftRels.execute(req, res, next);
    res.json(submissions);
  }

  async uploadWellDataFromFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const ans = await this.postUploadWellDataFromFile.execute(req, res, next);
      res.json(ans);
    } catch (error: any) {
      res.status(400);
      res.json({ messageError: error.message });
    }
  }

  async newAttributeElement(req: Request, res: Response, next: NextFunction) {
    try {
      const submissions = await this.postNewAttributeElement.execute(
        req,
        res,
        next,
      );
      res.json(submissions);
    } catch (error: any) {
      res.status(400);
      res.json({ messageError: error.message });
    }
  }

  async newAttributeList(req: Request, res: Response, next: NextFunction) {
    try {
      const submissions = await this.postNewAttributeList.execute(
        req,
        res,
        next,
      );
      res.json(submissions);
    } catch (error: any) {
      res.status(400);
      res.json({ messageError: error.message });
    }
  }

  async newStandardElementError(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const submissions = await this.postNewStandardElementError.execute(
        req,
        res,
        next,
      );
      res.json(submissions);
    } catch (error: any) {
      res.status(400);
      res.json({ messageError: error.message });
    }
  }

  async newErrorExtensionDocuments(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const submissions = await this.postNewErrorExtensionDocuments.execute(
        req,
        res,
        next,
      );
      res.json(submissions);
    } catch (error: any) {
      res.status(400);
      res.json({ messageError: error.message });
    }
  }

  async requieredExtensionDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.getRequieredExtensionDocuments.execute(req);
      res.json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({ messageError: error.message });
    }
  }
}

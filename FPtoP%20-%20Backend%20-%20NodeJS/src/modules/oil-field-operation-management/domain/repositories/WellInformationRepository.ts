import { ElementRelease, OilfieldOperation, PendingReleaseForQAQC, release } from '../entities/WellInformation';

export interface WellInformationRepository {
  findAll(): Promise<release[]>;
  insertOne(): Promise<void>;
  findAllOilfieldOperations(releaseStatus: any): Promise<OilfieldOperation[]>;
  findReleaseElementInformation(releaseId: any): Promise<PendingReleaseForQAQC>;
}

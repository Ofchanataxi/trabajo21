// domain/repositories/WellRepository.ts
import { Well } from '../../../well-management/domain/entities/Well';
import { releaseStateHistory } from '../entities/WellInformation';

export interface WellStatusRepository {
  OnRejectElementReleaseStatus(releaseID: any, isApproved: boolean, commentaryRelease: string): Promise<releaseStateHistory>;
}

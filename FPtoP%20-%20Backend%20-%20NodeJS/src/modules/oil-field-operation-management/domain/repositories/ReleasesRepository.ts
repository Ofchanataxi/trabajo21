import { AcceptOilFieldOperationRelease, RejectOilFieldOperationRelease } from "../entities/Releases";

export interface ReleasesRepository {
  rejectByQAQC(): Promise<RejectOilFieldOperationRelease[]>;
  approvedByQAQC(): Promise<AcceptOilFieldOperationRelease[]>;
  approvedSegmentSubmissions(segmentId: any): Promise<any[]>;
  rejectedSegmentSubmissions(segmentId: any): Promise<any[]>;
  pendingSegmentSubmissions(segmentId: any): Promise<any[]>;
  editingSegmentSubmissions(segmentId: any): Promise<any[]>;

}

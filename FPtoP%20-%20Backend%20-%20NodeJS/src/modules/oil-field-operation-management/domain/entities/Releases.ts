class RejectOilFieldOperationRelease {
  constructor(
    public id?: number,
    public releaseId?: number,
    public wellName?: String,
    public updateBy?: String,
    public updateById?: number,
    public dateUpdate?: Date,
    public bussinessLine?: String,
    public rejectReason?: String,
  ) {}
}

class AcceptOilFieldOperationRelease {
  constructor(
    public id?: number,
    public releaseId?: number,
    public wellName?: String,
    public updateBy?: String,
    public updateById?: number,
    public dateUpdate?: Date,
    public bussinessLine?: String,
  ) {}
}

class UserInformation {
  constructor(
    public id?: number,
    public name?: String,
    public belongsGroups?: String[],
  ) {}
}

class LogisticApprovedOilFieldOperation {
  constructor(
    public oilFieldOpId?: number,
    public releaseStateHistoryId?: number,
    public releaseId?: number,
    public wellName?: String,
    public createBy?: UserInformation,
    public dateCreate?: Date,
    public updateBy?: UserInformation,
    public dateUpdate?: Date,
    public bussinessLine?: String,
  ) {}
}

class SegmentPendingOilFieldOperation {
  constructor(
    public oilFieldOpId?: number,
    public releaseStateHistoryId?: number,
    public releaseId?: number,
    public wellName?: String,
    public createBy?: UserInformation,
    public dateCreate?: Date,
    public pendingbussinessLine?: String,
    public pendingStatusText?: String,
  ) {}
}

class SegmentEditingOilFieldOperation {
  constructor(
    public oilFieldOpId?: number,
    public releaseStateHistoryId?: number,
    public releaseId?: number,
    public wellName?: String,
    public createBy?: UserInformation,
    public dateCreate?: Date,
  ) {}
}

export {
  RejectOilFieldOperationRelease,
  AcceptOilFieldOperationRelease,
  LogisticApprovedOilFieldOperation,
  UserInformation,
  SegmentPendingOilFieldOperation,
  SegmentEditingOilFieldOperation,
};

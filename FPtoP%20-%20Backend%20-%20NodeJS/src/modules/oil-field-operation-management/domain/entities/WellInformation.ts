class release {
  constructor(
    public id: number,
    public idBusinessLine: number,
    public timestamp: Date,
    public idReleaseState: number,
    public idOilfieldOperations: number,
  ) {}
}

class OilfieldOperation {
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

class releaseStateHistory {
  constructor(
    public id: number,
    public idRelease: number,
    public idNewReleaseState: number,
    public idPreviousState: number,
    public idChangedBy: number,
    public changeTimestamp: Date,
    public changeReason: String,
  ) {}
}

class users {
  constructor(
    public id: number,
    public idBusinessLine: number,
    public email: String,
    public firstName: String,
    public lastName: String,
  ) {}
}

class releaseState {
  constructor(
    public id: number,
    public name: String,
  ) {}
}

class StandardBussinessLine {
  constructor(
    public id: number,
    public name: String,
  ) {}
}

class ElementRelease {
  constructor(
    public id: number,
    public idRelease: number,
    public pecDescription: Text,
    public quantity: number,
    public supportDocuments?: any[],
  ) {}
}

class ExtensionDocuments {
  constructor(
    public name: string,
    public fileExtension: string,
    public multipleFiles: number,
    public useDocumentoHabilitante: number,
    public useDossier: number,
    public idStandardElements: number,
    public required: number,
    public idStandardCondition: number,
  ) {}
}
class PendingReleaseForQAQC {
  constructor(
    public availableFiles: any[],
    public elements: ElementRelease[],
  ) {}
}

export {
  release,
  OilfieldOperation,
  releaseState,
  releaseStateHistory,
  users,
  StandardBussinessLine,
  ElementRelease,
  PendingReleaseForQAQC,
  ExtensionDocuments,
};

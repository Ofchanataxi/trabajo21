import { ElementReleaseStandard } from '../entities/WellDataFromFile';

export interface WellDataFromFileRepository {
  PostNewErrorExtensionDocuments(elementExtension: any): PromiseLike<any>;
  PostUploadWellDataFromFile(elementRelease: any): Promise<any>;
  PostNewAttributeElement(elementRelease: any): Promise<any>;
  PostNewAttributeList(elementRelease: any): Promise<any>;
  PostNewStandardElementError(elementRelease: any): Promise<any>;
  GetRequieredExtensionDocuments(elementExtension: any): Promise<any>;
}

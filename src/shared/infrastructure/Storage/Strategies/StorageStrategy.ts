export interface StorageStrategy {
  uploadFile(
    containerName: string,
    file: Buffer,
    filePath: string,
  ): Promise<string>;
  deleteFile(containerName: string, fileName: string): Promise<void>;
  obtainFile(
    containerName: string,
    filePath: string,
    idStoredFiles: number,
    fileName: string,
  ): Promise<any>;
  obtainContainerAndNameFromPath(path: string): any;
}

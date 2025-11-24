import { StorageStrategy } from './Strategies/StorageStrategy';

export class FileService {
  private storageStrategy: StorageStrategy;

  constructor(storageStrategy: StorageStrategy) {
    this.storageStrategy = storageStrategy;
  }

  async uploadFile(
    containerName: string,
    file: Buffer,
    fileName: string,
  ): Promise<any> {
    return this.storageStrategy.uploadFile(containerName, file, fileName);
  }

  async deleteFile(path: string): Promise<void> {
    const { containerName, fileName } =
      this.storageStrategy.obtainContainerAndNameFromPath(path);
    return this.storageStrategy.deleteFile(containerName, fileName);
  }

  async obtainFile(
    containerName: string,
    filePath: string,
    idStoredFiles: number,
    fileName: string,
  ): Promise<string> {
    return this.storageStrategy.obtainFile(
      containerName,
      filePath,
      idStoredFiles,
      fileName,
    );
  }
}

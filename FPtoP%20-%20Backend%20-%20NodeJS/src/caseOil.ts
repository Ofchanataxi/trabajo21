import { FileService } from './shared/infrastructure/Storage/StorageFileService';

export const manageOilWell = async (
  fileService: FileService,
  file: Buffer,
  fileName: string,
): Promise<string> => {
  const containerName = 'shaya';
  return fileService.uploadFile(containerName, file, fileName);
};

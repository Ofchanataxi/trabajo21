export interface FileRepository {
  uploadFile(file: Buffer, fileName: string, entityId: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

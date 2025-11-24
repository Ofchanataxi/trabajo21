// src/infrastructure/file/ZipExtractor.ts
import AdmZip from 'adm-zip';
import { ZipFile } from '../../domain/model/ZipFile';
import * as mime from 'mime-types';

export class ZipExtractor {
  public extract(filePath: string): ZipFile[] {
    const zip = new AdmZip(filePath);
    const extractedFiles = this.extractEntries(zip);
    return extractedFiles;
  }

  private extractEntries(zip: AdmZip, parentPath: string = ''): ZipFile[] {
    const extractedFiles: ZipFile[] = [];

    zip.getEntries().forEach(entry => {
      const fileName = parentPath + entry.entryName;
      const buffer = entry.getData();
      const content = new Uint8Array(buffer);
      const mimeType = mime.lookup(fileName) || 'application/octet-stream';

      if (mimeType === 'application/zip') {
        const nestedZip = new AdmZip(buffer);
        const nestedFiles = this.extractEntries(nestedZip, fileName + '/');
        extractedFiles.push(...nestedFiles);
      } else {
        extractedFiles.push(new ZipFile(fileName, content, buffer, mimeType));
      }
    });

    return extractedFiles;
  }
}

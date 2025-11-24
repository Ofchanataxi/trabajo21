// src/application/services/ZipService.ts
import {
  PDFAcroSignature,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
} from 'pdf-lib';
import { SignService } from '../../../../shared/infrastructure/Services/CheckSignService';
import { ZipFile } from '../../domain/model/ZipFile';
import { ZipExtractor } from '../../infrastructure/file/ZipExtractor';
import * as forge from 'node-forge';
import JSZip from 'jszip';

export class ZipService {
  private zipExtractor: ZipExtractor;
  private SignService: SignService;

  constructor() {
    this.zipExtractor = new ZipExtractor();
    this.SignService = new SignService();
  }

  public extractFilesFromZip(filePath: string): ZipFile[] {
    return this.zipExtractor.extract(filePath);
  }
}

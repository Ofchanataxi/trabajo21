// src/interfaces/controllers/ZipController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import { ExtractCertificatesService } from '../../../../shared/infrastructure/Services/ExtractCertificatesService';
import { VerifySignService } from '../../application/services/VerifySignService';
import { SignService } from '../../../../shared/infrastructure/Services/CheckSignService';

export class ZipController {
  private extractCertificatesService: ExtractCertificatesService;
  private verifySignService: VerifySignService;
  private signsService: SignService;

  constructor() {
    this.extractCertificatesService = new ExtractCertificatesService();
    this.verifySignService = new VerifySignService();
    this.signsService = new SignService();
  }

  public async uploadAndExtract(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const extractedFiles =
        this.extractCertificatesService.extractFilesFromZip(file.path);

      // Eliminar el archivo subido
      fs.unlinkSync(file.path);

      for (let i = 0; i < extractedFiles.length; i++) {
        const element = extractedFiles[i];
        extractedFiles[i] = await this.signsService.CheckDocument(element);
      }

      return res.json(extractedFiles);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  public async testFileSigns(req: Request, res: Response): Promise<any> {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      let results = await this.signsService.CheckDocument(file);
      return res.json(results);
    } catch (error) {
      return error;
    }
  }
}

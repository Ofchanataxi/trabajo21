import { ZipService } from '../../application/services/ZipService';
import { ExtractValidCertificates } from '../../application/use-cases/extract_valid_certificates';
import { Request, Response } from 'express';

export class SignsController {
  private extractCertificateUseCase: ExtractValidCertificates;

  constructor(extractCertificateUseCase: ExtractValidCertificates) {
    this.extractCertificateUseCase = extractCertificateUseCase;
  }

  public async extractCertificatesFromZip(
    req: Request,
    res: Response,
  ): Promise<any> {
    await this.extractCertificateUseCase.execute(req, res);
  }
}

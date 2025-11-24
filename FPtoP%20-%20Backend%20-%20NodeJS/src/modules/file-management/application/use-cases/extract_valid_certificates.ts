import { Request, Response, NextFunction } from 'express';
import { ExtractCertificatesService } from '../../../../shared/infrastructure/Services/ExtractCertificatesService';
import fs from 'fs';

export class ExtractValidCertificates {
  private extractCertificatesService: ExtractCertificatesService;

  constructor(extractCertificatesService: ExtractCertificatesService) {
    this.extractCertificatesService = extractCertificatesService;
  }

  async execute(req: Request, res: Response): Promise<any> {
    try {
      const zipFile = req.file;
      if (!zipFile) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      console.log('req.file?.mimetype: ', req.file?.mimetype);
      const isZip =
        req.file?.mimetype === 'application/zip' ||
        req.file?.mimetype === 'application/x-zip-compressed';
      if (!isZip) {
        return res.status(400).json({ message: 'El archivo no es ZIP válido' });
      }
      // Extract all the files here
      const certificatesZip =
        await this.extractCertificatesService.extractCertificatesFromZip(
          zipFile.path,
        );
      if (certificatesZip === undefined) {
        return res.status(204).json({ message: 'No certificates found' });
      }
      await fs.promises.unlink(zipFile.path);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=certificates.zip',
      );
      res.setHeader('Content-Length', certificatesZip.length.toString());

      // Envía el contenido binario
      return res.end(certificatesZip);
    } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({ error: 'Error al obtener certificados' });
    }
  }
}

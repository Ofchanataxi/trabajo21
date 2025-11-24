// src/application/services/ZipService.ts
import {
  PDFAcroSignature,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
} from 'pdf-lib';
import { SignService } from './CheckSignService';
import { ZipFile } from '../../../modules/file-management/domain/model/ZipFile';
import { ZipExtractor } from '../../../modules/file-management/infrastructure/file/ZipExtractor';
import * as forge from 'node-forge';
import JSZip from 'jszip';

export class ExtractCertificatesService {
  private zipExtractor: ZipExtractor;
  private SignService: SignService;

  constructor() {
    this.zipExtractor = new ZipExtractor();
    this.SignService = new SignService();
  }

  public extractFilesFromZip(filePath: string): ZipFile[] {
    let zipFile = this.zipExtractor.extract(filePath);
    return zipFile;
  }

  public async extractCertificatesFromZip(filePath: string): Promise<any> {
    const zipFiles = this.extractFilesFromZip(filePath);
    let rootCaArr: { certName: string; certificate: string }[] = [];
    let secondCaArr: { certName: string; certificate: string }[] = [];
    const zip = new JSZip();
    try {
      for (const file of zipFiles) {
        if (file.buffer && file.content.length > 0) {
          const pdfBuffer = file.buffer;
          const pdfHeader = pdfBuffer.subarray(0, 5).toString();

          if (pdfHeader === '%PDF-') {
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const catalog = pdfDoc.catalog;
            const acroForm = catalog.getAcroForm();
            const fields = acroForm?.getAllFields();

            if (fields) {
              for (const field of fields) {
                let pdfAcroSignature = field[0] as PDFAcroSignature;
                let v = pdfAcroSignature.V() as PDFDict;
                let contents = pdfDoc.context.lookup(
                  v.get(PDFName.of('Contents')),
                ) as PDFHexString;

                let pkcs7Msg =
                  this.SignService.getPKCS7ContainerObject(contents);
                if (!pkcs7Msg) continue;

                const extractedCerts =
                  this.extractSignatureCertificates(pkcs7Msg);
                if (extractedCerts) {
                  const [rootCas, intermediateCas] = extractedCerts;

                  if (rootCas) {
                    rootCas.forEach(cert => {
                      if (
                        !rootCaArr.some(
                          existingCert =>
                            existingCert.certificate === cert.certificate,
                        )
                      ) {
                        rootCaArr.push(cert);
                      }
                    });
                  }

                  if (intermediateCas) {
                    intermediateCas.forEach(cert => {
                      if (
                        !secondCaArr.some(
                          existingCert =>
                            existingCert.certificate === cert.certificate,
                        )
                      ) {
                        secondCaArr.push(cert);
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }
      rootCaArr.forEach((rootCa, idx) => {
        zip.file(`root_certificate_${rootCa.certName}.pem`, rootCa.certificate);
      });
      secondCaArr.forEach((intermediateCa, idx) => {
        zip.file(
          `intermediate_certificate_${intermediateCa.certName}.pem`,
          intermediateCa.certificate,
        );
      });
      if (rootCaArr.length !== 0 || rootCaArr.length !== 0) {
        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
        return zipContent;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error('Error: ', error);
      throw error;
    }
  }

  private extractSignatureCertificates = (
    pkcs7Message: any,
  ):
    | [
        rootCertificates: { certName: string; certificate: string }[],
        supportCertificates: { certName: string; certificate: string }[],
      ]
    | undefined => {
    try {
      const certificates: any[] = pkcs7Message.certificates;
      const parsedCertificates = certificates.slice(0, -1);

      const rootCertificates = parsedCertificates.filter((cert: any) => {
        return cert.subject.hash === cert.issuer.hash;
      });
      const intermediateCertificates = parsedCertificates.filter(
        (cert: any) => {
          return cert.subject.hash !== cert.issuer.hash;
        },
      );

      const pemRootCertificates = rootCertificates.map((rootCert: any) => {
        let rootCertName: string = '';
        let attrs: any[] = rootCert.subject.attributes;
        attrs.forEach(attr => {
          if (attr.type === '2.5.4.3') {
            rootCertName = attr.value;
          }
        });
        let object = (rootCert = {
          certName: rootCertName,
          certificate: forge.pki.certificateToPem(rootCert),
        });
        return object;
      });
      const pemSuppCertificates = intermediateCertificates.map(
        (suppCert: any) => {
          let suppCertCertName: string = '';
          let attrs: any[] = suppCert.subject.attributes;
          attrs.forEach(attr => {
            if (attr.type === '2.5.4.3') {
              suppCertCertName = attr.value;
            }
          });
          let object = (suppCert = {
            certName: suppCertCertName,
            certificate: forge.pki.certificateToPem(suppCert),
          });
          return object;
        },
      );

      return [pemRootCertificates, pemSuppCertificates];
    } catch (error) {
      console.error('Error: ', error);
      return undefined;
    }
  };
}

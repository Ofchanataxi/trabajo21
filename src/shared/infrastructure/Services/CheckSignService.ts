import * as fs from 'fs';
import * as path from 'path';
import { createHash, publicDecrypt, constants } from 'crypto';

import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFRef,
  PDFHexString,
  PDFString,
  PDFArray,
  PDFAcroSignature,
  PDFNumber,
} from 'pdf-lib';
import * as forge from 'node-forge';

interface SignInformation {
  userData?: any;
  validNotBefore?: any;
  validAfter?: any;
  signingTime?: Date;
  isSignedOnTime?: boolean;
  byteRange?: any[];
  reason?: string;

  location?: string;
  filter?: string;
  subfilter?: string;
  digestAlgorithm?: string;
  thereIsAnnots?: {};
  signIntegrity?: { [key: string]: any };
  certificateData?: { [key: string]: any };
  signWithProblems?: boolean;
}

interface AnnotModification {
  type?: string;
  madeBY?: string;
  contents?: string;
  date?: Date;
}

interface SignDataIntegrity {
  hasIntegrity?: boolean;
  integrityMessage?: string;
}

interface PDFDataModifications {
  didDocChange?: boolean;
  generalMsg?: string;
  modifications?: AnnotModification[];
}

interface certificateData {
  isCertificateValid?: boolean;
  invalidCertificateMsg?: string;
  certificateAuthority?: string;
}

export class SignService {
  constructor() {}

  public async CheckDocument(
    file: any,
  ): Promise<SignInformation[] | string | undefined | any> {
    try {
      // Get PDF data
      const { fieldname, encoding, mimetype, buffer, size, ...obj } = file;

      // Set file name in case of fieldName is use instead of fieldname
      if (obj.fileName === undefined) {
        obj['fileName'] = fieldname;
      }

      const pdfBuffer = file.buffer;
      const pdfHeader = pdfBuffer.subarray(0, 5).toString();

      if (file.mimetype === 'application/pdf') {
        if (pdfHeader === '%PDF-') {
          const pdfDoc = await PDFDocument.load(pdfBuffer);

          // Get signs information and them integrity (modifications)
          const certificateInformations =
            await this.extractCertificatesInformation(pdfDoc, pdfBuffer);
          // Get PDF modifications (annots)
          const pdfModifications = this.findPDFAnnots(pdfDoc);
          let areThereProblems: boolean = false;
          // Set data
          obj['annots'] = pdfModifications;
          obj['signs'] = certificateInformations;
          // If Certificate Informations are an Array of SignInformation
          // Then find if a certificate has a problem
          if (Array.isArray(certificateInformations))
            certificateInformations.forEach((certificate: SignInformation) => {
              if (certificate.signWithProblems) {
                areThereProblems = true;
              }
            });
          // If there are modifications then update areThereProblems
          if (pdfModifications.didDocChange === true) areThereProblems = true;
          obj['areThereProblems'] = areThereProblems;
        } else {
          obj['areThereProblems'] = true;
          obj['problems'] =
            'Se encontro problemas al analizar las firmas del documento PDF, no se encuentra la cabecera PDF';
        }
      }
      obj.content = (new Uint8Array(buffer) as any).toString('base64');
      return obj;
    } catch (error) {
      console.error('Error:', error);
      return undefined;
    }
  }

  private async extractCertificatesInformation(
    pdfDoc: PDFDocument, // PDF reads by PDFDocument
    pdfBuffer: Buffer, // Buffer from PDF Request Document
  ): Promise<SignInformation[] | string> {
    // Returns SignInformation Objects | Custom Error Message
    try {
      let signsInformation: SignInformation[] = [];

      // Get into the fields by accessing in the AcroForm obtained by the catalog
      const catalog = pdfDoc.catalog;
      const acroForm = catalog.getAcroForm();
      const fields = acroForm?.getAllFields();
      fields?.forEach((field: any) => {
        let pdfAcroSignature = field[0] as PDFAcroSignature;
        let v = pdfAcroSignature.V() as PDFDict; // Equals to Field Data
        let byteRange = pdfDoc.context.lookup(
          v.get(PDFName.of('ByteRange')),
        ) as PDFArray; // Range of bytes limiting contents and signs
        let contents = pdfDoc.context.lookup(
          v.get(PDFName.of('Contents')),
        ) as PDFHexString; // Sign Contents Base64 | Can be read like PKCS7
        let filter = pdfDoc.context.lookup(
          v.get(PDFName.of('Filter')),
        ) as PDFName; // Sign filter
        let location = pdfDoc.context.lookup(
          v.get(PDFName.of('Location')),
        ) as PDFString; // Where the sign was made
        let m = pdfDoc.context.lookup(v.get(PDFName.of('M'))) as PDFString; // When the sign was made
        let reason = pdfDoc.context.lookup(
          v.get(PDFName.of('Reason')),
        ) as PDFString; // Signing reason
        let subfilter = pdfDoc.context.lookup(
          v.get(PDFName.of('Subfilter')),
        ) as PDFName;

        // Create SignInformation Object
        let obj: SignInformation = {
          reason: reason?.asString(),
          location: location?.asString(),
          byteRange: byteRange
            .asArray()
            .map(pdfNumber => (pdfNumber as PDFNumber).asNumber()),
          filter: filter?.asString(),
          subfilter: subfilter?.asString(),
          signingTime: this.extractsigningTime(m)!,
        };
        signsInformation.push(obj);

        // Create PKCS7 Container and get Sign Content
        let pkc7Msg = this.getPKCS7ContainerObject(contents);

        // Get Digest Algorithm Name using OID Code
        const digestAlgorithm = pkc7Msg!.rawCapture.digestAlgorithm;
        const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm);
        const algorithmName: string = forge.pki.oids[hashAlgorithmOid];

        // Extract Signature Details from PKCS7 Contents like
        const [publicKeyPem, certificate, issuer] =
          this.extractSignatureDetails(pkc7Msg)!;

        // Checks Sign Integrity
        // Integrity has both integrity and modifications results
        const signsIntegrity = this.checkSignsIntegrity(
          pdfBuffer,
          publicKeyPem,
          obj.byteRange!,
          contents,
        );

        // Save Integrity Results and User Data
        obj.signIntegrity = signsIntegrity;
        obj.userData = {
          CI: certificate.CI,
          Names: certificate.Names,
        };
        obj.digestAlgorithm = algorithmName;

        // Validate the certificates using trusted baul and certificates
        // from Validate CA

        const serverWithEspecificReadPermissions =
          process.env.SERVER_WITH_ESPECIFIC_READ_PERMISSIONS || false;

        let finalPathCARoot = 'src/shared/CAS/rootCerts';
        let finalPathCAIntermediate = 'src/shared/CAS/intermediateCerts/';

        console.log('__dirname');
        console.log(__dirname);
        if (serverWithEspecificReadPermissions) {
          finalPathCARoot = path.join(
            __dirname,
            '..',
            '..',
            'CAs',
            'rootCerts',
          );
          finalPathCAIntermediate = path.join(
            __dirname,
            '..',
            '..',
            'CAs',
            'intermediateCerts',
          );
        }

        const [validSign, validSignMsg] = this.validateCertificate(
          certificate.PEM,
          finalPathCARoot,
          finalPathCAIntermediate,
          obj.signingTime!,
        );

        // Save other certificate data
        obj.validNotBefore = certificate.ValidFrom;
        obj.validAfter = certificate.ValidTo;
        // Validate if the sign was made on time
        obj.isSignedOnTime = this.isSignedOnTime(
          obj.signingTime!,
          obj.validNotBefore,
          obj.validAfter,
        )!;
        let certificateData: certificateData = {
          isCertificateValid: validSign,
          invalidCertificateMsg: validSignMsg,
          certificateAuthority: issuer,
        };
        obj.certificateData = certificateData;

        const signWithProblems =
          !obj.certificateData.isCertificateValid ||
          !obj.signIntegrity.hasIntegrity;
        obj.signWithProblems = signWithProblems;
      });
      return signsInformation;
    } catch (error) {
      console.error(error);
      return 'No se puede verificar la información de las firmas, si este problema persiste verifique el documento en una herammienta externa o contacte a un administrador';
    }
  }

  private readFileAsync = (filePath: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  getPKCS7ContainerObject = (
    sigContents: PDFHexString | PDFString,
  ): any | undefined => {
    const sigValue = sigContents.asBytes();
    let hexString = this.bytesToHex(sigValue);
    let buffer: any = Buffer.from(hexString, 'hex');
    buffer = this.trimBuffer(buffer);

    try {
      const p7Asn1 = forge.asn1.fromDer(buffer.toString('binary'), false);
      const pcks7Content: any = forge.pkcs7.messageFromAsn1(p7Asn1);
      return pcks7Content;
    } catch (error) {
      console.log('Error creating PKCS7 Container: ', error);
      return undefined;
    }
  };

  private trimBuffer = (buffer: Buffer): Buffer => {
    let end = buffer.length;
    while (end > 0 && buffer[end - 1] === 0) end--;
    return buffer.slice(0, end);
  };

  private bytesToHex = (bytes: any): string => {
    return Array.from(bytes)
      .map((byte: any) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  private extractsigningTime = (modDate: PDFString): Date | null => {
    try {
      if (modDate) {
        const dateStr = modDate.decodeText();

        const year = parseInt(dateStr.substring(2, 6), 10);
        const month = parseInt(dateStr.substring(6, 8), 10) - 1;
        const day = parseInt(dateStr.substring(8, 10), 10);
        const hours = parseInt(dateStr.substring(10, 12), 10);
        const minutes = parseInt(dateStr.substring(12, 14), 10);
        const seconds = parseInt(dateStr.substring(14, 16), 10);
        const offsetSign = dateStr.charAt(16) === '-' ? -1 : 1;
        const offsetHours = parseInt(dateStr.substring(17, 19), 10);
        const offsetMinutes = parseInt(dateStr.substring(20, 22), 10);

        let utcDate = new Date(
          Date.UTC(year, month, day, hours, minutes, seconds),
        );

        const totalOffsetMinutes =
          offsetSign * (offsetHours * 60 + offsetMinutes);
        utcDate.setUTCMinutes(utcDate.getUTCMinutes() - totalOffsetMinutes);
        return utcDate;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al extraer la hora de la firma:', error);
      return null;
    }
  };

  private parseDate = (dateStr: string): Date | undefined => {
    try {
      if (dateStr) {
        const regex =
          /^\(D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})([-+])(\d{2})'?(\d{2})'\)?$/;
        const matches = dateStr.match(regex);

        if (!matches) {
          throw new Error('Formato de fecha no válido');
        }

        const year = parseInt(matches[1], 10);
        const month = parseInt(matches[2], 10) - 1;
        const day = parseInt(matches[3], 10);
        const hours = parseInt(matches[4], 10);
        const minutes = parseInt(matches[5], 10);
        const seconds = parseInt(matches[6], 10);
        const offsetSign = matches[7] === '-' ? -1 : 1;
        const offsetHours = parseInt(matches[8], 10);
        const offsetMinutes = parseInt(matches[9], 10);

        let utcDate = new Date(
          Date.UTC(year, month, day, hours, minutes, seconds),
        );

        const totalOffsetMinutes =
          offsetSign * (offsetHours * 60 + offsetMinutes);
        utcDate.setUTCMinutes(utcDate.getUTCMinutes() - totalOffsetMinutes);
        return utcDate;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error('Error al extraer la hora de la firma:', error);
      return undefined;
    }
  };

  private isSignedOnTime = (
    signedTime: Date,
    notBefore: Date,
    notAfter: Date,
  ): boolean | null => {
    try {
      if (signedTime > notBefore && signedTime < notAfter) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al extraer la hora de la firma:', error);
      return null;
    }
  };

  private extractSignatureDetails = (
    pkcs7Message: any,
  ):
    | [
        publicKeyPem: string,
        certificateObject: { [key: string]: any },
        issuer: string,
      ]
    | undefined => {
    try {
      const certificates = pkcs7Message.certificates; // certificates from PKCS7 Content
      const issuerCertificate = certificates[0];
      const userCertificate = certificates[certificates.length - 1]; // User certificates is located at last index
      const issuer = issuerCertificate.issuer.attributes.find(
        (element: any) => {
          if (element.type === '2.5.4.10') {
            return element.value;
          }
        },
      );
      const pem = forge.pki.certificateToPem(userCertificate); // Certificate PEM Format
      const publicKeyObject = userCertificate.publicKey; // Public Key Object with n and e data
      const publicKeyPem = this.getPublicKeyPEM(publicKeyObject); // Public Key Pem
      return [publicKeyPem, this.transformPEMToObjetct(pem), issuer.value];
    } catch (error) {
      console.error('Error extrayendo detalles de la firma:', error);
      return undefined;
    }
  };

  private transformPEMToObjetct = (pem: string): {} => {
    const obj: {
      [key: string]: any;
    } = {};
    const cert = forge.pki.certificateFromPem(pem);

    const oid = '1.3.6.1.4.1.37746.3.1';
    const extension = cert.extensions.find(ext => ext.id === oid);
    if (extension) obj.CI = extension.value.trim();
    else obj.CI = null;

    obj.Names = this.getCommonName(cert.subject.attributes);
    obj.CertificationAuthority = this.getCommonName(cert.issuer.attributes);
    obj.ValidFrom = cert.validity.notBefore;
    obj.ValidTo = cert.validity.notAfter;
    obj.PEM = pem.replace(/(\r\n|\n|\r)/gm, '');
    return obj;
  };

  private getCommonName = (attributes: any): string | undefined => {
    return attributes.find(
      (attr: any) => attr.name === 'commonName' || attr.shortName === 'CN',
    )?.value;
  };

  private getAnnots = (
    pdfDoc: PDFDocument,
  ): AnnotModification[] | undefined => {
    // Get annots avoiding signs
    try {
      let annotsCount: number = 0;
      let annotModifications: AnnotModification[] = [];
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const annotations = page.node.get(PDFName.of('Annots')) as PDFArray;
        if (annotations) {
          let annotsArray;
          if (annotations instanceof PDFRef)
            annotsArray = pdfDoc.context.lookup(annotations);
          else {
            annotsArray = annotations.asArray();
          }
          if (Array.isArray(annotsArray)) {
            for (const annotRef of annotsArray!) {
              const annotDict = pdfDoc.context.lookup(annotRef) as PDFDict;
              if (annotDict) {
                const subtype = annotDict
                  .get(PDFName.of('Subtype'))
                  ?.toString();
                if (subtype === '/Widget') {
                  const fieldType = annotDict.get(PDFName.of('FT'))?.toString();
                  const madeBy = annotDict.get(PDFName.of('T'))?.toString();

                  let dateString = annotDict
                    .get(PDFName.of('CreationDate'))
                    ?.toString();
                  let date: Date | undefined;
                  if (dateString) {
                    date = this.parseDate(dateString);
                  }
                  const contents = annotDict
                    .get(PDFName.of('Contents'))
                    ?.toString();

                  if (fieldType !== '/Sig') {
                    let annotMod: AnnotModification = {
                      type: subtype,
                      madeBY: madeBy,
                      contents: contents,
                      date: date,
                    };
                    annotModifications.push(annotMod);
                    annotsCount++;
                  }
                } else {
                  if (subtype !== '/Link') {
                    const madeBy = annotDict.get(PDFName.of('T'))?.toString();
                    let dateString = annotDict
                      .get(PDFName.of('CreationDate'))
                      ?.toString();
                    let date: Date | undefined;
                    if (dateString) {
                      date = this.parseDate(dateString);
                    }
                    const contents = annotDict
                      .get(PDFName.of('Contents'))
                      ?.toString();
                    let annotMod: AnnotModification = {
                      type: subtype,
                      madeBY: madeBy,
                      contents: contents,
                      date: date,
                    };
                    annotModifications.push(annotMod);
                    annotsCount++;
                  }
                }
              }
            }
          }
        }
      }
      return annotModifications;
    } catch (error) {
      return undefined;
    }
  };

  private validateCertificate = (
    signerCertificate: string,
    rootCaDir: string,
    intermediateCaDir: string,
    signedDate: Date,
  ): [IsValid: boolean, GeneralMsg: string | undefined] => {
    // Function to load all certificates in a directory
    const loadCertificatesFromDir = (directory: string): string[] => {
      const certs: string[] = [];
      const files = fs.readdirSync(directory);

      files.forEach(file => {
        const certPath = path.join(directory, file);
        const certBuffer: Buffer = fs.readFileSync(certPath);
        let certPem: string;

        if (file.endsWith('.pem')) {
          // The file is already in PEM format
          certPem = certBuffer.toString('utf8');
        } else if (file.endsWith('.cer')) {
          // Else transform it from .cer (DER) a PEM
          const asn1Cert = forge.asn1.fromDer(certBuffer.toString('binary'));
          const certObject = forge.pki.certificateFromAsn1(asn1Cert);
          certPem = forge.pki.certificateToPem(certObject);
        } else {
          // If not then ignore
          console.warn(`Archivo ignorado: ${file}`);
          return;
        }
        certs.push(certPem);
      });

      return certs;
    };

    // Load all Root CAs
    const rootCerts: string[] = loadCertificatesFromDir(rootCaDir);
    // Load all Intermediate CAs
    const intermediateCerts: string[] =
      loadCertificatesFromDir(intermediateCaDir);
    // Combine Root and Intermediate certificates
    const caCerts = [...rootCerts, ...intermediateCerts];
    // Create CA Store with all loaded certificates
    const caStore = forge.pki.createCaStore(caCerts);
    // Convert signerCertificate to PEM
    const signerCert = forge.pki.certificateFromPem(signerCertificate);
    try {
      // Validate the certificate using the CA Store and the SignerCert
      // Also change the validityCheckDate to signed date
      forge.pki.verifyCertificateChain(caStore, [signerCert], {
        validityCheckDate: signedDate,
      });
      return [true, undefined];
    } catch (error) {
      console.error('Error verificando la cadena de confianza:', error);
      return [false, error as string];
    }
  };

  private checkSignsIntegrity = (
    pdfBuffer: Buffer,
    publicKey: string,
    signbyteRange: number[],
    signContent: PDFHexString,
  ): SignDataIntegrity => {
    let hasIntegrity: boolean = true;
    let integrityMessage: string;
    let modifiedMessage: string;
    let signedData;
    let integrityDataSign: SignDataIntegrity;
    let calculatedMessageDigest;

    // Get Message Digest and Digest Algoritm from the Sign
    let [messageDigest, digestAlgorithm] = this.getMessageDigest(
      signContent,
      publicKey,
    );
    // Get the signed data without signs and calculate the message digest from it
    [signedData, calculatedMessageDigest] = this.signedDataAndCalculatedHash(
      pdfBuffer,
      signbyteRange,
      digestAlgorithm!,
    );

    /*
        Integrity means that the PDF was altered so the buffer 
        and the byteRange specified for each sign is not the same resulting in differents Message Digest
        On the other hand, Modifications can be associated to annots created in the document
        Here some examples
         * comments
         * photos
         * draws
         * etc
        
        These annots are not changing the buffer of the document keeping signs integrity ,but are also changes 
         */

    // Set Integrity Messages
    if (messageDigest !== undefined) {
      if (messageDigest !== calculatedMessageDigest) {
        hasIntegrity = false;
        let differentMessagesMsg = 'El documento contiene modificaciones';
        integrityMessage = differentMessagesMsg;
      } else {
        let sameMessageMsg = 'El documento no contiene modificaciones';
        integrityMessage = sameMessageMsg;
      }
    } else {
      let notMsgDigestValue =
        'No se logró encontrar el Message Digest correspondiente del documento';
      integrityMessage = notMsgDigestValue;
    }

    integrityDataSign = {
      hasIntegrity: hasIntegrity,
      integrityMessage: integrityMessage,
    };

    return integrityDataSign;
  };

  findPDFAnnots(pdfDoc: any) {
    let didDocChange: boolean = false;
    let generalMsg: string;
    let annots = this.getAnnots(pdfDoc);
    if (annots !== undefined) {
      if (annots.length > 0) {
        didDocChange = true;
        let annotsFoundMsg = 'El documento contiene anotaciones';
        generalMsg = annotsFoundMsg;
      } else {
        let annotsNotFoundMsg = 'El documento no contiene anotaciones';
        generalMsg = annotsNotFoundMsg;
      }
    } else {
      let errorFindingAnnots =
        'No se logró encontrar si existen anotaciones en el documento';
      generalMsg = errorFindingAnnots;
    }

    let obj: PDFDataModifications = {
      didDocChange: didDocChange,
      generalMsg: generalMsg,
      modifications: annots,
    };

    return obj;
  }

  getPublicKeyPEM(publicKeyObject: any): string {
    // Create RSA Public Key with n a e data
    const publicKey = forge.pki.setRsaPublicKey(
      publicKeyObject.n,
      publicKeyObject.e,
    );
    // Transform to PEM format
    const publicKeyPem: string = forge.pki.publicKeyToPem(publicKey);
    return publicKeyPem;
  }

  getMessageDigest = (
    signContent: PDFHexString,
    publicKey: string,
  ): [messageDigest: string | undefined, algorithmName: string | undefined] => {
    let pkcs7Container = this.getPKCS7ContainerObject(signContent); // Get the PKCS7 Content
    const digestAlgorithm = pkcs7Container!.rawCapture.digestAlgorithm; // Get the digest Algoritm
    const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm); // Find hash Algorithm by OID
    const algorithmName: string = forge.pki.oids[hashAlgorithmOid]; // Get name algoritm

    // ----------- Decode Information with ASN1.JS and Decode to readable text --------
    // 1. ----------- Auth Attributes | Signed Attributes Method -------------------------
    // Into the PKCS7 Contents
    // * Go to RawCapture
    // * Then access to authenticatedAttributes
    // * Get the value where the type es according to OID *\x86H\x86÷\r\x01\t\x04
    // This method can be use if reading the content from OpenSSL then a MessageDigest is visible
    // openssl asn1parse -in signature_1.bin -inform der
    let authAttrs = pkcs7Container.rawCapture.authenticatedAttributes;
    let messageDigest: string = '';
    try {
      if (authAttrs !== undefined) {
        authAttrs.forEach((attr: any) => {
          let oidInformation = attr.value[0].value;
          if (oidInformation === '*\x86H\x86÷\r\x01\t\x04') {
            // OID for Message Digest
            let messageDigestValue = attr.value[1].value[0];
            const messageDigestString = Buffer.from(
              messageDigestValue.value,
              'binary',
            )
              .toString('hex')
              .toUpperCase(); // Transform the message digest to hexadecimal uppercase value
            messageDigest = messageDigestString;
          }
        });
      } else {
        // 2. ----------- encapContentInfo - econtent | Content -------------------------
        // Into the PKCS7 Contents
        // * Go to RawCapture
        // * Then access to content
        // * Get the first object from value and use the object value
        // This method can be use if parsing the data you find existe econtent into encapContentInfo
        // Use another method than asn1parse with OpenSSL for visualizing data
        let encapContentInfo = pkcs7Container.rawCapture.content;
        if (encapContentInfo !== undefined) {
          let messageDigestValue = encapContentInfo.value[0];
          const messageDigestString = Buffer.from(
            messageDigestValue.value,
            'binary',
          )
            .toString('hex')
            .toUpperCase();
          messageDigest = messageDigestString;
        } else {
          // 3. ----------- General Method PKCS#1 v1.5 -------------------------
          // Into the PKCS7 Contents
          // * Get the public key and transform to PEM format
          // * Go to RawCapture
          // * Then get the signature
          // * Decrypt the signature using the public key and RSA Method
          // * Parse to ASN1 Object
          // * Then access to the second object which is an Octect String
          // * Transform it to Hex UpperCase string
          // This method can be use if the signature was made with PKCS#1 v1.5
          // Use another method than asn1parse with OpenSSL for visualizing data
          const encryptedSignatureBuffer = Buffer.from(
            pkcs7Container.rawCapture.signature,
            'binary',
          );
          const decryptedSignature: Buffer = publicDecrypt(
            {
              key: publicKey,
              padding: constants.RSA_PKCS1_PADDING,
            },
            encryptedSignatureBuffer,
          );
          const asn1 = forge.asn1.fromDer(
            decryptedSignature.toString('binary'),
          );
          const messageDigestValue = asn1.value[1] as any;
          const messageDigestString = Buffer.from(
            messageDigestValue.value,
            'binary',
          )
            .toString('hex')
            .toUpperCase();
          messageDigest = messageDigestString;
        }
      }
      return [messageDigest, algorithmName.toUpperCase()];
    } catch (error) {
      console.error(
        'No se pudo encontrar un método para encontrar el Message Digest',
      );
      return [undefined, undefined];
    }
  };

  signedDataAndCalculatedHash = (
    pdfBuffer: Buffer,
    signbyteRange: number[],
    hashAlgorithm: string,
  ): [Buffer, string] => {
    // Gets signed data using SignbyteRange and PDF Buffer
    // byteRanges helps avoiding signs bytes and getting content
    const [start1, length1, start2, length2] = signbyteRange;
    const buffer1 = pdfBuffer.subarray(start1, start1 + length1);
    const buffer2 = pdfBuffer.subarray(start2, start2 + length2);
    let signedData = Buffer.concat([buffer1, buffer2]);

    // Create calculated hash using found hashAlgorithm and transform it to hexadecimal uppercase string
    const hash = createHash(hashAlgorithm);
    hash.update(signedData);
    const calculatedHash = hash.digest('hex').toUpperCase();
    return [signedData, calculatedHash];
  };
}

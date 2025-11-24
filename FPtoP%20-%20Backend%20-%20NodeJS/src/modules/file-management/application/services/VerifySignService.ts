import * as fs from 'fs';
import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFRef,
  PDFHexString,
  PDFString,
  PDFArray,
} from 'pdf-lib';
import * as forge from 'node-forge';
interface CertInfo {
  ValidFrom?: Date;
  ValidTo?: Date;
  Cedula?: string | null;
  Nombres?: string;
  EntidadCertificadora?: string;
  PEM?: string;
}

export class VerifySignService {
  constructor() {}

  public async verifyFile(file: any) {
    const obj = { ...file };
    obj['sign'] = await this.findSignatureFields(obj.content);
    obj.content = obj.content.toString('base64');
    return obj;
  }

  findSignatureFields = async (pdfContent: any): Promise<any[]> => {
    try {
      // Asegúrate de que el contenido esté en el formato correcto
      let pdfData: Uint8Array;
      // Convertir el contenido a Uint8Array si es necesario
      if (pdfContent instanceof Uint8Array) {
        pdfData = pdfContent;
      } else if (pdfContent instanceof Buffer) {
        pdfData = new Uint8Array(
          pdfContent.buffer,
          pdfContent.byteOffset,
          pdfContent.byteLength,
        );
      } else if (
        pdfContent.type === 'Buffer' &&
        Array.isArray(pdfContent.data)
      ) {
        pdfData = new Uint8Array(pdfContent.data);
      } else {
        throw new Error('Formato de contenido no soportado');
      }

      // Cargar el contenido en un objeto PDFDocument
      const pdfDoc = await PDFDocument.load(pdfData);

      // Asegúrate de que el catálogo existe
      const catalog = pdfDoc.catalog;
      const acroForm = catalog.lookup(PDFName.of('AcroForm'), PDFDict);
      //const signatureFields: any[] = [];
      const signDetails: any = [];
      if (acroForm) {
        const fields = acroForm.lookup(PDFName.of('Fields')) as PDFRef;

        if (fields) {
          const fieldsArray = pdfDoc.context.lookup(fields) as PDFArray;
          for (const field of fieldsArray.asArray()) {
            const fieldDict = pdfDoc.context.lookup(field) as PDFDict;
            if (!fieldDict) continue;

            const kidsOrSelf = fieldDict.lookup(PDFName.of('Kids')) as PDFArray;
            const widgets = kidsOrSelf ? kidsOrSelf.asArray() : [fieldDict];

            for (const widget of widgets) {
              const widgetDict = pdfDoc.context.lookup(
                widget as PDFRef,
              ) as PDFDict;
              if (!widgetDict) continue;

              const vRef = widgetDict.get(PDFName.of('V')) as PDFRef;
              if (vRef) {
                const sigDict = pdfDoc.context.lookup(vRef) as PDFDict;
                if (sigDict) {
                  const contents = sigDict.get(PDFName.of('Contents')) as
                    | PDFHexString
                    | PDFString;
                  if (contents) {
                    const certificateDetails =
                      this.extractSignatureDetails(contents);

                    //Necesito validar que la cadena de certificacion este correcta
                    const certificateChain: string[] = [];
                    for (let n = 0; n < certificateDetails.length; n++) {
                      const certificateObtain = certificateDetails[n].detail;
                      const pemData: string = certificateObtain.PEM;
                      certificateChain.push(pemData);
                    }
                    const aux =
                      certificateDetails[certificateDetails.length - 1].detail;

                    const objAux = {
                      Cedula: aux.Cedula,
                      Nombres: aux.Nombres,
                      EntidadCertificadora: aux.EntidadCertificadora,
                      ValidFrom: aux.ValidFrom,
                      ValidTo: aux.ValidTo,
                    };
                    // //console.log(JSON.stringify(aux.pkcs7Message));

                    if (this.validateCertificateChain(certificateChain)) {
                      //Si esta correcta solo envio el ultimo registro que es el del usuario
                      signDetails.push({ estaCorrecto: true, data: objAux });
                    } else {
                      signDetails.push({ estaCorrecto: false, data: objAux });
                    }
                  }
                }
              }
            }
          }
        }
      }

      return signDetails;
    } catch (error) {
      console.error('Error loading PDF document:', error);
      return [];
    }
  };

  obtainSignDate = () => {};

  validateCertificateChain = (certChain: string[]) => {
    try {
      const certStore = forge.pki.createCaStore();

      // Agregar todos los certificados a la tienda de CA
      certChain.forEach(pem => {
        const cert = forge.pki.certificateFromPem(pem);
        certStore.addCertificate(cert);
      });

      // El último certificado en la cadena es el del usuario final
      const userCertPem = certChain[certChain.length - 1];
      const userCert = forge.pki.certificateFromPem(userCertPem);

      // Verificar la cadena de certificación
      forge.pki.verifyCertificateChain(
        certStore,
        [userCert],
        (vfd, depth, chain) => {
          if (vfd !== true) {
            throw new Error(
              'Error en la verificación de la cadena de certificación: ' + vfd,
            );
          }
          return true;
        },
      );
      //console.log('Cadena de certificación válida');
      return true;
    } catch (error) {
      console.error('Error validando la cadena de certificación:', error);
      return false;
    }
  };

  extractSignatureDetails = (sigContents: PDFHexString | PDFString): any => {
    const detailsCertificate: any = [];
    const sigValue = sigContents.asBytes();
    const hexString = this.bytesToHex(sigValue);

    let buffer: any = Buffer.from(hexString, 'hex');
    buffer = this.trimBuffer(buffer);

    ////console.log(byteArray);
    const details: any = {
      bufferLength: buffer.length,
      //bufferBinary: Buffer.from(sigValue, 'binary'),
      //bufferASCII: Buffer.from(sigValue, 'ascii')Buffer.isEncoding('ascii'),
      bufferASCII: buffer.toString(),
      bufferUTF: Buffer.isEncoding('utf8'),
      bufferUTF16: Buffer.isEncoding('utf16le'),
      bufferUTF_16: Buffer.isEncoding('hex'),
      hexString,
    };

    // Attempt PKCS#7 decoding

    //console.log('Trying PKCS#7 decoding...');
    try {
      const p7Asn1 = forge.asn1.fromDer(buffer.toString('binary'));

      // Convertir el ASN.1 a un objeto PKCS#7
      const pkcs7Message: any = forge.pkcs7.messageFromAsn1(p7Asn1);

      details.pkcs7Message = pkcs7Message;

      // //console.log('pkcs7Message.rawCapture');
      // //console.log(pkcs7Message.rawCapture);
      // //console.log('pkcs7Message.rawCapture.signerInfos');
      // //console.log(JSON.stringify(pkcs7Message.rawCapture.signerInfos));
      // //console.log('pkcs7Message.rawCapture.authenticatedAttributes');
      // //console.log(
      //   JSON.stringify(pkcs7Message.rawCapture.authenticatedAttributes),
      // );
      // pkcs7Message.rawCapture.authenticatedAttributes.forEach((attr: any) => {
      //   // Verificar si el primer valor es un OID
      //   const oid = forge.asn1.derToOid(attr.value[0].value);
      //   if (oid === forge.pki.oids.signingTime) {
      //     // El segundo valor debe ser el signingTime (GeneralizedTime)
      //     const time = attr.value[1].value;
      //     const signingTime = forge.util.createBuffer(time).getBytes();
      //     //console.log('Fecha de la firma:', signingTime);
      //   }
      // });

      // if (
      //   pkcs7Message &&
      //   pkcs7Message.contentInfo &&
      //   pkcs7Message.contentInfo.contentType === forge.pki.oids.signedData
      // ) {
      //   const signedData = pkcs7Message.content as forge.pkcs7.PkcsSignedData;
      //   const signerInfo = signedData.signerInfos[0];

      //   // Buscar el atributo signingTime
      //   const signingTimeAttr = signerInfo.authenticatedAttributes.find(
      //     attr => attr.type === forge.pki.oids.signingTime,
      //   );

      //   if (signingTimeAttr) {
      //     const signingTime = signingTimeAttr.value[0].value;
      //     return new Date(signingTime);
      //   }
      // } else {
      //   console.error('El objeto no es de tipo PkcsSignedData');
      // }

      // const signedData = pkcs7Message;
      // const signerInfo = signedData.signerInfos[0];

      // // Buscar el atributo signingTime
      // const signingTimeAttr = signerInfo.authenticatedAttributes.find(
      //   (attr: any) => attr.type === forge.pki.oids.signingTime,
      // );

      // //console.log(signingTimeAttr);
      // Obtener certificados
      const certificates = pkcs7Message.certificates;

      // Convertir certificados a formato PEM
      certificates.forEach((cert: forge.pki.Certificate) => {
        const pem = forge.pki.certificateToPem(cert);
        /**
         * Voy a tener archivos .pem que son de texto legible, a diferencia de formato binario DER
         * Estos archivos se identifican por la cabecera y pueden ser:
         *  - Certificados X.509 ---  BEGIN CERTIFICATE
         *  - Clave privada ---       BEGIN PRIVATE KEY
         *  - Clave publica ---       BEGIN PUBLIC KEY
         */
        const detailCertificate = this.transformPEMToObjetct(pem);
        detailsCertificate.push({
          detail: detailCertificate,
          pkcs7Message: pkcs7Message,
        });
      });

      return detailsCertificate;
    } catch (error: any) {
      //console.log('ERROR////////////////////////////');
      //console.log(error.message);
      details.pkcs7Decoded = false;
      details.pkcs7Error = error.message;
      return [];
    }

    ////console.log(details);
    // Attempt X.509 decoding
    // try {
    //   //console.log('Trying X.509 decoding...');
    //   const x509Cert = forge.pki.certificateFromAsn1(
    //     forge.asn1.fromDer(forge.util.createBuffer(byteArray)),
    //   );
    //   details.x509Decoded = true;

    //   const subject = x509Cert.subject.attributes;

    //   details.signature = {};

    //   subject.forEach((attr: any) => {
    //     if (attr.name === 'commonName') {
    //       details.signature.name = attr.value;
    //     } else if (attr.name === 'serialNumber') {
    //       details.signature.serialNumber = attr.value;
    //     } else if (attr.name === 'organizationName') {
    //       details.signature.organization = attr.value;
    //     }
    //   });

    //   details.signature.notBefore = x509Cert.validity.notBefore;
    //   details.signature.notAfter = x509Cert.validity.notAfter;
    // } catch (error) {
    //   details.x509Decoded = false;
    //   details.x509Error = error.message;
    // }

    // Attempt PKCS#1 decoding
    // try {
    //   //console.log('Trying PKCS#1 decoding...');
    //   const pkcs1Asn1 = forge.asn1.fromDer(forge.util.createBuffer(byteArray));
    //   const rsaSignature = forge.pki.publicKeyFromAsn1(pkcs1Asn1);

    //   details.pkcs1Decoded = true;
    //   details.signature = {
    //     modulus: rsaSignature.n.toString(16),
    //     exponent: rsaSignature.e.toString(16),
    //   };
    // } catch (error) {
    //   details.pkcs1Decoded = false;
    //   details.pkcs1Error = error.message;
    // }

    //return details;
  };

  transformPEMToObjetct = (value: string) => {
    const obj: CertInfo = {};

    // Leer el contenido del archivo PEM
    const pemContent = value;

    // Decodificar el contenido PEM usando node-forge
    const cert = forge.pki.certificateFromPem(pemContent);

    // Buscar la extensión específica por su OID manualmente - Este representa a la cedula
    // 37746 --- Representa a security data
    const oid = '1.3.6.1.4.1.37746.3.1';
    const extension = cert.extensions.find(ext => ext.id === oid);

    if (extension) {
      obj['Cedula'] = extension.value.trim();
    } else {
      obj['Cedula'] = null;
    }

    // Mostrar información del certificado
    const subject = cert.subject.attributes;
    obj['Nombres'] = this.getCommonName(subject);
    const issuer = cert.issuer.attributes;
    obj['EntidadCertificadora'] = this.getCommonName(issuer);
    obj['ValidFrom'] = cert.validity.notBefore;
    obj['ValidTo'] = cert.validity.notAfter;
    obj['PEM'] = pemContent.replace(/(\r\n|\n|\r)/gm, '');
    // Si despues necesito obtener el correo deberia sacarlo de aqui
    /*
    const sanExtension: any = cert.getExtension('subjectAltName');

    if (sanExtension) {
      sanExtension.altNames.forEach((altName: { value: any }) => {
        //console.log(JSON.stringify(altName.value));
      });
    } else {
      //console.log('No Subject Alternative Names (SANs) found.');
    }

    //console.log('El objeto final es');
    //console.log(obj);
    */
    return obj;
  };

  getCommonName(attributes: any): string | undefined {
    for (const attr of attributes) {
      if (
        (attr.name === 'commonName' || attr.shortName === 'CN') &&
        attr.value
      ) {
        return attr.value;
      }
    }
    return undefined;
  }

  bytesToHex(bytes: any) {
    // Initialize an empty array to hold the hex string parts
    const hex: Array<string> = [];

    // Loop through each byte in the Uint8Array
    for (const byte of bytes) {
      // Convert the byte to a hex string and pad with zero if necessary
      const hexByte: any = byte.toString(16).padStart(2, '0');
      // Add the hex string to the array
      hex.push(hexByte);
    }

    // Join the array into a single string and return it
    return hex.join('');
  }

  // Función para eliminar ceros al final del buffer
  trimBuffer(buffer: string | any[]) {
    let end = buffer.length;
    while (end > 0 && buffer[end - 1] === 0) {
      end--;
    }
    return buffer.slice(0, end);
  }
}

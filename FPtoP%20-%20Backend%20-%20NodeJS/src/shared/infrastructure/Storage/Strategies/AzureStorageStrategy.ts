import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
} from '@azure/storage-blob';
import { StorageStrategy } from './StorageStrategy';
import path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error('Azure Storage connection string is not defined');
}

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

let sasToken: any = null;
let sasTokenExpiry: any = null;

const accountName: string | undefined = process.env.AZURE_ACCOUNT_NAME;
const accountKey: string | undefined = process.env.AZURE_ACCOUNT_KEY; // Tu clave de cuenta de almacenamiento

export class AzureStorageStrategy implements StorageStrategy {
  // Variables para almacenar el token y la fecha de expiración
  private containerName = 'shaya';

  generateContainerSasToken = (containerName: any) => {
    if (accountName === undefined || accountKey === undefined) {
      throw new Error('No esta configurado los datos de STORAGE ACCOUNTS');
    }
    // Crear las credenciales de la cuenta de almacenamiento
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    );

    // Establecer permisos y expiración del token para todo el contenedor
    const sasOptions = {
      containerName,
      permissions: ContainerSASPermissions.parse('rl'), // Permisos de lectura (r) y listado (l)
      expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // Expiración en 1 hora
    };

    // Generar el SAS Token
    const token = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential,
    ).toString();
    const expiryDate = new Date(new Date().valueOf() + 60 * 60 * 1000); // Guardar la fecha de expiración (1 hora)

    return { token, expiryDate };
  };

  getSasToken = (containerName: any) => {
    const currentTime = new Date();

    // Si no hay un token o ha expirado, generar uno nuevo
    if (!sasToken || currentTime >= sasTokenExpiry) {
      const { token, expiryDate } =
        this.generateContainerSasToken(containerName);
      sasToken = token;
      sasTokenExpiry = expiryDate;
    }

    return sasToken;
  };

  async obtainFile(
    containerName: string,
    pathFile: string,
    idStoredFiles: number,
    fileName: string,
  ): Promise<any> {
    try {
      //Necesito obtener solo el pathDesdeAzure
      const nameBlob = pathFile.replace(
        `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/`,
        '',
      );

      const token = this.getSasToken(containerName);

      const blobServiceClient = new BlobServiceClient(
        `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net?${token}`,
      );
      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(nameBlob);

      const serverWithEspecificReadPermissions =
        process.env.SERVER_WITH_ESPECIFIC_READ_PERMISSIONS || false;

      let tempPath = __dirname;

      if (serverWithEspecificReadPermissions) {
        tempPath = '/tmp/uploadsFile';

        // Crear la carpeta si no existe
        if (!fs.existsSync(tempPath)) {
          fs.mkdirSync(tempPath, { recursive: true });
        }
      }

      const tempFilePath = path.join(
        tempPath,
        `${idStoredFiles}-${fileName}-${uuidv4()}`,
      );

      console.log('Genere el siguiente nombre');
      console.log(tempFilePath);
      // Descargar el archivo al sistema de archivos local (ruta temporal)
      await blobClient.downloadToFile(tempFilePath);
      return tempFilePath;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async uploadFile(
    containerName: string,
    file: Buffer,
    fileName: string,
  ): Promise<any> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const response = await blockBlobClient.upload(file, file.length);
    const respondeModified = {
      ...response,
      url: `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${fileName}`,
    };
    return respondeModified;
  }

  async deleteFile(containerName: string, fileName: string): Promise<void> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.delete();
  }

  obtainContainerAndNameFromPath(path: string) {
    path = path.replaceAll('"', '');
    let partToDelete = `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net/`;
    partToDelete = path.replace(partToDelete, '');
    let fileName = partToDelete.replace(this.containerName, '');
    fileName = fileName.substring(1);
    const response = {
      containerName: this.containerName,
      fileName,
    };
    return response;
  }
}

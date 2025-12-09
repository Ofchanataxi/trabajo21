import axios from 'axios';
import FormData from 'form-data';
import { GetRequiredEnvVar } from '../../../../config/environment';

export class PythonBridgeService {
  async processDocumentInPython(
    mainFile: Express.Multer.File,
    mtcFiles: Express.Multer.File[],
    bodyData: any,
  ) {
    try {
      const formData = new FormData();

      formData.append('file', mainFile.buffer, {
        filename: mainFile.originalname,
        contentType: mainFile.mimetype,
      });

      if (mtcFiles && mtcFiles.length > 0) {
        mtcFiles.forEach(mtc => {
          formData.append('mtc_files', mtc.buffer, {
            filename: mtc.originalname,
            contentType: mtc.mimetype,
          });
        });
      }

      if (bodyData) {
        Object.keys(bodyData).forEach(key => {
          formData.append(key, bodyData[key]);
        });
      }

      const pythonHost = process.env.PYTHON_API_URL || 'http://localhost:8500';
      const pythonUrl = `${pythonHost}/api/v1/extract-data`;

      console.log(`[Node Proxy] Enviando a Python: ${pythonUrl}`);
      console.log(`[Node Proxy] Archivo principal: ${mainFile.originalname}`);
      console.log(`[Node Proxy] MTCs adjuntos: ${mtcFiles.length}`);

      const response = await axios.post(pythonUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error comunicando con Python:', error.message);

      // Si Python nos devolvió un error detallado, lo lanzamos para que el Controller lo vea
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Python Error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new Error('Error al procesar el documento en el motor de IA');
    }
  }
}

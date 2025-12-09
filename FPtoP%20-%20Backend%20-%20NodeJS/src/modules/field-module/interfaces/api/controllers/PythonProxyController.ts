import { Request, Response, NextFunction } from 'express';
import { PythonBridgeService } from '../../../application/services/PythonBridgeService';

const pythonService = new PythonBridgeService();

export const processDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const mainFile = files && files['file'] ? files['file'][0] : null;

    if (!mainFile) {
      return res.status(400).json({
        message: 'No se ha subido el archivo principal (campo "file").',
      });
    }

    // 3. Extraemos los archivos MTC del array 'mtc_files' (si existen)
    const mtcFiles = files && files['mtc_files'] ? files['mtc_files'] : [];

    console.log(
      `Procesando archivo: ${mainFile.originalname} con ${mtcFiles.length} adjuntos MTC.`,
    );

    // 4. Llamamos al servicio pasando: Archivo Principal + Array MTCs + Body (release_type)
    const result = await pythonService.processDocumentInPython(
      mainFile,
      mtcFiles,
      req.body,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

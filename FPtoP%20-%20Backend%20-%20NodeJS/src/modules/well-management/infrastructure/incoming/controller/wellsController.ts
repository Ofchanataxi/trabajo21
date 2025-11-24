import { Request, Response } from 'express';
import { GetAllWells } from '../../../application/use-cases/GetAllWells';
import { WellManagementService } from '../../../application/services/WellManagementServices';

export class WellsController {
  wellManagementService;

  constructor(private getAllWells: GetAllWells) {
    this.wellManagementService = new WellManagementService();
  }

  async getWells(req: Request, res: Response) {
    try {
      const wells = await this.getAllWells.execute();
      res.json(wells);
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({ error: errorMessage });
    }
  }

  public cleanAndUppercase(input: any): any {
    if (typeof input === 'number') {
      return input;
    }
    if (typeof input !== 'string') {
      //console.log('Input must be a string');
      return '';
    }
    const response = input
      .replace(/\s+/g, '') // Elimina todos los espacios
      .toUpperCase();
    return response;
  }

  public async saveOilfieldOperationRelease(req: Request, res: Response) {
    const {
      wellName,
      longWellName,
      oilfieldTypeOperations,
      woNumber,
      worig,
      jobStartDate,
      jobEndDate,
      idBusinessLine,
      idUser,
    } = req.body;

    const cleanedWellName = this.cleanAndUppercase(wellName);
    const cleanedOilfieldTypeOperations = this.cleanAndUppercase(
      oilfieldTypeOperations,
    );
    const cleanedWoNumber = this.cleanAndUppercase(woNumber);

    try {
      const saveResponse =
        await this.wellManagementService.saveOilfieldOperationRelease(
          cleanedWellName,
          cleanedOilfieldTypeOperations,
          cleanedWoNumber,
          worig,
          longWellName, //No lo limpio porque esto puede variar
          jobStartDate,
          jobEndDate,
          idBusinessLine,
          idUser,
        );
      return res.json(saveResponse);
    } catch (error: any) {
      console.error('WellController saveOilfieldOperationRelease, error:');
      console.error(error.message);
      // Eliminar el archivo subido
      return res.status(500).json({ message: error.message });
    }
  }
}

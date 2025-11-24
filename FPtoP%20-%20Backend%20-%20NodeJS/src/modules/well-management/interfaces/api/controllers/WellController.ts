// interfaces/api/controllers/WellController.ts
import { Request, Response } from 'express';
import { GetAllWells } from '../../../application/use-cases/GetAllWells';

export class WellController {
  constructor(private getAllWells: GetAllWells) {}

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
}

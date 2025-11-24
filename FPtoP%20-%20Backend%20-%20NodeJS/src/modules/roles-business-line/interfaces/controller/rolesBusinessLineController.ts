// src/interfaces/controllers/ZipController.ts
import { Request, Response } from 'express';
import { RolesBusinessLineService } from '../../application/services/rolesBusinessLineServices';

export class RolesBusinessLineController {
  private rolesBusinessLineService: RolesBusinessLineService;

  constructor() {
    this.rolesBusinessLineService = new RolesBusinessLineService();
  }

  public async getAll(req: Request, res: Response) {
    try {
      const response = await this.rolesBusinessLineService.getAll();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

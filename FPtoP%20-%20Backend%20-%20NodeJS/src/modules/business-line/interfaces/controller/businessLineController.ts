// src/interfaces/controllers/ZipController.ts
import { Request, Response } from 'express';
import { BusinessLineService } from '../../application/services/businessLineServices';

export class BusinessLineController {
  private businessLineService: BusinessLineService;

  constructor() {
    this.businessLineService = new BusinessLineService();
  }

  public async getAll(req: Request, res: Response) {
    try {
      const response = await this.businessLineService.getAll();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const idBusinessLine: number = parseInt(req.body.idBusinessLine, 10) || 0;
      const email: string = req.body.email || '';
      const firstName: string = req.body.firstName || '';
      const lastName: string = req.body.lastName || '';
      const microsoftid: string = req.body.microsoftid || '';

      const response = await this.businessLineService.create(
        idBusinessLine,
        email,
        firstName,
        lastName,
        microsoftid,
      );
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const idBusinessLine: number | null =
        parseInt(req.body.idBusinessLine, 10) || null;
      const idUser: number | null = parseInt(req.body.idUser, 10) || null;

      if (idBusinessLine === null || idUser === null) {
        return res.status(500).json({ message: 'Datos incorrectos' });
      }

      let idStandardRolesBusinessLine = 3;
      switch (idBusinessLine) {
        case 1:
          idStandardRolesBusinessLine = 1;
          break;
        case 2:
          idStandardRolesBusinessLine = 4;
          break;
        case 3:
          idStandardRolesBusinessLine = 5;
          break;
        case 4:
          idStandardRolesBusinessLine = 6;
          break;
        case 5:
          idStandardRolesBusinessLine = 7;
          break;
        case 7:
          idStandardRolesBusinessLine = 2;
          break;

        default:
          break;
      }
      const response = await this.businessLineService.update(
        idBusinessLine,
        idUser,
        idStandardRolesBusinessLine,
      );
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

// src/interfaces/controllers/ZipController.ts
import { Request, Response } from 'express';
import { ReleaseService } from '../../application/services/releaseServices';

export class ReleaseController {
  private releaseService: ReleaseService;

  constructor() {
    this.releaseService = new ReleaseService();
  }

  public async getElementsOfRelease(req: Request, res: Response) {
    const { idRelease } = req.body;

    try {
      const response =
        await this.releaseService.obtainElementsOfRelease(idRelease);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async updateReleaseState(req: Request, res: Response) {
    const {
      idReleaseState,
      idRelease,
      idCreatedBy,
      changeReason = '',
    } = req.body;
    try {
      const response = await this.releaseService.updateReleaseState(
        idReleaseState,
        idRelease,
        idCreatedBy,
        changeReason,
      );
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getMetaDataReleasesByState(req: Request, res: Response) {
    const { idReleaseState, idBusinessLine } = req.body;
    try {
      const response = await this.releaseService.getMetaDataReleasesByState(
        idReleaseState,
        idBusinessLine,
      );
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getMetaDataActiveWells(req: Request, res: Response) {
    try {
      const response = await this.releaseService.getMetaDataActiveWells();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getReleaseData(req: Request, res: Response) {
    const { idRelease } = req.body;
    try {
      const response = await this.releaseService.getReleaseData(idRelease);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async deleteReleaseData(req: Request, res: Response) {
    const idRelease = Number(req.body.idRelease); // Convertir a número

    if (isNaN(idRelease)) {
      return res
        .status(400)
        .json({ message: 'idRelease debe ser un número válido' });
    }

    try {
      const response = await this.releaseService.deleteReleaseData(idRelease);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getReleaseHistory(req: Request, res: Response) {
    const { idRelease } = req.body;
    try {
      const response = await this.releaseService.getReleaseHistory(idRelease);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getFilesOfRelease(req: Request, res: Response) {
    const idRelease = Number(req.query.idRelease);
    try {
      const response = await this.releaseService.getFilesOfRelease(idRelease);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getFilesOfReleaseToReturn(req: Request, res: Response) {
    const idRelease = Number(req.query.idRelease);
    try {
      const response =
        await this.releaseService.getFilesOfReleaseToReturn(idRelease);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getFilesOfReleaseToDetained(req: Request, res: Response) {
    const idRelease = Number(req.query.idRelease);
    try {
      const response =
        await this.releaseService.getFilesOfReleaseToDetained(idRelease);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
  
  public async getReleases(req: Request, res: Response) {
    const idOilfieldOperations = Number(req.query.idOilfieldOperations);
    try {
      const response =
        await this.releaseService.getReleases(idOilfieldOperations);
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async getStandardCondition(req: Request, res: Response) {
    try {
      const response = await this.releaseService.getStandardCondition();
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

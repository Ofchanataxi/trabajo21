// src/modules/oil-field-operation-management/application/GetRequieredExtensionDocuments.ts
import { Request } from 'express';
import { WellDataFromFileRepository } from '../../../domain/repositories/WellDataFromFileRepository'; // Ajusta la ruta según tu estructura

export class GetRequieredExtensionDocuments {
  private idStandardElement?: number;
  private condition?: number;

  constructor(private wellDataFromFileRepo: WellDataFromFileRepository) {}

  async execute(req: Request): Promise<any> {
    const idStandardElementQuery = req.query.idStandardElement as string | undefined;
    const conditionQuery = req.query.condition as string | undefined;

    // 1. Parsear y validar idStandardElement (obligatorio)
    if (idStandardElementQuery) {
      this.idStandardElement = Number(idStandardElementQuery);
      if (isNaN(this.idStandardElement) || this.idStandardElement === 0) {
        const error = new Error('Parámetro idStandardElement inválido.');
        (error as any).statusCode = 400;
        throw error;
      }
    } else {
      const error = new Error('Parámetro requerido faltante: idStandardElement.');
      (error as any).statusCode = 400;
      throw error;
    }

    if (conditionQuery) {
      this.condition = Number(conditionQuery);
      if (isNaN(this.condition)) { 
        const error = new Error('Parámetro condition inválido.');
        (error as any).statusCode = 400;
        throw error;
      }
    }

    const repoParams: { idStandardElements: number; condition?: number } = {
      idStandardElements: this.idStandardElement!,
    };

    if (this.condition !== undefined) {
      repoParams.condition = this.condition;
    }

    return await this.wellDataFromFileRepo.GetRequieredExtensionDocuments(repoParams);
  }
}
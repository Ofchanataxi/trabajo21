// infrastructure/database/repositories/SequelizeWellRepository.ts
import { WellRepository } from '../../../domain/repositories/WellRepository';
import { Well } from '../../../domain/entities/Well';
import { WellModel } from '../models/WellModel';

export class SequelizeWellRepository implements WellRepository {
  async findAll(): Promise<Well[]> {
    const wells = await WellModel.findAll({
      order: [['joblogStartDate', 'DESC']], // Ordenar por 'JOBLOG_START_DATE' en orden descendente para obtener los más recientes
    });
    return wells.map(element => {
      const {
        itemName,
        campo,
        product,
        status,
        x,
        y,
        plataforma,
        joblogStartDate,
        engJoblogStartDate,
        joblogEndDate,
        engJoblogEndDate,
        joblogType,
        joblogWoNumber,
        joblogActivity,
        joblogWoEquip,
        longWellName,
        minId,
        chActivity,
        chRig,
        joblogStartSuspen,
        joblogEndSuspen,
        commentsDrilling,
        joblogStartRigMov,
        joblogEndRigMov,
        nextWellMov,
        targetWellMov,
        rigStarttime,
        rigEndtime,
        rig,
        rigDestiny,
        rigActivity,
        rigObs,
        xDestiny,
        yDestiny,
      } = element.dataValues;
      return new Well(
        itemName,
        campo,
        product,
        status,
        x,
        y,
        plataforma,
        joblogStartDate,
        engJoblogStartDate,
        joblogEndDate,
        engJoblogEndDate,
        joblogType,
        joblogWoNumber,
        joblogActivity,
        joblogWoEquip,
        longWellName,
        minId,
        chActivity,
        chRig,
        joblogStartSuspen,
        joblogEndSuspen,
        commentsDrilling,
        joblogStartRigMov,
        joblogEndRigMov,
        nextWellMov,
        targetWellMov,
        rigStarttime,
        rigEndtime,
        rig,
        rigDestiny,
        rigActivity,
        rigObs,
        xDestiny,
        yDestiny,
      );
    });
  }
}

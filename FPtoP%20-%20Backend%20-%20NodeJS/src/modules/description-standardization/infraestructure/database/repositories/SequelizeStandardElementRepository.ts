import { StandardElementRepository } from '../../../domain/repositories/StandardElementRepository';
import { StandardElement } from '../../../domain/entities/StandardElement';
import { StandardElementModel } from '../models/StandardElementModel'; // Modelo de Sequelize

export class SequelizeStandardElementRepository
  implements StandardElementRepository
{
  async findByBusinessLineId(
    businessLineId: number,
  ): Promise<StandardElement[]> {
    const elements = await StandardElementModel.findAll({
      where: { businessLineId },
    });
    return elements.map(element => {
      const { id, name, businessLineId, wellSectionId } = element.dataValues;
      return new StandardElement(id, name, businessLineId, wellSectionId);
    });
  }

  async findAll(): Promise<StandardElement[]> {
    const elements = await StandardElementModel.findAll();
    return elements.map(element => {
      const { id, name, businessLineId, wellSectionId } = element.dataValues;
      return new StandardElement(id, name, businessLineId, wellSectionId);
    });
  }
}

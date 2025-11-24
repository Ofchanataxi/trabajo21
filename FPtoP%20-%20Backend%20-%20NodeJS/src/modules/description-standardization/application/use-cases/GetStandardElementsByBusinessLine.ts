import { StandardElementRepository } from '../../domain/repositories/StandardElementRepository';
import { StandardElement } from '../../domain/entities/StandardElement';

export class GetStandardElementsByBusinessLine {
  constructor(private elementRepository: StandardElementRepository) {}

  async execute(businessLineId: number): Promise<StandardElement[]> {
    return this.elementRepository.findByBusinessLineId(businessLineId);
  }
  async executeAll(): Promise<StandardElement[]> {
    return this.elementRepository.findAll();
  }
}

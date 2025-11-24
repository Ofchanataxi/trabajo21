import { StandardElement } from '../entities/StandardElement';

export interface StandardElementRepository {
  findByBusinessLineId(businessLineId: number): Promise<StandardElement[]>;

  findAll(): Promise<StandardElement[]>;
}

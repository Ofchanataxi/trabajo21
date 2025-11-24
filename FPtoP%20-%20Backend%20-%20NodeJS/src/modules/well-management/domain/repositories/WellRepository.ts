// domain/repositories/WellRepository.ts
import { Well } from '../entities/Well';

export interface WellRepository {
  findAll(): Promise<Well[]>;
}

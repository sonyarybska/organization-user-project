import { EntityManager } from 'typeorm';

export interface TypeOrmConnection {
  entityManager: EntityManager
}

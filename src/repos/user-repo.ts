import { DataSource, EntityManager } from 'typeorm';
import { User } from '../types/User';
import { UserEntity } from '../services/typeorm/entities/UserEntity';
import { Reconnector } from 'src/types/Reconnector';
import { TypeOrmConnection } from 'src/types/TypeOrmConnection';
import { DBError } from 'src/types/errors/DBError';

export interface IUserRepo extends Reconnector<IUserRepo, TypeOrmConnection> {
  getUsersByOrganizationIdAndUserId(
    organizationId: string,
    userId: string,
  ): Promise<UserEntity[]>
  getById(id: string): Promise<UserEntity>
  create(user: Partial<User>): Promise<UserEntity>
  getByEmail(email: string): Promise<UserEntity>
  updateUser(id: string, userData: Partial<User>): Promise<User>
}

export function getUserRepo(db: DataSource | EntityManager): IUserRepo {
  const userRepository = db.getRepository<UserEntity>(UserEntity);

  return {
    reconnect(connection: TypeOrmConnection): IUserRepo {
      return getUserRepo(connection.entityManager);
    },
    async getUsersByOrganizationIdAndUserId(
      organizationId: string,
      userId: string
    ): Promise<UserEntity[]> {
      try {
        return await userRepository.find({
          where: { userOrganizations: { organizationId, userId } }
        });
      } catch (error) {
        throw new DBError('Failed to get users', error);
      }
    },
    async getById(id: string): Promise<UserEntity> {
      try {
        return await userRepository.findOneOrFail({
          where: { id },
          relations: ['userOrganizations', 'avatar']
        });
      } catch (error) {
        throw new DBError(`User with id ${id} not found`, error);
      }
    },

    async create(user: Partial<User>): Promise<UserEntity> {
      try {
        const result = await userRepository
          .createQueryBuilder()
          .insert()
          .values(user)
          .returning('*')
          .execute();

        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create user', error);
      }
    },

    async getByEmail(email: string): Promise<UserEntity> {
      try {
        return await userRepository.findOneOrFail({ where: { email } });
      } catch (error) {
        throw new DBError(`User with email ${email} not found`, error);
      }
    },

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
      try {
        const user = await userRepository
          .createQueryBuilder('user')
          .update()
          .set(userData as Partial<User>)
          .where('id = :id', { id })
          .returning('*')
          .execute();

        return user.raw[0];
      } catch (error) {
        throw new DBError(`Failed to update user with id ${id}`, error);
      }
    }
  };
}

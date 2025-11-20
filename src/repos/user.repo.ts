import { DataSource, EntityManager } from 'typeorm';
import { User } from 'src/types/User';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { DBError } from 'src/types/errors/DBError';

export interface IUserRepo extends Reconnector<IUserRepo, TypeOrmConnection> {
  getUsersByOrganizationId(organizationId: string): Promise<User[]>
  getById(id: string): Promise<User>
  create(user: Partial<User>): Promise<User>
  getByEmail(email: string): Promise<User | null>
  updateUser(id: string, userData: Partial<User>): Promise<User>
  getUserByCognitoUserId(cognitoUserId: string): Promise<User>
}

export function getUserRepo(db: DataSource | EntityManager): IUserRepo {
  const userRepository = db.getRepository<UserEntity>(UserEntity);

  return {
    reconnect(connection: TypeOrmConnection): IUserRepo {
      return getUserRepo(connection.entityManager);
    },
    async getUsersByOrganizationId(
      organizationId: string
    ): Promise<UserEntity[]> {
      try {
        return await userRepository.find({
          where: { userOrganizations: { organizationId } }
        });
      } catch (error) {
        throw new DBError('Failed to get users', error);
      }
    },
    async getById(id: string): Promise<User> {
      try {
        return await userRepository.findOneOrFail({
          where: { id },
          relations: ['userOrganizations', 'avatar']
        });
      } catch (error) {
        throw new DBError(`User with id ${id} not found`, error);
      }
    },

    async getUserByCognitoUserId(cognitoUserId: string): Promise<User> {
      try {
        return await userRepository.findOneOrFail({
          where: { cognitoUserId },
          relations: ['userOrganizations', 'avatar']
        });
      } catch (error) {
        throw new DBError(
          `User with Cognito User ID ${cognitoUserId} not found`,
          error
        );
      }
    },

    async create(user: Partial<User>): Promise<User> {
      try {
        const result = await userRepository
          .createQueryBuilder()
          .insert()
          .values(user as UserEntity)
          .returning('*')
          .execute();
// make sure the first element exists
        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create user', error);
      }
    },

    async getByEmail(email: string): Promise<User | null> {
      try {
        return await userRepository.findOne({ where: { email } });
      } catch (error) {
        throw new DBError(`User with email ${email} not found`, error);
      }
    },

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
      try {
        const user = await userRepository
          .createQueryBuilder('user')
          .update()
          .set(userData as Partial<UserEntity>)
          .where('id = :id', { id })
          .returning('*')
          .execute();
        // make sure the first element exists

        return user.raw[0];
      } catch (error) {
        throw new DBError(`Failed to update user with id ${id}`, error);
      }
    }
  };
}

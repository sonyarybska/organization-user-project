import {  QueryRunner, IsNull } from 'typeorm';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';

const client = new CognitoIdentityProvider({
  region: process.env.AWS_REGION
});

export async function migrateUsers(queryRunner: QueryRunner) {
  const userRepo = queryRunner.manager.getRepository(UserEntity);
  const users = await userRepo.find({ where: { cognitoUserId: IsNull() } });

  for (const user of users) {
    try {
      const result = await client.adminCreateUser({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: user.email,
        UserAttributes: [
          { Name: 'email', Value: user.email },
          { Name: 'email_verified', Value: (user as any).isConfirm ? 'true' : 'false' }
        ]
      });

      const sub = result.User?.Attributes?.find(a => a.Name === 'sub')?.Value;

      if (!sub) {throw new Error('No sub returned');}

      user.cognitoUserId = sub;
      await userRepo.save(user);
    } catch (err) {
      console.error('Error migrating user', user.email, err);
    }
  }
}
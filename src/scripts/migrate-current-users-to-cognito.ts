/* eslint-disable no-console */
import 'reflect-metadata';
import 'src/services/env/env.service';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { IsNull } from 'typeorm';

const client = new CognitoIdentityProvider({
  region: process.env.AWS_REGION
});

async function migrateUsers() {
  const db = await getDb({
    host: process.env.PGHOST || '',
    port: parseInt(process.env.PGPORT || '5432'),
    dbName: process.env.PGDATABASE || '',
    user: process.env.PGUSERNAME || '',
    password: process.env.PGPASSWORD || ''
  });

  const userRepo = db.getRepository<UserEntity>(UserEntity);

  const users = await userRepo.find({ where: { cognitoUserId: IsNull() } });

  for (const user of users) {
    try {
      const result = await client.adminCreateUser({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: user.email,
        UserAttributes: [
          { Name: 'email', Value: user.email },
          { Name: 'email_verified', Value: user.isConfirm ? 'true' : 'false' }
        ]
      });

      const sub = result.User?.Attributes?.find((a) => a.Name === 'sub')?.Value;

      if (!sub) {
        throw new Error('No sub returned');
      }

      user.cognitoUserId = sub;

      await userRepo.save(user);
    } catch (err) {
      console.error('Error migrating user', user.email, err);
    }
  }

  await db.destroy();
  console.log('Migration complete');
}

migrateUsers();

import fastify, { FastifyInstance } from 'fastify';
import autoload from '@fastify/autoload';
import cookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { join } from 'path';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import { DataSource } from 'typeorm';
import { getRepos } from 'src/repos';
import { getTypeOrmTransactionService } from 'src/services/typeorm/typeorm-transaction.service';
import { errorHandler } from 'src/api/errors/error.handler';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { mockSendGridService } from 'src/tests/mocks/services/send-grid.service.mock';
import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { mockSqsService } from 'src/tests/mocks/services/sqs.service.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';

export async function buildTestApp(db: DataSource): Promise<FastifyInstance> {
  const app = fastify({ logger: false });

  app.setErrorHandler(errorHandler);
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Test API',
        version: '0.0.0'
      },
      servers: []
    },
    transform: jsonSchemaTransform
  });

  await app.register(cookie, {});
  await app.register(fastifyMultipart);

  app.decorate('db', db);
  app.decorate('transactionService', getTypeOrmTransactionService(db));
  app.decorate('repos', getRepos(db));

  app.decorate('cognitoService', mockCognitoService);
  app.decorate('sendGridService', mockSendGridService);
  app.decorate('s3Service', mockS3Service);
  app.decorate('sqsService', mockSqsService);
  app.decorate('hmacService', mockHmacService);

  await app.register(autoload, {
    dir: join(__dirname, '../../../api/routes'),
    options: { prefix: '/api' },
    ignoreFilter: 'schemas',
    autoHooks: true,
    cascadeHooks: true
  });

  await app.ready();
  return app;
}

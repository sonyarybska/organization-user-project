import 'src/services/env/env.service';
import fastify, { FastifyInstance } from 'fastify';
import autoload from '@fastify/autoload';
import cookie from '@fastify/cookie';
import { join } from 'path';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { getRepos } from 'src/repos';
import { getSendGridService } from 'src/services/send-grid/send-grid.service';
import { getTypeOrmTransactionService } from 'src/services/typeorm/typeorm-transaction.service';
import { errorHandler } from './errors/error.handler';
import { getAwsS3Service } from 'src/services/aws/s3/s3.service';
import fastifyMultipart from '@fastify/multipart';
import { getAwsCognitoService } from 'src/services/aws/cognito/cognito.service';
import { getAwsSqsService } from 'src/services/aws/sqs/sqs.service';
import { getHMACService } from 'src/services/hmac/hmac.service';

const server = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard'
      }
    }
  }
});

function setupSwagger(server: FastifyInstance) {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'User Management API',
        description: 'API for managing users and organizations',
        version: '1.0.0'
      },
      servers: [],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      }
    },
    transform: jsonSchemaTransform
  });
  server.register(fastifySwaggerUi, {
    routePrefix: '/api/documentation'
  });
}

const start = async () => {
  server.setErrorHandler(errorHandler);

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  setupSwagger(server);
  try {
    server.register(cookie, {});

    await server.register(fastifyMultipart);

    server.decorate(
      'db',
      await getDb({
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT),
        dbName: process.env.PGDATABASE,
        user: process.env.PGUSERNAME,
        password: process.env.PGPASSWORD
      })
    );

    server.decorate(
      'transactionService',
      getTypeOrmTransactionService(server.db)
    );

    server.decorate(
      'sendGridService',
      getSendGridService(process.env.SENDGRID_API_KEY)
    );

    server.decorate('s3Service', getAwsS3Service(process.env.AWS_REGION));

    server.decorate('sqsService', getAwsSqsService(process.env.AWS_REGION));

    server.decorate('hmacService', getHMACService());

    server.decorate(
      'cognitoService',
      getAwsCognitoService(process.env.AWS_REGION)
    );

    server.decorate('repos', getRepos(server.db));

    server.register(autoload, {
      dir: join(__dirname, 'routes'),
      options: { prefix: '/api' },
      ignoreFilter: 'schemas',
      autoHooks: true,
      cascadeHooks: true
    });

    await server.ready();
    await server.listen({
      port: Number(process.env.PORT)
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

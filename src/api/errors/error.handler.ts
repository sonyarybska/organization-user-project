import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpError } from './HttpError';
import util from 'util';
import { ApplicationError } from 'src/types/errors/ApplicationError';

const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler = function (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  let errorCode = 0;
  let statusCode = 400;
  let message = 'Bad Request';

  if (error instanceof HttpError) {
    if (error.errorCode) {
      errorCode = error.errorCode;
    }

    statusCode = error.statusCode;
    message = error.message;
  }

  if (error instanceof ApplicationError) {
    if (error.errorCode) {
      errorCode = error.errorCode;
    }

    message = error.message;
  }

  if ('statusCode' in error) {
    statusCode = error.statusCode as number;
  }

  return reply.status(statusCode).send({
    code: errorCode,
    message,
    ...(isProduction ? {} : { info: util.inspect(error) })
  });
};

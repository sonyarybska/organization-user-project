import { ErrorCode } from '../enums/ErrorCodes';
import { ApplicationError } from './ApplicationError';

export class DBDuplicateError extends ApplicationError {
  constructor(entity: string, cause?: Error, errorCode?: ErrorCode) {
    super(`Duplicate in ${entity}`, cause, errorCode);
  }
}

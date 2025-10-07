
import {  ErrorCode } from 'src/types/enums/ErrorCodesEnum';
import { ApplicationError } from './ApplicationError';

export class DBDuplicateError extends ApplicationError {
  constructor(entity: string, cause?: Error, errorCode?: ErrorCode) {
    super(`Duplicate in ${entity}`, cause, errorCode);
  }
}

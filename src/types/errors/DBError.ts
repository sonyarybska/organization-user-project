import { ApplicationError } from './ApplicationError';

export class DBError extends ApplicationError {
  constructor(message: string, cause?: Error | unknown) {
    super(message, cause);
  }
}

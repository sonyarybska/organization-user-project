export class ApplicationError extends Error {
  constructor(
    readonly message: string,
    readonly cause?: Error | unknown,
    readonly errorCode?: number
  ) {
    super(message);
  }
}

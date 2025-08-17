export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    readonly message: string,
    readonly cause?: Error | unknown,
    readonly errorCode?: number
  ) {
    super(message);
  }
}

type RunCallback<T, C> = (connectionManager: C) => Promise<T>

export interface TransactionService<C> {
  run<T>(cb: RunCallback<T, C>): Promise<T>
}

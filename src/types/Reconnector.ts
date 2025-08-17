export interface Reconnector<T, C> {
  reconnect(conn: C): T
}

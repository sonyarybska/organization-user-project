import { Environment } from './Environment';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Environment {}
  }
}

export {};

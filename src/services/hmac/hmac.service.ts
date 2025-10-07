import { createHmac } from 'crypto';

export interface IHMACService {
  getSignature(hmacStr: string, hmacSecret: string): string
  validateToken(
    token: string,
    hmacStr: string,
    expireInMillis: number,
    hmacSecret: string,
  ): boolean
}

export function getHMACService(): IHMACService {
  return {
    getSignature(hmacStr: string, hmacSecret: string): string {
      const hmac = createHmac('sha256', hmacSecret);
      hmac.update(hmacStr);
      const signature = hmac.digest('base64url');

      return signature;
    },

    validateToken(
      token: string,
      hmacStr: string,
      expireInMillis: number,
      hmacSecret: string
    ): boolean {
      if (Date.now() > expireInMillis) {
        return false;
      }
      const recomputedToken = this.getSignature(hmacStr, hmacSecret);

      return token === recomputedToken;
    }
  };
}

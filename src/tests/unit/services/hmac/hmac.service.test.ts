import { getHMACService } from 'src/services/hmac/hmac.service';

describe('getHMACService', () => {
  describe('getSignature', () => {
    it('should return base64url signature', () => {
      const hmacService = getHMACService();

      const signature = hmacService.getSignature('message', 'secret');

      expect(signature).toBe('i19IcCmVwVmMVz2x4hhmqbgl1KeU0WnXBgoDYFeWNgs');
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token and non-expired timestamp', () => {
      const hmacService = getHMACService();

      const hmacStr = 'message';
      const hmacSecret = 'secret';
      const token = hmacService.getSignature(hmacStr, hmacSecret);

      jest.spyOn(Date, 'now').mockReturnValue(1000);

      const result = hmacService.validateToken(token, hmacStr, 2000, hmacSecret);

      expect(result).toBe(true);
    });

    it('should return false when expired', () => {
      const hmacService = getHMACService();

      jest.spyOn(Date, 'now').mockReturnValue(2001);

      const result = hmacService.validateToken('any', 'message', 2000, 'secret');

      expect(result).toBe(false);
    });

    it('should return false for mismatched token', () => {
      const hmacService = getHMACService();

      jest.spyOn(Date, 'now').mockReturnValue(1000);

      const result = hmacService.validateToken('wrong', 'message', 2000, 'secret');

      expect(result).toBe(false);
    });

    it('should treat expireInMillis equal to now as not expired', () => {
      const hmacService = getHMACService();

      const hmacStr = 'message';
      const hmacSecret = 'secret';
      const token = hmacService.getSignature(hmacStr, hmacSecret);

      jest.spyOn(Date, 'now').mockReturnValue(2000);

      const result = hmacService.validateToken(token, hmacStr, 2000, hmacSecret);

      expect(result).toBe(true);
    });
  });
});

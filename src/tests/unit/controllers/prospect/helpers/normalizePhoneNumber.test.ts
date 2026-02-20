import { normalizePhoneNumber } from 'src/api/helpers/normalizePhoneNumber';

describe('normalizePhoneNumber', () => {
  it('should return null for null input', () => {
    expect(normalizePhoneNumber(null)).toBe(null);
  });

  it('should return null for undefined input', () => {
    expect(normalizePhoneNumber(undefined)).toBe(null);
  });

  it('should return null for empty or whitespace-only string', () => {
    expect(normalizePhoneNumber('')).toBe(null);
    expect(normalizePhoneNumber('   ')).toBe(null);
  });

  it('should normalize E.164-like input with plus and punctuation', () => {
    expect(normalizePhoneNumber('+1 (234) 567-890')).toBe('+1234567890');
    expect(normalizePhoneNumber('+(380) 50-123-45-67')).toBe('+380501234567');
  });

  it('should remove formatting characters for numbers without plus', () => {
    expect(normalizePhoneNumber('(123) 456-7890')).toBe('1234567890');
    expect(normalizePhoneNumber('12+34+5678')).toBe('12345678');
  });

  it('should collapse multiple leading plus signs into a single plus', () => {
    expect(normalizePhoneNumber('++380501234567')).toBe('+380501234567');
    expect(normalizePhoneNumber('+++12345678')).toBe('+12345678');
  });

  it('should return null for numbers that are too short or too long', () => {
    expect(normalizePhoneNumber('1234567')).toBe(null);
    expect(normalizePhoneNumber('1234567890123456')).toBe(null);
  });
});

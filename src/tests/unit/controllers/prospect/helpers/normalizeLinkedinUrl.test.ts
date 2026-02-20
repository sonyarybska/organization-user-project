import { normalizeLinkedinUrl } from 'src/api/helpers/normalizeLinkedinUrl';

describe('normalizeLinkedinUrl', () => {
  it('should return null for null input', () => {
    expect(normalizeLinkedinUrl(null)).toBe(null);
  });

  it('should return null for undefined input', () => {
    expect(normalizeLinkedinUrl(undefined)).toBe(null);
  });

  it('should return null for empty string', () => {
    expect(normalizeLinkedinUrl('')).toBe(null);
    expect(normalizeLinkedinUrl('   ')).toBe(null);
  });

  it('should remove https:// protocol', () => {
    expect(normalizeLinkedinUrl('https://linkedin.com/in/john')).toBe('linkedin.com/in/john');
  });

  it('should remove http:// protocol', () => {
    expect(normalizeLinkedinUrl('http://linkedin.com/in/john')).toBe('linkedin.com/in/john');
  });

  it('should remove www prefix', () => {
    expect(normalizeLinkedinUrl('https://www.linkedin.com/in/john')).toBe('linkedin.com/in/john');
  });

  it('should remove trailing slash', () => {
    expect(normalizeLinkedinUrl('https://linkedin.com/in/john/')).toBe('linkedin.com/in/john');
  });

  it('should handle full URL normalization', () => {
    expect(normalizeLinkedinUrl('https://www.linkedin.com/in/marr/')).toBe('linkedin.com/in/marr');
  });

  it('should handle already normalized URL', () => {
    expect(normalizeLinkedinUrl('linkedin.com/in/john')).toBe('linkedin.com/in/john');
  });
});

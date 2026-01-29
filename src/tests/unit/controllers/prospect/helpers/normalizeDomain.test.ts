import { normalizeDomain } from 'src/controllers/prospect/helpers/normalizeDomain';

describe('normalizeDomain', () => {
  it('should extract domain from https URL', () => {
    expect(normalizeDomain('https://www.example.com')).toBe('example.com');
  });

  it('should extract domain from http URL', () => {
    expect(normalizeDomain('http://www.example.com')).toBe('example.com');
  });

  it('should remove www prefix', () => {
    expect(normalizeDomain('www.example.com')).toBe('example.com');
  });

  it('should extract domain from URL with path', () => {
    expect(normalizeDomain('https://example.com/path/to/page')).toBe('example.com');
  });

  it('should extract domain from URL with query parameters', () => {
    expect(normalizeDomain('https://example.com?query=param')).toBe('example.com');
  });

  it('should handle subdomain correctly', () => {
    expect(normalizeDomain('https://subdomain.example.com')).toBe('example.com');
  });

  it('should convert to lowercase', () => {
    expect(normalizeDomain('HTTPS://WWW.EXAMPLE.COM')).toBe('example.com');
  });

  it('should trim whitespace', () => {
    expect(normalizeDomain('  https://www.example.com  ')).toBe('example.com');
  });

  it('should handle domain without protocol', () => {
    expect(normalizeDomain('example.com')).toBe('example.com');
  });

  it('should handle IP addresses', () => {
    expect(normalizeDomain('192.168.1.1')).toBe('192.168.1.1');
  });

  it('should handle domains with ports', () => {
    expect(normalizeDomain('https://example.com:8080')).toBe('example.com');
  });

  it('should handle complex URLs', () => {
    expect(normalizeDomain('https://www.example.com:8080/path?query=1#hash')).toBe('example.com');
  });

  it('should handle URL with multiple subdomains', () => {
    expect(normalizeDomain('https://api.staging.example.com')).toBe('example.com');
  });
});

import { parse } from 'tldts';

export function normalizeDomain(url: string): string {
  const trimmed = url.trim().toLowerCase();

  const parsed = parse(trimmed);

  // Handle IP addresses
  if (parsed.isIp) {
    return parsed.hostname!;
  }

  // Extract domain if successfully parsed
  if (parsed.domain) {
    return parsed.domain;
  }

  // Manual extraction if parsing failed
  return trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0];
}

export function normalizeLinkedinUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  // Remove protocol and www prefix
  let normalized = trimmed.replace(/^https?:\/\//, '').replace(/^www\./, '');

  // Check if the normalized URL still contains 'linkedin.com'
  if (!normalized.includes('linkedin.com')) {
    return null;
  }

  // Remove trailing slash and query params
  normalized = normalized.split('?')[0].replace(/\/$/, '');

  return normalized;
}

export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) {
    return null;
  }

  const trimmed = phone.trim();

  if (!trimmed) {
    return null;
  }

  // Keep only digits and '+' symbols
  let normalized = trimmed.replace(/[^\d+]/g, '');

  // Keep only one leading '+' if present, remove all other '+' symbols
  if (normalized.startsWith('+')) {
    normalized = '+' + normalized.slice(1).replace(/\+/g, '');
  } else {
    // Remove all '+' symbols for domestic format numbers
    normalized = normalized.replace(/\+/g, '');
  }

  // Validate phone number length (8-15 digits)
  const digitsOnly = normalized.replace(/\D/g, '');

  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return null;
  }

  return normalized;
}

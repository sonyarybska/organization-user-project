import { parse } from 'tldts';

export function normalizeLinkedinUrl(
  url: string | null | undefined
): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim().toLowerCase();
  
  if (!trimmed) {
    return null;
  }

  const parsed = parse(trimmed);

  const hostname = parsed.hostname?.replace(/^www\./, '') || '';

  const path = trimmed.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const normalized = hostname ? path : path;

  return normalized.replace(/\/$/, '');
}

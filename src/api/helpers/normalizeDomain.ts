import { parse } from 'tldts';

export function normalizeDomain(url: string): string {
  const trimmed = url.trim().toLowerCase();

  const parsed = parse(trimmed);

  if (parsed.isIp) {
    return parsed.hostname!;
  }

  if (parsed.domain) {
    return parsed.domain;
  }

  return trimmed.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
}
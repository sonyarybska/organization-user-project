export function normalizePhoneNumber(
  phone: string | null | undefined
): string | null {
  if (!phone) {
    return null;
  }

  const trimmed = phone.trim();

  if (!trimmed) {
    return null;
  }

  let normalized = trimmed.replace(/[^\d+]/g, '');

  if (normalized.startsWith('+')) {
    normalized = '+' + normalized.slice(1).replace(/\+/g, '');
  } else {
    normalized = normalized.replace(/\+/g, '');
  }

  const digitsOnly = normalized.replace(/\D/g, '');

  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return null;
  }

  return normalized;
}
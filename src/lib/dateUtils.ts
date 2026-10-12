/**
 * FilmOpener Date Utilities
 * Standardizes film expiration date formatting to Year and Month (YYYY-MM).
 * Prevents 6-digit year bugs and formats compact YY.MM for shelf displays.
 */

/**
 * Format raw expiry string to compact YY.MM for shelf plaques and badges.
 * Examples:
 *   - '2026-08' -> '26.08'
 *   - '2026-08-15' -> '26.08'
 *   - '1998-05' -> '98.05'
 *   - '202600-08' (6-digit bug) -> '26.08'
 *   - '유통기한 미상 (로리/싱싱)' -> '미상'
 */
export function formatExpiryYYMM(rawExpiry?: string): string {
  if (!rawExpiry) return '미기재';
  const trimmed = rawExpiry.trim();

  if (trimmed.includes('미상')) {
    return '미상';
  }

  // Handle YYYY-MM-DD or YYYY-MM or YYYY.MM or 6-digit years like 202600-08
  const match = trimmed.match(/^(\+?\d+)[-./](\d{1,2})/);
  if (match) {
    const rawYear = match[1].replace(/\D/g, '');
    // Take last 2 digits for YY
    const yy = rawYear.length >= 2 ? rawYear.slice(-2) : rawYear.padStart(2, '0');
    const mm = match[2].padStart(2, '0').slice(0, 2);
    return `${yy}.${mm}`;
  }

  // If already like YY.MM or YY-MM
  const shortMatch = trimmed.match(/^(\d{2})[-./](\d{1,2})$/);
  if (shortMatch) {
    return `${shortMatch[1]}.${shortMatch[2].padStart(2, '0')}`;
  }

  return trimmed;
}

/**
 * Sanitizes any raw expiry input to standard YYYY-MM.
 * Strictly prevents 6-digit year by slicing to 4 digits.
 */
export function sanitizeExpiryDate(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  if (trimmed.startsWith('유통기한') || trimmed.includes('미상')) {
    return trimmed;
  }

  const match = trimmed.match(/^(\+?\d+)[-./](\d{1,2})/);
  if (match) {
    let year = match[1].replace(/\D/g, '');
    if (year.length > 4) {
      year = year.slice(0, 4); // Clamp to 4 digits!
    }
    const month = match[2].padStart(2, '0').slice(0, 2);
    return `${year}-${month}`;
  }

  return trimmed;
}

/**
 * Parses YYYY and MM from an expiry string for controlled form inputs.
 * Strictly enforces max 4-digit year.
 */
export function parseYearAndMonth(expiry?: string): { year: string; month: string } {
  if (!expiry) return { year: '', month: '' };
  const trimmed = expiry.trim();

  if (trimmed.startsWith('유통기한') || trimmed.includes('미상')) {
    return { year: '', month: '' };
  }

  const match = trimmed.match(/^(\+?\d+)[-./](\d{1,2})/);
  if (match) {
    let year = match[1].replace(/\D/g, '');
    if (year.length > 4) {
      year = year.slice(0, 4);
    }
    const month = match[2].padStart(2, '0').slice(0, 2);
    return { year, month };
  }

  return { year: '', month: '' };
}

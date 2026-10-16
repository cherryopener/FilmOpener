/**
 * FilmOpener Date Utilities
 * Standardizes film expiration date formatting to Year and Month (YYYY-MM).
 * Prevents 6-digit year bugs and formats compact YY.MM for shelf displays.
 */

import { FilmItem, FreshnessStatus } from '@/types';

/**
 * Determines whether a film's expiry date is unknown (미상/미기재/empty).
 */
export function isUnknownExpiry(rawExpiry?: string): boolean {
  if (!rawExpiry) return true;
  const trimmed = rawExpiry.trim();
  if (
    trimmed === '' ||
    trimmed.includes('미상') ||
    trimmed.includes('미기재') ||
    !/^\d{4}/.test(trimmed)
  ) {
    return true;
  }
  return false;
}

/**
 * Normalizes a known expiry date to YYYY-MM-DD for reliable chronological comparison.
 * Handles 2-digit years, YYYY-MM, YYYY.MM, and YYYY-MM-DD.
 */
export function normalizeExpiryForComparison(rawExpiry?: string): string {
  if (isUnknownExpiry(rawExpiry)) return '';
  const trimmed = rawExpiry!.trim();
  const match = trimmed.match(/^(\+?\d+)[-./](\d{1,2})(?:[-./](\d{1,2}))?/);
  if (match) {
    let year = match[1].replace(/\D/g, '');
    if (year.length === 2) {
      const numYear = parseInt(year, 10);
      year = numYear >= 50 ? `19${year}` : `20${year}`;
    } else if (year.length > 4) {
      year = year.slice(0, 4);
    } else {
      year = year.padStart(4, '0');
    }
    const month = match[2].padStart(2, '0').slice(0, 2);
    const day = match[3] ? match[3].padStart(2, '0').slice(0, 2) : '01';
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

/**
 * Classifies a film into freshness category:
 * - 'fresh' (로리 / 싱싱함)
 * - 'expired' (노괴 / 썩필)
 * - 'deep_expired' (틀딱 / 푹썩필)
 *
 * Checks explicit freshness_status first, then keyword mentions in expiry_date,
 * then expiration flag and date comparison.
 */
export function getFilmFreshness(f: FilmItem): FreshnessStatus {
  // 1. Deep expired check (틀딱)
  if (
    f.freshness_status === 'deep_expired' ||
    (f.expiry_date && f.expiry_date.includes('틀딱'))
  ) {
    return 'deep_expired';
  }

  // 2. Explicit fresh check (로리)
  if (
    f.freshness_status === 'fresh' ||
    (f.expiry_date && f.expiry_date.includes('로리'))
  ) {
    return 'fresh';
  }

  // 3. Explicit expired check (노괴)
  if (
    f.freshness_status === 'expired' ||
    (f.expiry_date && f.expiry_date.includes('노괴'))
  ) {
    return 'expired';
  }

  // 4. is_expired flag
  if (f.is_expired) {
    return 'expired';
  }

  // 5. If date is known, check against today's date
  if (f.expiry_date && !isUnknownExpiry(f.expiry_date)) {
    const norm = normalizeExpiryForComparison(f.expiry_date);
    const todayStr = new Date().toISOString().split('T')[0];
    if (norm && norm < todayStr) {
      return 'expired';
    }
  }

  // 6. Default fallback is fresh (로리)
  return 'fresh';
}

/**
 * Compares two films for "유통기한 임박순" (impending expiry order).
 *
 * Rules:
 * 1. 로리(fresh) -> 노괴(expired) -> 틀딱(deep_expired) 순으로 1차 정렬.
 *    (미상인 필름도 로리, 노괴, 틀딱 중 무엇인지 먼저 판별하여 해당 그룹에 배치)
 * 2. 동일 그룹 내에서는 유통기한 임박순(오름차순)으로 정렬.
 *    이때 유통기한이 미상인 것은 유통기한을 알고 있는 것보다 더 싱싱한 것으로 간주하므로,
 *    유통기한을 알고 있는 필름들(임박순) 뒤에 배치됨.
 * 3. 동일 순위 시 필름 이름 가나다순.
 * 4. 소진된 필름(수량 <= 0)은 맨 뒤로 배치.
 */
export function compareFilmExpiry(a: FilmItem, b: FilmItem): number {
  // 0. 소진된 필름 (보유 수량 0 이하)은 항상 맨 뒤로 배치
  const aExhausted = (a.quantity ?? 0) <= 0;
  const bExhausted = (b.quantity ?? 0) <= 0;
  if (aExhausted !== bExhausted) {
    return aExhausted ? 1 : -1;
  }

  // 1. 로리 / 노괴 / 틀딱 순서로 먼저 정렬
  // 로리: 1 (싱싱함), 노괴: 2 (썩필), 틀딱: 3 (푹썩필)
  const freshnessOrder: Record<FreshnessStatus, number> = {
    fresh: 1,
    expired: 2,
    deep_expired: 3,
  };

  const freshA = getFilmFreshness(a);
  const freshB = getFilmFreshness(b);

  const rankA = freshnessOrder[freshA] || 2;
  const rankB = freshnessOrder[freshB] || 2;

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // 2. 같은 카테고리 내에서는 유통기한 순으로 정렬
  // "이때 유통기한이 미상인 것은 유통기한을 알고 있는 것보다 더 싱싱한 것으로 간주한다."
  const aUnknown = isUnknownExpiry(a.expiry_date);
  const bUnknown = isUnknownExpiry(b.expiry_date);

  // 미상인 것은 유통기한을 알고 있는 것보다 더 싱싱함 (즉 유통기한 여유가 더 많음)
  // 유통기한 임박순(오름차순) 정렬에서는 더 싱싱한 것(미상)이 유통기한을 알고 있는 것 뒤에 위치함
  if (aUnknown && !bUnknown) {
    return 1;
  }
  if (!aUnknown && bUnknown) {
    return -1;
  }

  // 둘 다 유통기한을 알고 있는 경우: 날짜 오름차순 (임박한 빠른 날짜 우선)
  if (!aUnknown && !bUnknown) {
    const normA = normalizeExpiryForComparison(a.expiry_date);
    const normB = normalizeExpiryForComparison(b.expiry_date);
    const dateComp = normA.localeCompare(normB);
    if (dateComp !== 0) {
      return dateComp;
    }
  }

  // 3. 유통기한 동일하거나 둘 다 미상인 경우: 필름 이름 가나다순
  const nameComp = (a.name || '').localeCompare(b.name || '', 'ko-KR');
  if (nameComp !== 0) {
    return nameComp;
  }

  return (a.brand || '').localeCompare(b.brand || '', 'ko-KR');
}

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

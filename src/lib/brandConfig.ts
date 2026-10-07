export interface BrandTheme {
  name: string;
  primaryColor: string;       // 대표 색상 1 (메인)
  secondaryColor: string;     // 대표 색상 2 (보조/포인트)
  textColor: string;          // 텍스트 색상
  accentBg: string;           // 카드 상단/뱃지 배경 투명도
  borderColor: string;        // 테두리 강조 색상
  logoUrl: string;            // 로고 이미지 경로
}

export const BRAND_CONFIGS: Record<string, BrandTheme> = {
  kodak: {
    name: 'Kodak',
    primaryColor: '#FFB700',   // Kodak Official Yellow (Pantone 1235 C)
    secondaryColor: '#ED0000', // Kodak Official Red (Pantone 485 C)
    textColor: '#1a1000',
    accentBg: 'rgba(255, 183, 0, 0.12)',
    borderColor: 'rgba(255, 183, 0, 0.4)',
    logoUrl: '/logos/kodak_logo.png',
  },
  fujifilm: {
    name: 'Fujifilm',
    primaryColor: '#01916D',   // Fujifilm Official Advanced Green
    secondaryColor: '#EE1337', // Fujifilm Sporty Red
    textColor: '#ffffff',
    accentBg: 'rgba(1, 145, 109, 0.14)',
    borderColor: 'rgba(1, 145, 109, 0.45)',
    logoUrl: '/logos/fuji_logo.png',
  },
  agfa: {
    name: 'Agfa',
    primaryColor: '#CF2E2E',   // Agfa Persian Red
    secondaryColor: '#FF4611', // Agfa Bright Orange-Red
    textColor: '#ffffff',
    accentBg: 'rgba(207, 46, 46, 0.14)',
    borderColor: 'rgba(207, 46, 46, 0.45)',
    logoUrl: '/logos/agfa_logo.png',
  },
  ilford: {
    name: 'Ilford',
    primaryColor: '#1A1A1A',   // Ilford Classic Monochrome
    secondaryColor: '#D0021B', // Ilford Signature Red Accent
    textColor: '#ffffff',
    accentBg: 'rgba(26, 26, 26, 0.25)',
    borderColor: 'rgba(208, 2, 27, 0.4)',
    logoUrl: '/logos/ilford_logo.png',
  },
  cinestill: {
    name: 'CineStill',
    primaryColor: '#00A8B5',   // Cine Cyan / Teal
    secondaryColor: '#FF2E4C', // Halation Neon Red
    textColor: '#ffffff',
    accentBg: 'rgba(0, 168, 181, 0.14)',
    borderColor: 'rgba(0, 168, 181, 0.45)',
    logoUrl: '/logos/cinestill_logo.png',
  },
  lomography: {
    name: 'Lomography',
    primaryColor: '#E60067',   // Lomo Electric Magenta Pink
    secondaryColor: '#00B4D8', // Lomo Turquoise
    textColor: '#ffffff',
    accentBg: 'rgba(230, 0, 103, 0.14)',
    borderColor: 'rgba(230, 0, 103, 0.45)',
    logoUrl: '/logos/lomography_logo.png',
  },
  foma: {
    name: 'Foma',
    primaryColor: '#0D3B66',   // Fomapan Navy Blue
    secondaryColor: '#64B5F6', // Ice Blue
    textColor: '#ffffff',
    accentBg: 'rgba(13, 59, 102, 0.18)',
    borderColor: 'rgba(100, 181, 246, 0.45)',
    logoUrl: '/logos/foma_logo.png',
  },
  rollei: {
    name: 'Rollei',
    primaryColor: '#C41E3A',   // Rollei Crimson Red
    secondaryColor: '#2D3142', // Titanium Gray
    textColor: '#ffffff',
    accentBg: 'rgba(196, 30, 58, 0.14)',
    borderColor: 'rgba(196, 30, 58, 0.45)',
    logoUrl: '/logos/rollei_logo.png',
  },
  default: {
    name: 'Film',
    primaryColor: '#64748B',
    secondaryColor: '#94A3B8',
    textColor: '#ffffff',
    accentBg: 'rgba(100, 116, 139, 0.12)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    logoUrl: '/logos/default_logo.png',
  },
};

export const getBrandTheme = (brandName?: string, filmName?: string): BrandTheme => {
  const target = `${brandName || ''} ${filmName || ''}`.toLowerCase();

  if (target.includes('kodak') || target.includes('코닥') || target.includes('portra') || target.includes('vision') || target.includes('gold') || target.includes('colorplus')) {
    return BRAND_CONFIGS.kodak;
  }
  if (target.includes('fuji') || target.includes('후지') || target.includes('velvia') || target.includes('provia') || target.includes('superia')) {
    return BRAND_CONFIGS.fujifilm;
  }
  if (target.includes('agfa') || target.includes('아그파') || target.includes('vista') || target.includes('apx')) {
    return BRAND_CONFIGS.agfa;
  }
  if (target.includes('ilford') || target.includes('일포드') || target.includes('hp5') || target.includes('fp4') || target.includes('delta') || target.includes('harman')) {
    return BRAND_CONFIGS.ilford;
  }
  if (target.includes('cinestill') || target.includes('씨네스틸')) {
    return BRAND_CONFIGS.cinestill;
  }
  if (target.includes('lomo') || target.includes('로모')) {
    return BRAND_CONFIGS.lomography;
  }
  if (target.includes('foma') || target.includes('포마')) {
    return BRAND_CONFIGS.foma;
  }
  if (target.includes('rollei') || target.includes('롤라이')) {
    return BRAND_CONFIGS.rollei;
  }

  return BRAND_CONFIGS.default;
};

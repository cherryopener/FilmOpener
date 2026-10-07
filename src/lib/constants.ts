import { FilmType, FilmFormat, StorageMethod, CameraFormat, EquipmentStatus, WeatherType, DevType, AgitationMethod, DeveloperType, ScanMethod } from '@/types';

// Notion-style pastel tag tokens with Apple minimalist contrast
export const NOTION_COLORS = {
  gray: { bg: 'rgba(120, 119, 116, 0.12)', text: '#787774', border: 'rgba(120, 119, 116, 0.25)' },
  brown: { bg: 'rgba(159, 107, 83, 0.12)', text: '#9f6b53', border: 'rgba(159, 107, 83, 0.25)' },
  orange: { bg: 'rgba(217, 115, 13, 0.12)', text: '#d9730d', border: 'rgba(217, 115, 13, 0.25)' },
  yellow: { bg: 'rgba(203, 145, 47, 0.12)', text: '#cb912f', border: 'rgba(203, 145, 47, 0.25)' },
  green: { bg: 'rgba(68, 131, 97, 0.12)', text: '#448361', border: 'rgba(68, 131, 97, 0.25)' },
  blue: { bg: 'rgba(51, 126, 169, 0.12)', text: '#337ea9', border: 'rgba(51, 126, 169, 0.25)' },
  purple: { bg: 'rgba(144, 101, 176, 0.12)', text: '#9065b0', border: 'rgba(144, 101, 176, 0.25)' },
  pink: { bg: 'rgba(193, 76, 138, 0.12)', text: '#c14c8a', border: 'rgba(193, 76, 138, 0.25)' },
  red: { bg: 'rgba(212, 76, 71, 0.12)', text: '#d44c47', border: 'rgba(212, 76, 71, 0.25)' },
};

export const FILM_TYPE_CONFIG: Record<FilmType, { label: string; bg: string; color: string; border: string }> = {
  bw_negative: { label: '흑백 네가', bg: NOTION_COLORS.gray.bg, color: NOTION_COLORS.gray.text, border: NOTION_COLORS.gray.border },
  bw_slide: { label: '흑백 슬라이드', bg: NOTION_COLORS.brown.bg, color: NOTION_COLORS.brown.text, border: NOTION_COLORS.brown.border },
  color_negative: { label: '컬러 네가', bg: NOTION_COLORS.orange.bg, color: NOTION_COLORS.orange.text, border: NOTION_COLORS.orange.border },
  color_slide: { label: '컬러 슬라이드', bg: NOTION_COLORS.purple.bg, color: NOTION_COLORS.purple.text, border: NOTION_COLORS.purple.border },
  cinema: { label: '영화용 (ECN-2)', bg: NOTION_COLORS.blue.bg, color: NOTION_COLORS.blue.text, border: NOTION_COLORS.blue.border },
  cinema_ahu: { label: '영화용 AHU (렘젯제거)', bg: NOTION_COLORS.red.bg, color: NOTION_COLORS.red.text, border: NOTION_COLORS.red.border },
  other: { label: '기타', bg: NOTION_COLORS.gray.bg, color: NOTION_COLORS.gray.text, border: NOTION_COLORS.gray.border },
};

export const FILM_FORMAT_CONFIG: Record<FilmFormat, { label: string; badge: string }> = {
  '135': { label: '135 (35mm)', badge: '135 (35mm)' },
  '120': { label: '120 (중형)', badge: '120 (중형)' },
  '220': { label: '220 (중형)', badge: '220' },
  large_sheet: { label: '대형 시트 (4x5 / 8x10)', badge: '대형 시트' },
  '110': { label: '110 카트리지', badge: '110' },
  other: { label: '기타 포맷', badge: '기타' },
};

export const STORAGE_METHOD_CONFIG: Record<StorageMethod, { label: string; icon: string; color: string; bg: string }> = {
  room_temp: { label: '실온 / 상온', icon: '🌡️', color: '#64748b', bg: NOTION_COLORS.gray.bg },
  refrigerated: { label: '냉장 보관', icon: '❄️', color: '#0284c7', bg: NOTION_COLORS.blue.bg },
  frozen: { label: '냉동 보관', icon: '🧊', color: '#7c3aed', bg: NOTION_COLORS.purple.bg },
};

export const CAMERA_FORMAT_CONFIG: Record<CameraFormat, string> = {
  '135_full': '35mm 풀프레임',
  '135_half': '35mm 하프프레임',
  '120_645': '중형 6x4.5',
  '120_66': '중형 6x6',
  '120_67': '중형 6x7',
  '120_69': '중형 6x9',
  large_4x5: '대형 4x5',
  large_8x10: '대형 8x10',
  panorama: '파노라마',
  other: '기타 판형',
};

export const EQUIPMENT_STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string; bg: string; usable: boolean }> = {
  active: { label: '정상 작동', color: '#16a34a', bg: NOTION_COLORS.green.bg, usable: true },
  needs_repair: { label: '수리 필요 (고장)', color: '#dc2626', bg: NOTION_COLORS.red.bg, usable: false },
  in_repair: { label: '수리 중', color: '#d97706', bg: NOTION_COLORS.yellow.bg, usable: false },
  for_sale: { label: '판매 예정', color: '#2563eb', bg: NOTION_COLORS.blue.bg, usable: true },
  collection: { label: '소장 / 보관', color: '#9333ea', bg: NOTION_COLORS.purple.bg, usable: true },
};

export const WEATHER_CONFIG: Record<WeatherType, { label: string; icon: string }> = {
  sunny: { label: '맑음', icon: '☀️' },
  cloud: { label: '구름', icon: '⛅' },
  overcast: { label: '흐림', icon: '☁️' },
  rain_snow: { label: '비 / 눈', icon: '🌧️' },
  indoor: { label: '실내', icon: '🏠' },
  indoor_tungsten: { label: '실내 (텅스텐)', icon: '💡' },
  indoor_dim: { label: '실내 (어두움)', icon: '🕯️' },
  night: { label: '야간', icon: '🌙' },
  long_exposure: { label: '장노출', icon: '⏱️' },
};

export const AGITATION_METHOD_CONFIG: Record<AgitationMethod, { label: string; desc: string }> = {
  rotary: { label: '로터리 현상', desc: 'Jobo 등 자동/반자동 연속 회전' },
  inversion: { label: '수교반', desc: '탱크를 손으로 직접 반전 및 회전' },
  stand: { label: '스탠딩 (정치현상)', desc: '초기 교반 후 1시간 이상 무교반 방치' },
  semi_stand: { label: '세미 스탠딩', desc: '중간 1~2회 보조 교반' },
  other: { label: '기타 방식', desc: '커스텀 교반 스케줄' },
};

export const DEVELOPER_TYPE_CONFIG: Record<DeveloperType, { label: string; color: string; bg: string }> = {
  bw: { label: '흑백용 (B&W)', color: NOTION_COLORS.gray.text, bg: NOTION_COLORS.gray.bg },
  color: { label: '컬러용 (C-41)', color: NOTION_COLORS.orange.text, bg: NOTION_COLORS.orange.bg },
  cinema: { label: '영화용 (ECN-2)', color: NOTION_COLORS.blue.text, bg: NOTION_COLORS.blue.bg },
  slide: { label: '슬라이드용 (E-6)', color: NOTION_COLORS.purple.text, bg: NOTION_COLORS.purple.bg },
  other: { label: '기타 약품', color: NOTION_COLORS.brown.text, bg: NOTION_COLORS.brown.bg },
};

export const SCAN_METHOD_CONFIG: Record<ScanMethod, { label: string; icon: string }> = {
  dslr: { label: 'DSLR / 미러리스 디지타이징', icon: '📸' },
  flatbed: { label: '평판 스캐너', icon: '🖨️' },
  dedicated: { label: '전용 필름 스캐너', icon: '🎞️' },
  lab: { label: '현상소 스캔', icon: '🏬' },
  other: { label: '기타 스캔', icon: '⚙️' },
};

export const COMMON_DILUTIONS = [
  'Stock (원액)',
  '1:1',
  '1:2',
  '1:3',
  '1:9',
  '1:15',
  '1:19',
  '1:25',
  '1:31',
  '1:50',
  '1:100',
  '기타 직접입력'
];

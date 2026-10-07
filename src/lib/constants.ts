import { FilmType, FilmFormat, StorageMethod, CameraFormat, EquipmentStatus, WeatherType, DevType, AgitationMethod, DeveloperType, ScanMethod } from '@/types';

export const FILM_TYPE_CONFIG: Record<FilmType, { label: string; bg: string; color: string; border: string }> = {
  bw_negative: { label: '흑백 네가', bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: '#475569' },
  bw_slide: { label: '흑백 슬라이드', bg: 'rgba(148, 163, 184, 0.25)', color: '#f1f5f9', border: '#64748b' },
  color_negative: { label: '컬러 네가', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '#d97706' },
  color_slide: { label: '컬러 슬라이드', bg: 'rgba(168, 85, 247, 0.18)', color: '#c084fc', border: '#9333ea' },
  cinema: { label: '영화용 (ECN-2)', bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '#0891b2' },
  cinema_ahu: { label: '영화용 AHU (렘젯제거)', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '#dc2626' },
  other: { label: '기타', bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: '#475569' },
};

export const FILM_FORMAT_CONFIG: Record<FilmFormat, { label: string; badge: string }> = {
  '135': { label: '135 (35mm)', badge: '35mm' },
  '120': { label: '120 (중형)', badge: '120' },
  '220': { label: '220 (중형)', badge: '220' },
  large_sheet: { label: '대형 시트 (4x5 / 8x10)', badge: 'Large Sheet' },
  '110': { label: '110 카트리지', badge: '110' },
  other: { label: '기타 포맷', badge: 'Etc' },
};

export const STORAGE_METHOD_CONFIG: Record<StorageMethod, { label: string; icon: string; color: string }> = {
  room_temp: { label: '실온 / 상온', icon: '🌡️', color: '#94a3b8' },
  refrigerated: { label: '냉장 보관', icon: '❄️', color: '#38bdf8' },
  frozen: { label: '냉동 보관', icon: '🧊', color: '#818cf8' },
};

export const CAMERA_FORMAT_CONFIG: Record<CameraFormat, string> = {
  '135_full': '35mm 풀프레임 (24x36)',
  '135_half': '35mm 하프프레임 (18x24)',
  '120_645': '중형 6x4.5',
  '120_66': '중형 6x6',
  '120_67': '중형 6x7',
  '120_69': '중형 6x9',
  large_4x5: '대형 4x5',
  large_8x10: '대형 8x10',
  panorama: '파노라마 (XPan 등)',
  other: '기타 판형',
};

export const EQUIPMENT_STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string; bg: string; usable: boolean }> = {
  active: { label: '정상 작동', color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', usable: true },
  needs_repair: { label: '수리 필요 (고장)', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', usable: false },
  in_repair: { label: '수리 중', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', usable: false },
  for_sale: { label: '판매 예정', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.12)', usable: true },
  collection: { label: '소장 / 보관', color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.12)', usable: true },
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
  rotary: { label: '로터리 현상 (Rotary)', desc: 'Jobo 등 자동/반자동 회전 프로세서' },
  inversion: { label: '수교반 (Inversion)', desc: '탱크를 손으로 직접 반전 및 회전' },
  stand: { label: '스탠딩 / 정치현상 (Stand)', desc: '초기 30~60초 교반 후 1시간 이상 무교반 방치' },
  semi_stand: { label: '세미 스탠딩 (Semi-Stand)', desc: '중간(30분 등)에 1~2회 보조 교반' },
  other: { label: '기타 방식', desc: '커스텀 교반 스케줄' },
};

export const DEVELOPER_TYPE_CONFIG: Record<DeveloperType, { label: string; color: string; bg: string }> = {
  bw: { label: '흑백용 (B&W)', color: '#cbd5e1', bg: 'rgba(148, 163, 184, 0.15)' },
  color: { label: '컬러용 (C-41)', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
  cinema: { label: '영화용 (ECN-2)', color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.15)' },
  slide: { label: '슬라이드용 (E-6)', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)' },
  other: { label: '기타 약품', color: '#94a3b8', bg: 'rgba(100, 116, 139, 0.15)' },
};

export const SCAN_METHOD_CONFIG: Record<ScanMethod, { label: string; icon: string }> = {
  dslr: { label: 'DSLR / 미러리스 디지타이징', icon: '📸' },
  flatbed: { label: '평판 스캐너 (Epson 등)', icon: '🖨️' },
  dedicated: { label: '전용 필름 스캐너 (Plustek/Nikon)', icon: '🎞️' },
  lab: { label: '현상소 스캔 (Noritsu/Frontier)', icon: '🏬' },
  other: { label: '기타 스캔 방식', icon: '⚙️' },
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

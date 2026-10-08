export type FilmType =
  | 'bw_negative'       // 흑백네가
  | 'bw_slide'          // 흑백슬라이드
  | 'color_negative'    // 컬러네가
  | 'color_slide'       // 컬러슬라이드
  | 'cinema'            // 영화용 (ECN-2 with Remjet)
  | 'cinema_ahu'        // 영화용AHU (렘젯 제거 / CineStill 스타일)
  | 'other';            // 기타

export type FilmFormat =
  | '135'               // 35mm
  | '120'               // 중형 120
  | '220'               // 중형 220
  | 'large_sheet'       // 대형 (4x5, 8x10 등)
  | '110'               // 110 포맷
  | 'other';

export type StorageMethod =
  | 'room_temp'         // 상온 보관
  | 'refrigerated'      // 냉장 보관
  | 'frozen';           // 냉동 보관

export interface FilmItem {
  id: string;
  name: string;                         // 필름 이름 (e.g. 후지 200, 포트라 400, HP5 Plus)
  brand: string;                        // 제조사/회사 (e.g. Fujifilm, Kodak, Ilford)
  type: FilmType;                       // 필름 종류
  format: FilmFormat;                   // 판형/포맷
  iso: number;                          // 감도 (ISO)
  expiry_date: string;                  // 유통기한 (YYYY-MM-DD 또는 YYYY-MM)
  storage_method: StorageMethod;        // 보관 방법 (상온/냉장/냉동)
  is_bulk_rolled: boolean;              // 감은 필름(벌크 로딩) 여부
  is_expired: boolean;                  // 썩필 (유통기한 만료) 여부
  is_rebranded: boolean;                // 껍데기만 바꾼 필름 여부 (리브랜딩/OEM)
  original_film_info?: string;          // 원본 필름 정보 (예: 코닥 컬러플러스 200 껍데기만 바꾼 것)
  quantity: number;                     // 보유 롤/매 수
  frames_per_roll: number;              // 롤당 기본 컷수 (36, 24, 12 등)
  notes?: string;                       // 비고 / 메모
  created_at: string;
  updated_at: string;
}

export type CameraFormat =
  | '135_full'          // 35mm 풀프레임
  | '135_half'          // 35mm 하프프레임
  | '120_645'           // 중형 6x4.5
  | '120_66'            // 중형 6x6
  | '120_67'            // 중형 6x7
  | '120_69'            // 중형 6x9
  | 'large_4x5'         // 대형 4x5
  | 'large_8x10'        // 대형 8x10
  | 'panorama'          // 파노라마 (XPan 등)
  | 'other';

export type EquipmentStatus =
  | 'active'            // 정상 사용 가능
  | 'needs_repair'      // 수리 필요 (고장) - 촬영 선택 불가
  | 'in_repair'         // 수리 중 - 촬영 선택 불가
  | 'for_sale'          // 판매 예정
  | 'collection';       // 소장/보관

export interface CameraItem {
  id: string;
  brand: string;                        // 제조사 (Leica, Nikon, Hasselblad, etc.)
  model: string;                        // 모델명 (M6, F3, 500C/M, etc.)
  format: CameraFormat;                 // 판형
  lens_type: 'interchangeable' | 'fixed'; // 렌즈 교환식 vs 일체형
  fixed_lens_name?: string;             // 일체형일 경우 렌즈명 (e.g. Sonnar 38mm f/2.8)
  fixed_focal_length?: number;          // 일체형 초점거리 (mm)
  fixed_max_aperture?: number;          // 일체형 최대개방 f값
  status: EquipmentStatus;              // 상태
  serial_number?: string;               // 시리얼 번호
  image_url?: string;                   // 사용자 업로드 카메라 사진 (Base64 / URL)
  notes?: string;
  created_at: string;
}

export type LensCategory = 'prime' | 'zoom'; // 단렌즈 vs 줌렌즈

export interface LensItem {
  id: string;
  brand: string;                        // 브랜드 (Carl Zeiss, Leica, Nikkor, etc.)
  name: string;                         // 렌즈명 (Planar 50mm f/1.4, etc.)
  format_compatibility: string;         // 지원 판형 (135, 120 등)
  lens_category: LensCategory;          // 단렌즈 / 줌렌즈
  focal_length_min: number;             // 최소 초점거리 (mm)
  focal_length_max: number;             // 최대 초점거리 (mm, 단렌즈는 min과 동일)
  max_aperture: number;                 // 최대 개방 조리개 f값 (e.g. 1.4, 2.8)
  mount?: string;                       // 마운트 (Leica M, Nikon F, etc.)
  status: EquipmentStatus;              // 장비 상태
  serial_number?: string;
  notes?: string;
  created_at: string;
}

export type WeatherType =
  | 'sunny'             // 맑음
  | 'cloud'             // 구름
  | 'overcast'          // 흐림
  | 'indoor'            // 실내
  | 'indoor_tungsten'   // 실내(텅스텐)
  | 'indoor_dim'        // 실내(어두움)
  | 'night'             // 야간
  | 'long_exposure'     // 장노출
  | 'rain_snow';        // 비/눈

export interface ShootingSession {
  id: string;
  date: string;                         // 출사일 (YYYY-MM-DD)
  weather: WeatherType;                 // 날씨 (드롭다운)
  location: string;                     // 출사 장소
  shots_taken?: number;                 // 해당 세션에서 찍은 컷수
  notes?: string;                       // 세션 메모 (피사체, 조명, 노출 등)
}

export type RollStatus =
  | 'loaded'            // 촬영 중 (로딩됨)
  | 'unloaded'          // 촬영 완료 (필름 뺌, 현상 대기)
  | 'developed'         // 현상 완료
  | 'scanned';          // 스캔 완료

export type DevType = 'lab' | 'self' | 'none'; // 현상소 vs 자가현상 vs 미정

export type AgitationMethod =
  | 'rotary'            // 로터리 현상 (Jobo 등)
  | 'inversion'         // 수교반 (Hand Inversion)
  | 'stand'             // 스탠딩 (정치현상)
  | 'semi_stand'        // 세미스탠딩
  | 'other';

export interface ShootingRoll {
  id: string;
  title: string;                        // 롤 식별명 (e.g. #2026-03 제주 성산일출봉)
  film_id?: string;                     // 사용한 필름 ID (보유 필름 연동)
  film_name_snapshot: string;           // 필름명 기록 (보유 필름 삭제 대비 및 스냅샷)
  camera_id?: string;                   // 사용한 카메라 ID (정상 카메라만 선택 가능)
  camera_name_snapshot: string;         // 카메라명 기록
  lens_id?: string;                     // 사용한 렌즈 ID (교환식일 경우)
  lens_name_snapshot?: string;          // 렌즈명 기록
  loaded_date: string;                  // 필름 로딩한 날짜 (장전일)
  unloaded_date?: string;               // 필름 뺀 날짜
  status: RollStatus;                   // 현재 롤 진행 상태
  shooting_sessions: ShootingSession[]; // 출사일 목록 (+ 버튼으로 복수 추가)
  iso_rated?: number;                   // 실제 촬영 감도 (증감/감감, e.g. 400 필름을 800으로 촬영)
  total_shots?: number;                 // 총 촬영 컷수
  // 3-6. 현상 방법 관리
  dev_type: DevType;                    // 현상소 vs 자가현상
  lab_name?: string;                    // 현상소 이름 (위탁 시)
  developed_date?: string;              // 현상 날짜
  developer_id?: string;                // 자가현상 시 선택한 현상액 ID (4번 현상액 연동)
  developer_name_snapshot?: string;     // 현상액명
  dev_method?: AgitationMethod;         // 현상 방식 (로터리, 수교반, 스탠딩 등)
  dilution_ratio?: string;              // 희석 비율 (원액, 1:1, 1:9, 1:25, 1:50, 1:100 등)
  dev_quantity_rolls: number;           // 이번에 함께 현상한 롤 수 (기본 1롤)
  chemical_volume_ml?: number;          // 사용한 원액량(ml)
  dilution_liquid_volume_ml?: number;   // 물/희석액량(ml)
  agitation_details?: string;           // 세세한 교반 설정 (몇분간 몇회의 회전/반전을 주었는지)
  dev_temp_celsius?: number;            // 현상 온도 (°C)
  dev_time?: string;                    // 현상 시간 (e.g. 9분 30초)
  stop_fix_wash_notes?: string;         // 정지/정착/수세/포토플로 등 메모
  is_external_roll?: boolean;           // 목록 외/외부 필름(남의 필름, 오래 묵힌 미등록 필름) 여부
  external_film_info?: string;          // 외부 필름 설명 (e.g. 지수 부탁 필름, 2018년 서랍 발견 필름)
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DeveloperType =
  | 'bw'                // 흑백용 (B&W)
  | 'color'             // 컬러용 (Color C-41)
  | 'cinema'            // 영화용 (Cinema ECN-2)
  | 'slide'             // 슬라이드용 (Slide E-6)
  | 'other';

export interface DeveloperChemical {
  id: string;
  name: string;                         // 현상액 이름 (Kodak D-76, Rodinal, Cinestill CS41 등)
  manufacturer: string;                 // 제조사 (Kodak, Ilford, Adox, Cinestill 등)
  type: DeveloperType;                  // 용도 (컬러, 흑백, 영화용, 슬라이드용)
  purchase_date: string;                // 구매 날짜
  mixed_or_opened_date: string;         // 현상액을 만든/조제한 날짜 또는 개봉 날짜
  total_rolls_processed: number;        // 누적 현상 롤 수 (3-6에서 연동되어 자동 누적!)
  total_batches: number;                // 누적 현상 작업 횟수
  dilution_usage: Record<string, number>; // 희석비율별 누적 사용 횟수 (e.g. {"1:1": 4, "1:50": 2, "Stock": 1})
  capacity_rolls_limit?: number;        // 권장 최대 처리 롤 수 (e.g. 16롤)
  volume_ml?: number;                   // 총 용량 (ml)
  current_volume_ml?: number;           // 현재 잔여 용량 (ml)
  last_used_date?: string;              // 최근 사용 일자
  notes?: string;                       // 보관 수명 및 특이사항
  created_at: string;
}

export type ScanMethod =
  | 'flatbed'           // 평판 스캐너 (Epson V600, V850 등)
  | 'dslr'              // DSLR / 미러리스 디지타이징
  | 'dedicated'         // 전용 필름 스캐너 (Plustek, Nikon Coolscan 등)
  | 'lab'               // 현상소 스캔 (Noritsu, Frontier 등)
  | 'other';

export interface ScanLog {
  id: string;
  roll_id?: string;                     // 5-2. 현상 완료된 필름 선택 연동 (ShootingRoll ID)
  is_legacy_archive: boolean;           // 5-3. 옛날에 현상된 필름(과거 아카이브) 여부
  film_title: string;                   // 스캔한 필름 제목/이름
  camera_lens_info?: string;            // 카메라/렌즈 정보
  scan_method: ScanMethod;              // 스캔 방식
  scanner_model?: string;               // 스캐너 기종 또는 카메라/매크로렌즈
  total_frames: number;                 // 총 나온 컷수 (e.g. 37컷, 12컷 등)
  folder_name: string;                  // 5-4. 저장 폴더명 (e.g. 2026-04_Jeju_Portra400)
  storage_path?: string;                // 저장 드라이브/클라우드 경로
  software_used?: string;               // 반전 소프트웨어 (Negative Lab Pro, VueScan 등)
  scan_date: string;                    // 스캔 날짜
  notes?: string;                       // 색감, 해상도, 보정 메모
  created_at: string;
}

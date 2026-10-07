# FilmOpener (필름오프너) 🎞️

> **아날로그 필름 & 카메라·촬영·자가현상·스캔 통합 워크플로우 매니저**  
> Responsive Web & Mobile App built with Next.js, Supabase, and Vercel.

---

## 🌟 주요 기능 (Key Features)

1. **보유 필름 보관소 (Film Inventory)**
   - 흑백네가 / 컬러네가 / 영화용(ECN-2) / 영화용AHU / 슬라이드 등 분류
   - **리브랜딩 / OEM 껍데기 정보**: (예: 아마존 후지 200 = 코닥 컬러플러스 200 OEM)
   - 제조사 공식 브랜드 로고 및 시그니처 컬러 테마 (Kodak, Fujifilm, Agfa, Ilford 등)
   - 감은 필름(벌크 로딩) & 썩필(만료 필름) 태그 및 필터링
   - 제조사별, 종류별, ISO별, 유통기한 임박순 정렬

2. **카메라 & 렌즈 장비함 (Gear Vault)**
   - 판형별(135 풀/하프, 120 중형 645/66/67/69, 대형 등), 초점거리별, 조리개 f값 정렬
   - 단렌즈 / 줌렌즈 구분
   - 수리 필요(고장) 및 수리 중 상태 관리 (촬영 시 사용 가능 목록에서 자동 제외)

3. **촬영 관리 (Shooting Logs)**
   - 사용한 필름, 정상 작동 카메라, 렌즈 연동 선택
   - 필름 로딩(장전일) 및 언로딩(뺀 날짜) 기록
   - **다중 출사 세션 (+)**: 날씨 드롭다운(맑음, 구름, 흐림, 비/눈, 실내, 텅스텐, 어두움, 야간, 장노출 등), 장소, 컷수 기록
   - **현상 세부 관리**: 로터리/수교반/스탠딩 방식, 몇분간 몇회 회전/반전 교반 세부 메모, 희석 비율 및 동시 처리 롤 수 연동

4. **현상액 라이브러리 (Developer Chemistry)**
   - 컬러(C-41), 흑백(B&W), 영화용(ECN-2), 슬라이드(E-6) 약품 관리
   - 구매일, 조제/개봉일, 보관 수명 관리
   - 촬영 롤과 연동되어 **총 누적 현상 롤 수** 및 **희석 비율별 사용 횟수** 자동 누적 집계

5. **필름 스캔 관리 (Scan Archive)**
   - 스캔 방식(DSLR 디지타이징, 평판 스캐너, 전용 스캐너 등), 총 나온 컷수 관리
   - 현상 완료 롤 연동 및 과거 아카이브 필름 직접 등록
   - **실제 저장 폴더명(Folder Name)** 및 스토리지 경로 텍스트 아카이브

---

## 🚀 로컬 실행 방법 (Local Development)

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 로컬 브라우저 접속
# http://localhost:3000
```

---

## ☁️ Vercel & Supabase 배포

1. GitHub 저장소(`cherryopener/FilmOpener`)를 Vercel에 Import합니다.
2. Supabase 프로젝트를 생성하고, `supabase/schema.sql` 내용을 Supabase SQL Editor에서 실행합니다.
3. Vercel 환경 변수에 아래 키를 등록하면 자동으로 클라우드 DB와 동기화됩니다:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

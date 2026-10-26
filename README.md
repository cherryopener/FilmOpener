# FilmOpener (필름따개) 🎞️

> **아날로그 필름 & 카메라·촬영·자가현상·스캔 통합 워크플로우 매니저**  
> Standalone Desktop App (Windows & macOS) and Responsive Web App.

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

## 💻 데스크톱 앱 다운로드 (Desktop App Release)

클라우드(Vercel, Supabase) 연결 없이 **오프라인 로컬 환경에서 단독으로 동작하는 데스크톱 전용 앱**을 제공합니다. 데이터는 사용자의 PC 내부 저장소에 안전하게 영구 보존됩니다.

👉 **[최신 버전 다운로드 (GitHub Releases)](https://github.com/cherryopener/FilmOpener/releases)**

| 운영체제 | 다운로드 파일 | 설치 방법 |
| :--- | :--- | :--- |
| **Windows** | `FilmOpener.Setup.x.x.x.exe` | 실행 시 자동으로 설치되며 바탕화면 및 시작 메뉴에 등록됩니다. |
| **macOS** | `FilmOpener-x.x.x-arm64.dmg` | 디스크 이미지를 열고 `FilmOpener` 아이콘을 `Applications` 폴더로 드래그합니다. |
| **macOS (포터블)** | `FilmOpener-x.x.x-arm64-mac.zip` | 압축 해제 후 바로 실행 가능한 앱 번들입니다. |

> 💾 **데이터 저장 위치**: Supabase 미연동 시 각 운영체제의 사용자 애플리케이션 데이터 폴더(`AppData\Roaming` 또는 `Application Support`)에 영구 저장되므로 앱을 재부팅해도 데이터가 유지됩니다.

---

## 🛠️ 데스크톱 앱 로컬 개발 & 빌드 (Desktop Development)

```bash
# 1. 의존성 설치
npm install

# 2. 웹 개발 서버 (브라우저 접속: http://localhost:3000)
npm run dev

# 3. Electron 데스크톱 개발 모드 (Next.js 핫 리로딩 연동)
npm run electron:dev

# 4. 로컬에서 데스크톱 설치 파일 직접 빌드
npm run dist:mac   # macOS용 (.dmg, .zip) 빌드
npm run dist:win   # Windows용 (.exe) 빌드
```

---

## 🚀 GitHub Actions 자동 빌드 & 릴리즈 (CI/CD)

저장소의 `.github/workflows/build-and-release.yml`을 통해 윈도우와 맥 설치 파일이 자동으로 빌드됩니다:

```bash
# 새로운 릴리즈 태그 생성 및 푸시
git tag v0.1.4
git push origin v0.1.4
```
* 태그를 푸시하면 GitHub Actions의 Windows 및 macOS 가상머신에서 각각 실행 파일을 빌드하고, 완료 즉시 **Releases** 탭에 다운로드 링크가 자동 등록됩니다.
* GitHub 저장소의 **Actions** 탭에서 [Run workflow] 버튼을 눌러 수동 빌드도 가능합니다.

---

## ☁️ 클라우드 동기화 (선택 사항: Vercel & Supabase)

기본 오프라인 로컬 저장 외에 멀티 디바이스 간 클라우드 동기화가 필요한 경우에만 설정합니다:

1. GitHub 저장소(`cherryopener/FilmOpener`)를 Vercel에 Import합니다.
2. Supabase 프로젝트를 생성하고, `supabase/schema.sql` 내용을 Supabase SQL Editor에서 실행합니다.
3. Vercel 환경 변수 또는 로컬 `.env.local`에 아래 키를 등록하면 자동으로 클라우드 DB와 동기화됩니다:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

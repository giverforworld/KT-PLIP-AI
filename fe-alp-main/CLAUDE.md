# fe-alp-main — Frontend Dashboard

## 프로젝트 개요
KT ALP(생활인구) 서비스의 Next.js 기반 프론트엔드. 생활인구(ALP), 이동인구(MOP), 체류인구(LLP) 데이터 시각화, GIS 지도 분석, 대시보드, 북마크 관리 기능을 제공하는 기업 내부 분석 포털.

## 기술 스택
- **Framework**: Next.js 16.2.3 (App Router)
- **언어**: TypeScript 5.5.4
- **React**: 19.0.0
- **스타일링**: Tailwind CSS 3.4.1 (커스텀 테마, 다크모드)
- **서버 상태**: TanStack React Query 5.51.21
- **클라이언트 상태**: Zustand 5.0.9
- **세션**: iron-session 8.0.2 (암호화 쿠키, 4시간 유효)
- **HTTP 클라이언트**: Axios 1.15.0
- **차트**: ECharts 5.5.1 + D3 7.9.0
- **GIS**: deck.gl 9.2.5, proj4, Turf.js, topojson
- **폼**: react-hook-form + yup
- **관측성**: OpenTelemetry + Azure Application Insights (`tracing.js`)

## 디렉토리 구조
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃 (QueryProvider, Toast, RouterLogger)
│   ├── (main)/             # 인증 필요 라우트
│   │   ├── (centered)/     # 중앙 정렬 레이아웃
│   │   │   ├── alp/        # 생활인구
│   │   │   ├── mop/        # 이동인구
│   │   │   └── llp/        # 체류인구
│   │   ├── (full)/         # 전체 너비 레이아웃
│   │   │   ├── dashboard/  # 메인 대시보드
│   │   │   ├── gis/        # GIS 지도 분석
│   │   │   └── bookmark/   # 북마크 관리
│   │   └── page.tsx        # / → /dashboard 리다이렉트
│   ├── (standalone)/       # 독립 페이지
│   │   └── regional-dashboard/ # 지역 대시보드 (alpAuthCd=4 제한)
│   ├── (test)/             # 테스트 라우트
│   │   ├── health/         # 헬스 체크
│   │   └── redirect-login/ # BDIP 로그인 콜백 핸들러
│   └── api/                # BFF API 라우트
│       ├── auth/           # 세션/인증 (token, logout, refresh 등)
│       ├── bookmark/       # 북마크 CRUD
│       ├── dashboards/     # 대시보드 데이터
│       ├── gis/            # GIS 데이터
│       ├── data/           # 검색 결과
│       └── datainfo/       # 데이터 메타정보
├── components/             # 재사용 UI 컴포넌트 (비즈니스 로직 없음)
├── containers/             # 페이지별 컨테이너 (서버 컴포넌트 → 클라이언트 자식)
├── context/                # 전역 클라이언트 상태
│   ├── QueryProvider.tsx   # React Query 프로바이더
│   └── atom.ts             # Recoil atoms (대부분 주석 처리 — 레거시)
├── store/                  # Zustand 스토어 (UI 상태)
├── hooks/queries/          # TanStack Query 훅
├── services/               # Axios API 클라이언트 + 서버사이드 유틸
│   └── server/             # iron-session, JWT 검증, 로그 전송
├── constants/              # 경로, 메뉴, 필터, GIS 상수
├── types/                  # TypeScript 타입 선언
├── utils/                  # 유틸리티 함수
├── styles/globals.css      # Tailwind 임포트 + 글로벌 CSS
└── middleware.ts           # 인증 체크, 권한 검증, CORS
public/
└── maps/                   # GeoJSON, topojson, 지역 데이터
```

## 아키텍처 패턴
- **서버 컴포넌트** (containers/): 초기 데이터 페칭, 레이아웃
- **클라이언트 컴포넌트** (components/): 인터랙션, React Query 훅 사용
- **BFF 패턴**: `/app/api/` 라우트가 Express 백엔드와 BDIP 사이를 중계

## 인증 플로우
1. 사용자 로그인 클릭 → BDIP 로그인 페이지로 리다이렉트
2. BDIP → `/redirect-login` 콜백 (토큰 포함)
3. `/api/auth/token` 호출 → JWT 검증, iron-session 생성
4. 이후 요청은 `middleware.ts`에서 세션 확인
5. 로그아웃: `/api/auth/delete-session`으로 쿠키 삭제

## 권한 체계 (alpAuthCd)
| 코드 | 구분 | 접근 범위 |
|------|------|----------|
| `"2"` | 프리미엄 회원 | 전체 |
| `"3"` | 일반 회원 | 전체 |
| `"4"` | 준회원 | regional-dashboard 제한 |

- 권한 정의: `src/constants/menu.ts`
- 검증: `src/middleware.ts`의 `hasPermission()`

## 상태 관리
| 레이어 | 도구 | 용도 |
|--------|------|------|
| 서버 상태 | TanStack React Query | API 데이터 페칭/캐싱 |
| 클라이언트 UI 상태 | Zustand | 탭, 드로어, 테마, 검색 필터 |
| 인증 상태 | iron-session | 서버사이드 암호화 쿠키 |
| 레거시 | Recoil | 대부분 주석 처리, 사용 최소화 |

## 데이터 패칭 훅 (`src/hooks/queries/`)
- `useGetData()` — 검색 결과, 대시보드, 랭킹
- `useGisData()` / `useMapData()` — 지리 공간 데이터
- `useMutateData()` — 북마크 생성/수정/삭제
- `useRegionInfo()` — 지역 정보
- `useUser()` — 사용자 세션

## 환경변수
```
NEXT_PUBLIC_BASE_PATH                 # URL 기본 경로 (예: /plip)
NEXT_PUBLIC_LOGIN_URL                 # BDIP 로그인 URL
NEXT_PUBLIC_MAIN_URL                  # BDIP 메인 URL
NEXT_PUBLIC_EXPRESS_API_URL           # 백엔드 Express API URL
NEXT_PUBLIC_SESSION_PW                # iron-session 비밀번호 (32자 이상)
NEXT_PUBLIC_PROMETHEUS_URL            # Prometheus 푸시게이트웨이
JWT_SECRET                            # JWT 검증 시크릿
APPLICATIONINSIGHTS_CONNECTION_STRING # Azure Monitor (선택)
NEXT_PUBLIC_ALLOW_FULL_URL            # CORS 허용 URL (콤마 구분)
NEXT_PUBLIC_ALLOW_DEFAULT_URL         # CORS 기본 허용 URL
```

## npm 스크립트
```bash
npm run dev    # 개발 서버 (포트 3000, Turbopack)
npm run build  # 프로덕션 빌드
npm start      # 프로덕션 서버 실행
npm run lint   # ESLint 검사
```

## 스타일링 가이드
- **Tailwind CSS** 유틸리티 우선
- 커스텀 컬러: `primary` (빨간색 #D63457), 다양한 그레이/블루/그린
- 커스텀 폰트: Pretendard
- 다크모드: `darkMode: "class"` (클래스 토글 방식)
- Prettier + `prettier-plugin-tailwindcss`로 클래스 순서 자동 정렬

## 빌드 / 배포
- **Docker**: 멀티스테이지 빌드 (`deps → builder → runner`)
- **CI/CD**: GitHub Actions + Azure Key Vault + ACR (`.github/workflows/ci_kv.yml`)
- **Nexus**: 사내 npm 레지스트리
- **보안 스캔**: Trivy (`trivy.yaml`)
- **포트**: 3000

## 테스트
- **현재 없음** — 자동화 테스트 프레임워크 미설정
- 핵심 수동 테스트: 로그인/세션, 보호 라우트, 로그아웃, 권한 강제, 백엔드 데이터 연동

## 주요 주의사항
- `iron-session` 쿠키는 `httpOnly: false` — 클라이언트에서 읽기 가능
- Recoil은 레거시, 신규 상태는 Zustand 사용
- `NEXT_PUBLIC_BASE_PATH=/plip` — API 경로 모두 `/plip/api/`로 시작
- 서버 컴포넌트와 클라이언트 컴포넌트 경계 명확히 구분 필요 (containers = 서버, components = 클라이언트)
- GIS 데이터(topojson, GeoJSON)는 `public/maps/`에 정적 파일로 위치

# TestPlanner용 프로젝트 맥락

## 한 줄 요약
- KT ALP 프론트엔드(`alp-frontend`): Next.js(App Router) 기반의 **지역·인구·이동 분석 대시보드·GIS UI**로, BDIP 등 외부 로그인과 연동된 **등급별(프리미엄/스탠다드/준회원) 접근 제어**가 있다. (저장소·코드 기준 요약 — 제품 공식 명칭·주 사용자 세부는 검토 필요)

## 반드시 검증할 핵심 시나리오
1. BDIP(또는 설정된 로그인 URL) 경유 로그인 후, iron-session 기반 세션이 생성되고 보호 라우트에 진입한다.
2. 미로그인(또는 세션 없음) 상태로 보호 경로에 접근하면 로그인(redirect) 흐름으로 유도된다.
3. 로그아웃·`/api/auth/delete-session` 등으로 세션이 제거된 뒤 재접근 시 로그인이 요구된다.
4. `alpAuthCd` 등급별로 **허용 메뉴·서브경로**가 일치한다(예: 준회원은 지역별 대시보드 `regional-dashboard` 미들웨어 차단).
5. `NEXT_PUBLIC_EXPRESS_API_URL` 등 백엔드와 연동하는 주요 화면에서 데이터가 정상 로드·에러 처리된다.
6. `NEXT_PUBLIC_BASE_PATH`가 비어 있지 않은 배포에서 정적 리소스·리다이렉트·로그인 경로가 깨지지 않는다.
7. 허용된 Origin에서의 CORS 동작이 기대와 맞다(`NEXT_PUBLIC_ALLOW_FULL_URL`, `NEXT_PUBLIC_ALLOW_DEFAULT_URL`).
8. (개발/문서) `/api-doc` Swagger UI에서 API 라우트 문서가 반영된다.

## 용어 / 약어
| 용어 | 의미 |
|------|------|
| ALP | 코드 상 경로·메뉴에서 **생활인구** 영역 (`PATHS.ALP`) |
| MOP | **생활이동** |
| LLP | **체류인구** |
| DAS / REG_DAS | 종합현황 대시보드 / **지역별 대시보드**(`regional-dashboard`) |
| BDIP | 외부 메인·로그인 연동 URL 맥락(`NEXT_PUBLIC_MAIN_URL`, `NEXT_PUBLIC_LOGIN_URL`) |
| alpAuthCd | 회원 등급 코드: `2` 프리미엄, `3` 스탠다드, `4` 준회원 |
| baseInfo / apdInfo | 기본·부가 계약 지역(세션에는 용량 이슈로 수치 코드 형태 저장) |

## 역할 / 권한
- **프리미엄 (`2`)**: 메뉴 정의상 가장 넓은 범위(예: 일부 랭킹·분석은 `2` 전용).
- **스탠다드 (`3`)**: GIS·생활이동/생활인구/체류인구 등 대부분 접근, 프리미엄 전용 서브메뉴는 제외.
- **준회원 (`4`)**: 종합현황 등 일부 허용; **지역별 대시보드(REG_DAS)는 미들웨어에서 불가**; 북마크 등 메뉴는 `menuList`·UI 분기와 불일치 시 회귀 주의.
- 미인증: 세션 없으면 로그인 경로로 리다이렉트(`middleware.ts`).

## 외부 연동 / 환경
- **Express API**: `NEXT_PUBLIC_EXPRESS_API_URL` — 화면·BFF성 `app/api` 라우트에서 백엔드 호출에 사용.
- **BDIP / 로그인**: `NEXT_PUBLIC_LOGIN_URL`, `NEXT_PUBLIC_MAIN_URL`.
- **배포 경로**: `NEXT_PUBLIC_BASE_PATH` (빈 문자열 가능).
- **모니터링**: `APPLICATIONINSIGHTS_CONNECTION_STRING` (OpenTelemetry/트레이싱 연계).
- **Prometheus**: `NEXT_PUBLIC_PROMETHEUS_URL` (메트릭 URL 맥락).
- **세션 암호화**: `NEXT_PUBLIC_SESSION_PW`(iron-session), **JWT**: `JWT_SECRET`(토큰 검증 등).
- **CORS 허용 도메인**: `NEXT_PUBLIC_ALLOW_FULL_URL`, `NEXT_PUBLIC_ALLOW_DEFAULT_URL`(쉼표 구분).

## 엣지케이스 · 회귀 주의
- **중복 로그인**: 동일 사용자·토큰으로 `/api/auth/token` 재요청 시 `403 User already logged in` 처리 확인.
- **쿠키/세션 용량**: 로그인 시 지역 정보를 수치로 줄여 저장하는 로직이 있어, 지역 조합이 많을 때 깨짐 여부를 별도 확인할 가치가 있음.
- **권한·메뉴 이중 정의**: `middleware`의 `hasPermission`과 `constants/menu.ts`의 `alpAuthCd`가 어긋나면 403/리다이렉트와 UI 노출이 불일치할 수 있음.
- **GIS 서브메뉴 경로**: `menu.ts` 내 표기(대문자 세그먼트 등)와 실제 URL 세그먼트 매핑이 TC에서 혼동되기 쉬움 — 실제 라우트와 대조 권장.

## diff에 나오지 않아도 TC에 필요한 전제 (권장)
- 로그인·토큰 발급은 **BDIP/백엔드 계약**에 의존하므로, FE만 변경 PR이라도 **통합 로그인·세션 TTL**을 스모크한다.
- 지도·GIS는 **타일/지오데이터·CORS**에 의존할 수 있어, API diff 없이도 외부 리소스 장애 시 화면이 비는지 확인한다.
- `be-alp`(또는 Express API 저장소)와 **응답 스키마·에러 코드** 계약이 맞는지, 병행 릴리스 시 회귀 범위를 넓게 본다.

## TC 작성 시 선호 (선택)
- 저장소 내 **Playwright/Cypress/E2E 전용 디렉터리는 확인되지 않음** — 팀 표준(한글/영문, 케이스 ID, GWT)이 있으면 여기에 한 줄로 보강할 것.
- 수동·탐색 테스트 시 **등급별 계정(2/3/4)** 과 **basePath 유·무** 두 축을 최소 조합으로 명시하는 것을 권장.

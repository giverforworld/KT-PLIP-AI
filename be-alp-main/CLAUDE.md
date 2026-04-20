# be-alp-main — Backend API Server

## 프로젝트 개요
KT ALP(생활인구) 서비스의 Express 기반 백엔드 API 서버. OpenSearch를 주 데이터 소스로 사용하여 생활인구(ALP), 이동인구(MOP), 체류인구(LLP) 데이터 집계/검색, GIS 좌표 변환, 대시보드 등을 제공한다.

## 기술 스택
- **Runtime**: Node.js 22 (Docker: `node:22-alpine`)
- **Language**: TypeScript 5.6.2 → ES2016 CommonJS, 출력: `dist/`
- **Framework**: Express 4.21.0
- **데이터 소스**: OpenSearch 2.12.0 (ORM 없음)
- **인증**: JWT decode-only (`jsonwebtoken`) — 서명 검증은 외부에서 수행
- **로깅**: Winston + Morgan
- **관측성**: OpenTelemetry + Azure Application Insights (`tracing.js`)
- **GIS**: proj4 2.20.2 (좌표계 변환)
- **API 문서**: Swagger (`/api-docs`)
- **보안**: Helmet, CORS

## 디렉토리 구조
```
src/
├── app.ts                  # Express 진입점, 미들웨어 스택, 포트 8080
├── config/                 # 환경변수 로더, OpenSearch 클라이언트, Swagger 설정
├── router/                 # 라우트 정의 (21개 파일)
├── controller/             # 요청 파싱 → 서비스 호출 (17개 파일)
├── service/                # 비즈니스 로직 + OpenSearch 쿼리 (40+개 파일)
├── helpers/                # JWT 미들웨어, 날짜·좌표·시간 변환 유틸 (14개 파일)
├── utils/                  # 차트 집계, GIS 변환, 쿼리 필터 빌더
└── swagger/                # Swagger YAML 정의
types/                      # 전역 타입 선언 (chart, gis, opensearch, common)
```

## 아키텍처 패턴
**Router → Controller → Service** 레이어 구조

- **Router**: 라우트 등록, `verifyToken` 적용, express-validator 유효성 검사
- **Controller**: 요청 파싱, 서비스 호출, 응답 반환
- **Service**: OpenSearch 쿼리, 데이터 변환

## 주요 라우트
| 경로 | 인증 | 설명 |
|------|------|------|
| `/health` | 공개 | 헬스 체크 → "OK" |
| `/api-docs` | 공개 | Swagger UI |
| `/alp/*` | 보호 | 생활인구 데이터/통계 |
| `/mop/*` | 보호 | 이동인구 데이터/통계 |
| `/llp/*` | 보호 | 체류인구 데이터/통계 |
| `/*` (bookmark) | 보호 | 북마크 CRUD |
| `/holidays/*` | 공개 | 공휴일 정보 |
| `/gis/*` | 공개 | GIS 격자/좌표 변환 |
| `/dashboards/*` | 공개 | 대시보드 데이터 |
| `/regional-dashboard/*` | 공개 | 지역 대시보드 |

## 인증 방식
- `src/helpers/token.ts`의 `verifyToken()` 미들웨어
- `Authorization: Bearer <token>` 헤더에서 추출
- `jwt.decode()` 사용 (서명 **미검증**) — 서명 검증은 외부 시스템 담당
- `req.user.userId` 설정

## 환경변수 (`.env` / `.env.dev`)
```
NODE_ENV                              # "production" | "dev"
SERVER_URL                            # 서버 호스트
SERVER_PORT                           # 포트 (기본 8080)
OPENSEARCH_NODES                      # 콤마 구분 OpenSearch URL
OPENSEARCH_USER                       # OpenSearch 사용자
OPENSEARCH_PASSWORD                   # OpenSearch 비밀번호
CORS_ALLOW_ORIGIN                     # CORS 허용 출처
APPLICATIONINSIGHTS_CONNECTION_STRING # Azure Monitor (선택)
```

## npm 스크립트
```bash
npm run dev    # tsc 빌드 후 watch + nodemon 핫리로드
npm run build  # tsc 컴파일 + swagger yaml 복사
npm start      # NODE_ENV=production node dist/app.js
```

## OpenSearch 클라이언트 특성
- SSL `rejectUnauthorized: false`
- 타임아웃: 100초, 최대 재시도: 3회
- 서버 타임아웃: 1,000,000ms (매우 긴 요청 대응)

## 미들웨어 적용 순서 (app.ts)
1. System router (health)
2. `express.json()`
3. CORS
4. Morgan 로깅
5. `timezn` 쿼리 파라미터 정규화 (object → array)
6. Swagger UI
7. 메인 라우터
8. Helmet (보안 헤더)
9. 404 핸들러
10. 글로벌 에러 핸들러

## 빌드 / 배포
- **Docker**: 멀티스테이지 빌드 (`deps → builder → runner`)
- **CI/CD**: GitHub Actions + Azure Key Vault + ACR (`.github/workflows/ci_kv.yml`)
- **환경**: dev → stg → prd (Kustomize overlays)
- **보안 스캔**: Trivy (컨테이너 이미지)
- **Nexus**: 사내 npm 레지스트리 (`.npmrc` 시크릿 마운트)

## 경로 별칭
`tsconfig.json`에서 `@` → `src` 매핑 (`module-alias` 런타임 지원)

## 테스트
- **현재 없음** — 자동화 테스트 프레임워크 미설정
- 수동 테스트: Postman, Newman 사용 권장
- 핵심 시나리오: 헬스 체크, 토큰 검증, OpenSearch 에러 처리, timezn 파라미터 정규화

## 주의사항
- `jwt.decode()`는 서명 검증을 하지 않음 — 보안 로직 변경 시 주의
- OpenSearch SSL 검증이 비활성화 상태
- Helmet은 라우터 **이후**에 적용됨
- `timezn`: object → array 변환만 처리 (다른 변환 없음)

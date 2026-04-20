# TestPlanner용 프로젝트 맥락

## 한 줄 요약
- KT 사내 ALP 관련 **Express 백엔드(`alp-backend`)**로, OpenSearch·GIS·휴일·대시보드 등 API를 제공한다. 주 사용자는 **ALP/MOP/LLP·북마크 등 토큰 보호 구간을 호출하는 프론트/클라이언트**, 및 **토큰 없이 호출 가능한 공개·준공개 API 소비자**다. (저장소·코드 기준 요약 — 제품 범위는 사내 문서로 검토 권장)

## 반드시 검증할 핵심 시나리오
1. `GET /health`로 헬스 체크가 200과 본문 `OK`를 반환하는지 확인한다.
2. `Authorization: Bearer <JWT>` 없이 `/alp`, `/mop`, `/llp` 또는 루트에 마운트된 북마크 API를 호출했을 때 **403** 및 적절한 메시지가 나오는지 확인한다.
3. 유효한 `Authorization` 헤더 형식으로 `/alp`(또는 MOP/LLP) 대표 엔드포인트를 호출했을 때 **정상 응답**이 나오는지 확인한다(토큰 페이로드에 `userid` 클레임이 있어야 `req.user`가 채워짐).
4. OpenSearch가 불가(노드/인증 오류)한 환경에서 검색·집계 API가 **명확한 오류 응답(5xx/메시지)**으로 실패하는지 확인한다.
5. `timezn` 쿼리가 객체 형태로 들어올 때(Express 파싱 이슈) **배열로 정규화된 뒤** 후속 로직이 깨지지 않는지 확인한다.
6. `/api-docs`에서 Swagger UI가 로드되고, 문서화된 API와 실제 라우트가 **큰 틀에서 일치**하는지 확인한다.
7. CORS: `CORS_ALLOW_ORIGIN`에 맞는 Origin에서만(또는 `*` 설정 시) 브라우저 클라이언트 호출이 기대대로 동작하는지 확인한다.

## 용어 / 약어
| 용어 | 의미 |
|------|------|
| ALP / MOP / LLP | 앱에서 `/alp`, `/mop`, `/llp` 프리픽스로 구분되는 **기능 영역**(상세 비즈니스 정의는 사내 도메인 문서 참고). |
| OpenSearch | 검색·집계에 사용하는 **검색 엔진 클러스터**(`OPENSEARCH_*` 환경 변수로 접속). |
| GIS | 지리 그리드·좌표 변환 등 **공간 관련 API** (`/gis` 라우터). |
| `timezn` | 쿼리스트링 타임존 관련 파라미터; 객체로 들어오면 **값 배열로 변환**하는 미들웨어가 있음. |
| `verifyToken` | `Authorization` Bearer 토큰을 읽어 JWT를 **디코드**하고 `userid`로 `req.user`를 설정하는 미들웨어(코드상 `jwt.verify`가 아님). |

## 역할 / 권한
- **인증 필요 구간**: `app.ts` 기준 `/alp`, `/mop`, `/llp`, 루트의 북마크 라우터는 `verifyToken` 적용. 역할(RBAC) 분기는 코드에서 확인되지 않음 — **토큰 유무·페이로드의 `userid`**가 주요 구분.
- **토큰 미적용(마운트 기준)**: `/holidays`, `/gis`, `/dashboards`, `/regional-dashboard`, `/datainfo`, `/rgninfo`, `/usrinfo` 등은 `app.ts`에서 `verifyToken` 없이 등록됨. 각 라우터 내부 추가 가드는 해당 파일 검토 필요.
- **역할 B(세분 역할)**: 코드베이스에 명시적 역할 테이블/권한 열거 없음 → **해당 없음(또는 사외 IdP·게이트웨이에서 처리 — 확인 필요)**.

## 외부 연동 / 환경
- **OpenSearch**: `OPENSEARCH_NODES`(콤마 구분 가능), `OPENSEARCH_USER`, `OPENSEARCH_PASSWORD` 필수(`config.ts`의 `required`).
- **서버**: `NODE_ENV`, `SERVER_URL`, `SERVER_PORT`(기본 8080), `CORS_ALLOW_ORIGIN` 필수.
- **환경 파일**: `production`은 `./.env`, 그 외는 `./.env.dev`를 `dotenv`로 로드.
- **관측**: `APPLICATIONINSIGHTS_CONNECTION_STRING` — `env`/`env.dev`에 키 존재(값은 로컬마다 다름). OpenTelemetry/Azure Monitor 의존성 있음(`package.json`).
- **스테이징/운영 URL·인덱스명**: 저장소에 고정값 없음 → **(확인 필요)**.

## 엣지케이스 · 회귀 주의
- **JWT**: `jsonwebtoken`의 **`decode`만 사용** — 서명 만료 검증이 없을 수 있음. 보안·인증 TC 설계 시 실제 운영 정책과 불일치 여부를 사람이 검토할 것.
- **토큰 형식 오류 시**: `split(" ")[1]`이 없을 때 `next()`가 호출되지 않을 수 있는 코드 경로가 있음 — 응답/행 걸림 여부 TC에 포함할지 검토.
- **OpenSearch 클라이언트**: `rejectUnauthorized: false`, `requestTimeout` 100000ms, `maxRetries: 3` — SSL·장시간 집계·재시도 동작이 TC에 영향.
- **HTTP 서버**: `setTimeout(1000000)` — 초장시간 요청 허용; 타임아웃·게이트웨이 한도와의 조합 **(확인 필요)**.
- **`req.query.timezn`**: 배열이 아닌 object일 때만 `Object.values`로 치환 — 다른 이상 형태는 **(확인 필요)**.

## diff에 나오지 않아도 TC에 필요한 전제 (권장)
- **프론트/게이트웨이**: 실제 JWT 발급 주체(키·만료·클레임 스키마)는 이 저장소 밖일 수 있음 — E2E는 **발급 가능한 토큰** 전제 명시.
- **OpenSearch 인덱스·매핑**: 동일 API라도 인덱스 버전/별칭(alias)에 따라 결과가 달라짐 — 스테이징 데이터 스냅샷 또는 최소 시드 전제.
- **GIS**: `proj4` 등 좌표계 변환 의존 — 입력 SRID/출력 규격은 프론트·다른 서비스와 계약 확인.
- **Helmet**: `app.ts`에서 라우트 등록 **이후**에 적용 — Swagger·일부 경로와의 순서가 보안 헤더에 미치는 영향을 회귀에서 한 번씩 볼 것.

## TC 작성 시 선호 (선택)
- `package.json`에 **Jest/Vitest/Supertest 등 자동화 테스트 스크립트 없음** — API TC는 팀 표준(포스트맨·Newman·k6·사내 도구)을 정해 `(팀에서 보완)` 권장.
- 메시지 검증 시 영문 고정 문자열 예: `"No token provided"`, `"Token format is incorrect"`, `"Failed to authenticate token"`(`token.ts`).

# Base image 설정
FROM ktbase.azurecr.io/ktdev/node:22-alpine AS base
ARG NPM_CONFIG_REGISTRY
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY

# 작업 디렉토리 설정
WORKDIR /app

# =========================
# Dependency stage
# =========================
FROM base AS deps

# 알파인 리포지토리 미러 교체 (내부 프록시 사용)
# RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://repository.azdevops.kt.co.kr/repository/raw/proxy-dlcdn-alpinelinux-org|g' /etc/apk/repositories

# 종속성 관련 파일 복사 (lockfile 포함)
COPY package.json package-lock.json ./

# 빌드 시에만 사용할 임시 환경변수 설정
ENV APPLICATIONINSIGHTS_CONNECTION_STRING="dummy-value-for-build"

# lockfile 기반 재현 가능한 설치 (사설 레지스트리 .npmrc 시크릿 사용)
RUN --mount=type=secret,id=npmrc \
    npm --userconfig=/run/secrets/npmrc ci

# =========================
# Builder stage
# =========================
FROM base AS builder
WORKDIR /app

# deps 단계에서 설치한 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules

# 애플리케이션 전체 소스 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# =========================
# Runner stage
# =========================
FROM ktbase.azurecr.io/ktdev/node:22-alpine AS runner
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production \
    PORT=4000 \
    TZ=Asia/Seoul \
    NODE_OPTIONS="--require ./tracing.js"

# 실행에 필요한 파일만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tracing.js ./tracing.js

EXPOSE 4000
CMD ["node", "dist/app.js"]

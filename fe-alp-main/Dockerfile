# Base stage
FROM --platform=linux/amd64 ktbase.azurecr.io/ktdev/node:22-alpine AS base
ARG NPM_CONFIG_REGISTRY 
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY

WORKDIR /app

# Dependency stage
FROM base AS deps
RUN sed -i 's/https:\/\/dl-cdn.alpinelinux.org/https:\/\/repository.azdevops.kt.co.kr\/repository\/raw\/proxy-dlcdn-alpinelinux-org/g' /etc/apk/repositories

COPY package.json package-lock.json ./

# package.json의 모든 의존성을 한 번에 설치
RUN --mount=type=secret,id=npmrc \
    npm --userconfig=/run/secrets/npmrc ci

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env ./.env

RUN npm run build

# Runner stage
FROM --platform=linux/amd64 ktbase.azurecr.io/ktdev/node:22-alpine AS runner
WORKDIR /app

ENV NODE_OPTIONS='--require ./tracing.js'

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tracing.js ./tracing.js
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT=3000
ENV TZ=Asia/Seoul

CMD ["npm", "start"]
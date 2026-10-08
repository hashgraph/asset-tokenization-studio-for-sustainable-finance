# ===== Stage 1: Builder =====
FROM node:20-alpine AS builder

# python3/make/g++ required for native npm modules (secp256k1, bufferutil, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run shared:build && npm run gateway:build

RUN npm prune --omit=dev

# ===== Stage 2: Production =====
FROM node:20-alpine

WORKDIR /app

# Root package.json needed for workspace resolution
COPY --from=builder /app/package.json ./package.json

# Hoisted node_modules (production only after prune, workspace symlinks intact)
COPY --from=builder /app/node_modules ./node_modules

# Workspace packages referenced via node_modules symlinks at runtime
COPY --from=builder /app/packages/shared/core/package.json ./packages/shared/core/package.json
COPY --from=builder /app/packages/shared/core/dist ./packages/shared/core/dist

# treasury/contracts needed transitively by shared-core
COPY --from=builder /app/packages/treasury/contracts/package.json ./packages/treasury/contracts/package.json
COPY --from=builder /app/packages/treasury/contracts/build ./packages/treasury/contracts/build

# Application
COPY --from=builder /app/apps/shared/gateway/package.json ./apps/shared/gateway/package.json
COPY --from=builder /app/apps/shared/gateway/dist ./apps/shared/gateway/dist

EXPOSE 3000

CMD ["node", "apps/shared/gateway/dist/main.js"]

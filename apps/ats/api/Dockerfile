# ===== Stage 1: Builder =====
FROM node:20-alpine AS builder

# python3/make/g++ required for native npm modules (secp256k1, bufferutil, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run contracts:build && npm run shared:build && npm run ats:api:build

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

COPY --from=builder /app/packages/shared/blockchain-listener/package.json ./packages/shared/blockchain-listener/package.json
COPY --from=builder /app/packages/shared/blockchain-listener/dist ./packages/shared/blockchain-listener/dist

# contracts packages expose ./build/typechain-types/index.js as main entry point
COPY --from=builder /app/packages/ats/contracts/package.json ./packages/ats/contracts/package.json
COPY --from=builder /app/packages/ats/contracts/build ./packages/ats/contracts/build

# treasury/contracts needed transitively by shared-core
COPY --from=builder /app/packages/treasury/contracts/package.json ./packages/treasury/contracts/package.json
COPY --from=builder /app/packages/treasury/contracts/build ./packages/treasury/contracts/build

# Application
COPY --from=builder /app/apps/ats/api/package.json ./apps/ats/api/package.json
COPY --from=builder /app/apps/ats/api/dist ./apps/ats/api/dist

EXPOSE 3001

CMD ["node", "apps/ats/api/dist/src/main.js"]

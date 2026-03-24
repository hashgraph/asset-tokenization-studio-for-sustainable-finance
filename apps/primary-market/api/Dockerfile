FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run shared:build && npm run primary-market:api:build

EXPOSE 3002

CMD ["node", "apps/primary-market/api/dist/src/main.js"]

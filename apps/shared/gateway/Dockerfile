FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run shared:build && npm run gateway:build

EXPOSE 3000

CMD ["node", "apps/shared/gateway/dist/main.js"]

FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run shared:build && npm run transaction-sender:build

EXPOSE 3010

CMD ["node", "apps/shared/transaction-sender/dist/main.js"]

FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run shared:build && npm run treasury:api:build

EXPOSE 3003

CMD ["node", "apps/treasury/api/dist/src/main.js"]

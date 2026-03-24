FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run shared:build && npm run ats:api:build

EXPOSE 3001

CMD ["node", "apps/ats/api/dist/main.js"]

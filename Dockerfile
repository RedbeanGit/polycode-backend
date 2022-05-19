FROM node:18.2.0-bullseye-slim

WORKDIR /app

COPY package*.json ./
COPY /dist ./dist

RUN yarn install --frozen-lockfile

CMD ["node", "dist/main.js"]
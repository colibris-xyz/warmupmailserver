FROM node:lts-alpine

ENV SETTINGS_FILE_PATH=/app/settings.json

RUN mkdir /app && mkdir /app/data && chown node:node /app/data
WORKDIR /app

COPY package.json yarn.lock ./
RUN apk add --no-cache --virtual .gyp python3 make g++ \
  && yarn install --immutable \
  && apk del .gyp

COPY src ./src

USER node

CMD ["node", "src/index.js"]

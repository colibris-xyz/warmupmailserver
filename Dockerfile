FROM node:lts-alpine

ENV SETTINGS_FILE_PATH=/app/settings.json
RUN apk add --no-cache --virtual .gyp python3 make g++
RUN mkdir /app && mkdir /app/data
WORKDIR /app
COPY . /app
RUN yarn install --immutable && chown -R node:node /app && apk del .gyp
USER node

CMD ["node", "src/index.js"]

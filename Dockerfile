FROM node:lts-alpine

ENV SETTINGS_FILE_PATH=/app/settings.json
RUN mkdir /app && chown node:node /app
USER node
WORKDIR /app
COPY --chown=node:node . /app
RUN yarn install --immutable

CMD ["node", "src/index.js"]
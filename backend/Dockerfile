FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js mockDb.js ./
COPY utils ./utils
RUN mkdir -p certificates && chown -R node:node /app

USER node
EXPOSE 5000
CMD ["npm", "start"]

FROM node:alpine

RUN mkdir /app

WORKDIR /app

COPY ./ ./

RUN npm install

RUN ln -s /app/config /config

VOLUME /config

CMD ["node", "radarr.js"]
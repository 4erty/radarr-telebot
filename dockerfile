FROM node:alpine

RUN apk add --update git

RUN mkdir /app && \
    git clone https://github.com/4erty/radarr-telebot.git /app

WORKDIR /app

RUN npm install

RUN ln -s /app/config /config

RUN apk del git

CMD ["node", "radar.js"]
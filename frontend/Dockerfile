FROM node:14.18.1-alpine

WORKDIR /app/frontend

COPY . /app/frontend

RUN npm install -g npm@8.1.1
RUN npm install

RUN npm run build

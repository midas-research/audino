FROM node:13.13.0

WORKDIR /app/frontend

COPY . /app/frontend

RUN npm install -g npm@6.14.4
RUN npm install

RUN npm run build

FROM node:18-alpine

ENV NODE_ENV production

RUN mkdir /audino-frontend

WORKDIR /audino-frontend

COPY . .

RUN npm install --production

RUN npm run build

RUN npm i -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-p", "3000"]
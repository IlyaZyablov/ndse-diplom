FROM node:19.8-alpine

WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY ./src src/

CMD ["npm", "start"]
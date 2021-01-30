FROM node:15

WORKDIR /opt/app

COPY package*.json ./
RUN npm i

COPY . .

RUN npm  build

CMD [ "node", "dist/src/index.js" ]

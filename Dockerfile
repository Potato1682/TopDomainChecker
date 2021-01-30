FROM node:15

WORKDIR /opt/app

COPY package*.json ./
RUN npm i -g pnpm && pnpm i

COPY . .

CMD [ "node", "--require=ts-node/register", "src/index.ts" ]

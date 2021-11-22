FROM node:14 AS development

WORKDIR /usr/src/app

RUN npm i -g pnpm && pnpm install glob rimraf

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:14-alpine

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules

CMD ["node", "dist/main"]
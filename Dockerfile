FROM python:3.8.12-alpine3.14 AS python_builder

WORKDIR /usr/src/app

COPY requirements.txt .

RUN pip install --user -r requirements.txt

FROM node:14.18.1 AS node_builder

WORKDIR /usr/src/app

RUN npm i -g pnpm && pnpm install glob rimraf

ARG GITHUB_TOKEN
RUN echo $GITHUB_TOKEN

ENV GITHUB_TOKEN=$GITHUB_TOKEN

COPY .npmrc .
COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:14.18.1-alpine3.14

RUN apk update \
    && apk --no-cache --update add bash build-base

WORKDIR /usr/src/app

COPY --from=python_builder /root/.local /root/.local
COPY --from=node_builder /usr/src/app/dist ./dist
COPY --from=node_builder /usr/src/app/node_modules ./node_modules

ENV PATH=/root/.local:$PATH

# Migrations
COPY tsconfig.json .
COPY package.json .
COPY Makefile .
COPY bin bin
COPY src src

CMD ["bash", "bin/run.sh"]
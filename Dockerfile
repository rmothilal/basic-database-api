FROM node:10.15.3-alpine
WORKDIR /opt/basic-database-api

RUN apk add --no-cache -t build-dependencies git make gcc g++ python libtool autoconf automake \
    && cd $(npm root -g)/npm \
    && npm config set unsafe-perm true

COPY migrations /opt/basic-database-api/migrations
COPY seeds /opt/basic-database-api/seeds
COPY modules /opt/basic-database-api/modules
COPY package.json package-lock.json* /opt/basic-database-api/
COPY src /opt/basic-database-api/src
COPY config /opt/basic-database-api/config

RUN npm install --production

RUN apk del build-dependencies

EXPOSE 3002
CMD ["npm", "run", "start"]

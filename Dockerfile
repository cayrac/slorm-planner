FROM httpd:alpine

ENV NODE_ENV=production

RUN apk add --no-cache nodejs npm apache2 openrc

RUN mkdir sources

WORKDIR /usr/local/apache2/sources

COPY angular.json .
COPY package.json .
COPY tsconfig.json .
COPY src src

RUN npm install

RUN ln -s node_modules/.bin/ng /bin/ng

RUN npm run build

WORKDIR /usr/local/apache2

RUN cp -rf sources/dist dist

RUN rm -rf sources
RUN rm /bin/ng

EXPOSE 8080

COPY httpd.conf /usr/local/apache2/conf/httpd.conf
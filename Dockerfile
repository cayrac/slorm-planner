FROM httpd:alpine

ENV NODE_ENV=production

COPY angular.json .
COPY package.json .
COPY tsconfig.json .
COPY src src

RUN apk add --no-cache nodejs=14.17.6-r0 npm apache2 openrc

RUN npm install

RUN ln -s node_modules/.bin/ng /bin/ng

RUN npm run build

EXPOSE 8080

COPY httpd.conf /usr/local/apache2/conf/httpd.conf

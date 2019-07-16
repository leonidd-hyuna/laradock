FROM node:6-alpine

RUN echo ========CAPI_SERVER_INSTALLING================================================
USER root
# Create app directory
RUN mkdir -p /app
WORKDIR /app

RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base \
    vim

RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash openssh make python git curl g++

RUN mkdir -p /app/logs

CMD mkdir logs
CMD touch logs/capi.log

RUN npm config set user 0
RUN npm config set unsafe-perm true
RUN npm install

RUN npm install --global yarn
RUN npm install -g supervisor
RUN npm install -g bunyan
RUN npm install -g node-inspector
RUN npm install --global gulp

COPY conf/config-local.js /app/conf/config-local.js
COPY package.json /app/package.json
COPY server.js /app/server.js

WORKDIR /app/

#ENV NPM_CONFIG_PREFIX=$HOME/.npm-global
#ENV PATH=$PATH:$HOME/.npm-global/bin
#RUN mkdir /home/node/.npm-global
#CMD chomd -R 777 /home/node/.npm-global
#ENV PATH=/home/node/.npm-global/bin:$PATH
#ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
RUN npm install -g nodemon
## Create app directory
#WORKDIR /app
#RUN chown -R node:node /app
#
#USER node
#RUN mkdir -p /app && chown -R node:node /app
#WORKDIR /app
#RUN mkdir -p /app/logs
#CMD touch logs/capi.log
#RUN mkdir -p conf
#
#USER root
#RUN apk add --update \
#    python \
#    python-dev \
#    py-pip \
#    build-base
#
#RUN apk update \
#    && apk upgrade \
#    && apk add --no-cache bash openssh make python git curl g++
#
#RUN npm conf set user 0
#RUN npm conf set unsafe-perm true
#RUN npm -g config set user root
#USER node
#
##WORKDIR /app
##ADD conf/default-local.js /app/conf/default-local.js
#ADD package.json /app/package.json
#ADD server.js /app/server.js
#
##COPY ./default-local.js /app/config/default-local.js
##COPY ./package.json /app/package.json
##COPY ./server.js /app/server.js
#
##RUN npm install
###RUN npm install --global yarn
##RUN npm install -g supervisor
##RUN npm install -g bunyan
##RUN npm install --global gulp
#
##COPY default-local.js /app/config/default-local.js
##COPY package.json /app/package.json
##COPY server.js /app/server.js
#RUN npm install
#USER root
#CMD chown node:node /home/node/.npm-global
#USER node
#WORKDIR /app

#EXPOSE 9200, 9042

ENTRYPOINT ["sh", "/app/docker/entrypoint.sh"]
#CMD ["nodemon", "server.js"]

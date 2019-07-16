#!/bin/bash

npm install
npm install - yarn
#npm install -g supervisor
#npm install -g bunyan
#npm install -g node-inspector
#npm install --global gulp

mkdir -p logs
yarn
#npm run add-hooks
#npm run copy-public-lib
#exec "$@"

nodemon server
#nodemon server.js
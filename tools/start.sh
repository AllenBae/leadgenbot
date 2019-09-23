#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  NODE_PATH=./bundle/ node bundle/server/server.js
else
  ./node_modules/.bin/webpack --watch --mode=development
  # after first build, webpack will trigger start-dev-server.sh to start our dev server
fi

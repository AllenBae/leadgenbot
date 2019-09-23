#!/bin/sh

export $(cat .env | xargs)
if [ -f .redis.env ]; then
  ./tools/redis_local.sh
  export $(cat .redis.env | xargs)
fi

if [ -n $TUNNEL_METHOD ]
then
  if [ $TUNNEL_METHOD == "localtunnel" ]
    then
      NODE_ENV=dev NODE_PATH=. babel-node ./server/localtunnel.js &

      echo "Waiting tunnel to launch on 5001..."

      while ! nc -z localhost 5001; do
        sleep 0.1 # wait for 1/10 of the second before check again
      done
  elif [ $TUNNEL_METHOD == "ngrok" ]
    then
      echo "Starting ngrok to port 5000"
      ngrok http 5000 >/dev/null 2>&1 &

      while ! nc -z localhost 4040; do
        sleep 0.1 # wait for 1/10 of the second before check again
      done
  fi
fi

NODE_ENV=dev NODE_PATH=. nodemon ./server/server.js --watch ./server --exec babel-node

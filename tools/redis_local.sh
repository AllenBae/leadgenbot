#!/bin/sh

PORT=$(python -S -c "import random;print random.randrange(10000,20000)")
DIR=./var/redis/$PORT
CONF=$DIR/redis.conf
REDISURL=redis://localhost:$PORT

mkdir -p $DIR
touch $CONF
echo "dir ${DIR}" >>$CONF
echo 'redis server will run on port' $PORT ' with db in path ' $DIR
redis-server $CONF --port $PORT &
sed -i.bak "s~REDIS_URL=\(.*\)~REDIS_URL=$REDISURL~" ./.redis.env

#/bin/sh

NGROK_TIMEOUT=60
NGROK_PORT=5000
#NGROK_OPT="-host-header=rewrite"
NGROK_PID_FILE="./.ngrok.pid.bak"

exit_with_error()
{
    popd > /dev/null
    exit 1
}

start()
{
    #
    # 1. Start ngrok
    #
    echo "Starting ngrok http on $NGROK_PORT"
    ps="$(pgrep -f "ngrok http $NGROK_OPT $NGROK_PORT")"
    if ! [ -z "$ps" ]; then
        echo "Error: ngrok is already running"
        exit_with_error
    else
        cat /dev/null > $NGROK_PID_FILE
        ngrok http $NGROK_OPT $NGROK_PORT > /dev/null &
        sleep 1
        pgrep ngrok > $NGROK_PID_FILE
        pid="$(cat $NGROK_PID_FILE)"
        if [ -z $pid ]; then
            echo "Error: Failed to start ngrok"
            exit_with_error
        fi
        n=0
        while (( $n <= $NGROK_TIMEOUT ))
        do
            if [ -z "$(./ngrok_hostname.sh https localhost:$NGROK_PORT)" ]; then
                printf %s "."
                n=$(( n+1 ))
                sleep 3
            else
                echo ""
                break
            fi
        done
    fi

    ngrok_host="$(./ngrok_hostname.sh https localhost:$NGROK_PORT)"
    if [ -z "$ngrok_host" ]; then
        echo "Error: Failed to start ngrok"
        exit_with_error
    fi
    echo "http://localhost:$NGROK_PORT -> $ngrok_host"

    #
    # 2. Rewrite .env file
    #
    sed -i.bak "s~HEROKU_LOCAL_URL=\(.*\)~HEROKU_LOCAL_URL=$ngrok_host~" ../.env
}

stop()
{
    echo "Stopping ngrok"
    pid="$(cat $NGROK_PID_FILE)"
    if ! [ -z $pid ]; then
        kill $pid
    fi
}

restart()
{
    stop
    start
}

pushd tools > /dev/null
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    *)
       echo "Usage: ngrok_controller.sh start|stop|restart" >&2
       exit_with_error
       ;;
esac
popd > /dev/null

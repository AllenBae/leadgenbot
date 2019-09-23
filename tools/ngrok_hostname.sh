#!/bin/sh

# To retrieve the ngrok'd URL of an HTTP service running locally on :3000, use:
#
#     $ ./ngrok_hostname.sh http localhost:3000
#

usage()
{
    echo "Usage: ngrok_hostname.sh <protocol> <host>:<port>" >&2
    echo "" >&2
    echo "ex) ./ngrok_hostname.sh http localhost:3000" >&2
}

# Need 2 arguments
if [ $# -ne 2 ]; then
    usage
    exit 1
fi

# jq is required
if ! [ -x "$(command -v jq)" ]; then
    echo 'Error: jq is not installed' >&2
  exit 1
fi

# The protocol (http, https, etc) of the forwarded service
PROTO=$1

# The address of the forwarded service
ADDR=$2

# ngrok version
VER=$(ngrok -v | cut -f 3 -d ' ' | cut -f 1 -d '.')

if [ $VER -eq '1' ]; then
    json=$(curl -s localhost:4040/inspect/http \
               | grep -oP 'window.common[^;]+' \
               | sed 's/^[^\(]*("//' \
               | sed 's/")\s*$//' \
               | sed 's/\\"/"/g')
else
    json=$(curl -s localhost:4040/inspect/http \
               | grep 'window.common' \
               | sed 's/^[^\(]*("//' \
               | sed 's/");$//' \
               | sed 's/\\"/"/g')
fi

# Parse JSON for the URLs matching the configured `$ADDR`
hosts=$(echo $json \
    | jq -r ".Session.Tunnels \
    | values \
    | map(select(.Config.addr == \"$ADDR\") | .URL) | .[]")

echo "$hosts" | grep "^${PROTO}:"

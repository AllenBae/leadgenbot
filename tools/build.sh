#!/bin/sh

NODE_ENV=production ./node_modules/.bin/webpack --progress --mode=production
NODE_ENV=production ./node_modules/.bin/babel server --out-dir bundle/server/ --source-maps
NODE_ENV=production ./node_modules/.bin/babel common --out-dir bundle/common/ --source-maps
echo "All done!"

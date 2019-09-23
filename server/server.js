import bodyParser from 'body-parser';
import express from 'express';
import 'express-csv';
import http from 'http';
import request from 'request-promise';

import constant from 'common/constant';
import logger from 'common/logger';
import DataHandler from 'server/store/DataHandler';
import ExpressHelper from 'server/helper/ExpressHelper';
import FBGraphHelper from 'server/helper/FBGraphHelper';
import SocketIoHelper from 'server/helper/SocketIoHelper';

import authEndpoints from 'server/authEndpoint/index';
import noAuthEndpoints from 'server/noAuthEndpoint/index';
import checkForAccessTokenMiddleware from 'server/helper/AccessTokenHelper';

logger.info(`app will run with constant like: ${JSON.stringify(constant, null, 2)}`);

export function start(port) {
  const app = ExpressHelper(express(), process.cwd(), logger);
  app.use(bodyParser.json());

  if (!port) {
    port = parseInt(process.env.PORT || 5000, 10);
  }

  return DataHandler.get()
    .then((dh) => {
      logger.info(
        `data handler init as ${dh.datastoreType} ${JSON.stringify(dh.datastore.paths, null, 2)}`,
      );

      noAuthEndpoints.forEach((initFunc) => {
        initFunc(app, dh);
      });

      app.enableSecureCheckForFollowingRoutes(checkForAccessTokenMiddleware(dh));
      authEndpoints.forEach((initFunc) => {
        initFunc(app, dh);
      });
      app.disableSecureCheckForFollowingRoutes();

      if (process.env.NODE_ENV == 'dev') {
        const devEndpoints = require('server/devEndpoint/index').default;
        devEndpoints.forEach((initFunc) => {
          initFunc(app, dh);
        });
      }

      return dh;
    })
    .then(() => {
      if (process.env.TUNNEL_METHOD === 'localtunnel') {
        return new Promise((resolve, reject) => {
          if (process.env.NODE_ENV === 'dev') {
            request.get({
              uri: `http://localhost:${port+1}/localtunnel`
            })
            .then((body) => {
              constant.HEROKU_APP_URL = body;
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
          } else {
            resolve();
          }
        });
      } else if (process.env.TUNNEL_METHOD === 'ngrok') {
        return new Promise((resolve, reject) => {
          request.get({
            uri: 'http://localhost:4040/api/tunnels',
          })
          .then((body) => {
            const bodyobj = JSON.parse(body);
            constant.HEROKU_APP_URL = bodyobj.tunnels[1].public_url.replace('http://', 'https://');
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
        });
      } else {
        return true;
      }
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        const server = http.createServer(app);

        SocketIoHelper.startWebsocketServer(server);

        server.listen(port, (err) => {
          if (err) {
            reject(err);
          } else {
            logger.info(`Your app is listening on port ${server.address().port}`);
            if (process.env.NODE_ENV === 'dev') {
              logger.info(`Please access your server with tunnel:*** ${constant.HEROKU_APP_URL} ***`);
            }
            resolve(server);
          }
        });
      });
    });
}

if (require.main === module) {
  start()
    .then((_listener) => {
      FBGraphHelper.setWebsiteURL();
    }).catch((err) => {
      logger.error(`Unable to set Website URL: ${err.stack}`);
    });
}

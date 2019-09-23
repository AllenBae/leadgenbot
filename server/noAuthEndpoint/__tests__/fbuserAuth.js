import fs from 'fs-extra';
import request from 'request-promise';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';
import {start as startServer} from 'server/server';

const port = Math.floor(Math.random() * 10000 + 1024);
let express_server = null;

jest.mock('common/fbrequest', () => {
  return {
    get: jest.fn().mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        if (params.uri == 'https://graph.facebook.com/v2.11/4') {
          resolve({
            id: 4,
            name: 'zack',
            email: 'zack@fb.com',
          });
          return;
        } else {
          reject('err');
        }
      });
    }),
  };
});

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_fbuserauth',
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    WEBHOOK_PATH: '/webhook',
  };
});

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('odd_cases_of_auth', () => {
  let thedh = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      thedh.botConfig.config.permissions = {
        'zack-nono@fb.com': true,
      };
      return thedh.botConfig.save();
    })
    .then(() => {
      return startServer(port);
    })
    .then((listener) => {
      express_server = listener;
      // let us try getting access_token
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        qs: {
          userid: '4',
          accesstoken: 'helloworld',
        },
        resolveWithFullResponse: true,
      });
    })
    .catch((err) => {
      // as the email is not authorized, so must be denied
      expect(err.statusCode).toBe(401);
      // now we try getting access_token with incomplete params
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        qs: {
          userid: '4',
        },
        resolveWithFullResponse: true,
      });
    })
    .catch((err) => {
      // should be denied too
      expect(err.statusCode).toBe(401);
      // try again
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        resolveWithFullResponse: true,
      });
    })
    .catch((err) => {
      // should be denied too
      expect(err.statusCode).toBe(401);
      // final try
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        qs: {
          accesstoken: 'helloworld',
        },
        resolveWithFullResponse: true,
      });
    })
    .catch((err) => {
      // should be denied too
      expect(err.statusCode).toBe(401);
    });
});

afterAll((done) => {
  express_server.close(() => {
    fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
    done();
  });
});

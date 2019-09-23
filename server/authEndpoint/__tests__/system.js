import fs from 'fs-extra';
import request from 'request-promise';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';
import {start as startServer} from 'server/server';
import FBGraphHelper from '../../helper/FBGraphHelper';

const port = constant.port;
const sample_page_id = 4000;
const sample_page = {
  access_token: '12345',
  name: 'sample page',
  id: sample_page_id,
};
let express_server = null;

jest.mock('common/fbrequest', () => {
  return {
    get: jest.fn().mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        if (params.uri == 'https://graph.facebook.com/v2.11/oauth/access_token') {
          resolve({
            access_token: '9999',
          });
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4000') {
          resolve({
            access_token: '9999',
          });
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4') {
          resolve({
            id: 4,
            name: 'zack',
            email: 'zack@fb.com',
          });
        } else {
          reject('err');
        }
      });
    }),
    post: jest.fn().mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        if (params.uri == 'https://graph.facebook.com/v2.11/1234/subscriptions') {
          resolve();
        } else if (params.uri == 'https://graph.facebook.com/v2.11/4000/subscribed_apps') {
          resolve();
        } else if (params.uri == 'https://graph.facebook.com/v2.11/1234') {
          resolve();
        } else {
          reject('err');
        }
      });
    }),
  };
});

jest.mock('common/constant', () => {
  const port = Math.floor(Math.random() * 10000 + 1024);
  return {
    ACCESS_TOKEN_TTL: 30 * 60, // 30 minutes of seconds
    ACCESS_TOKEN_REAP_INTERVAL: 60 * 1000, // 1 min
    REDISCLOUD_URL: '',
    FB_APP_ID: 1234,
    FB_APP_ACCESS_TOKEN: '1234|5678',
    FB_APP_SECRET: 'helloworld',
    WEBHOOK_VERIFY_TOKEN: 'jedi',
    HEROKU_APP_URL: `http://localhost:${port}`,
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_system',
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    PAGE_ACCESS_TOKEN_KEY: 'page_access_token',
    port: port,
    WEBHOOK_PATH: '/webhook',
  };
});

jest.useFakeTimers();

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('first_user_is_admin_case', () => {
  return DataHandler.get()
    .then((_dh) => {
      return startServer(port);
    })
    .then((listener) => {
      express_server = listener;
      // try get without access_token, and this is the first user
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        qs: {
          userid: 4,
          accesstoken: 'hello',
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      const bodyobj = JSON.parse(resp.body);
      expect(bodyobj.user_name).toBeDefined();
      expect(bodyobj.user_email).toBeDefined();
      expect(bodyobj.access_token).toBeDefined();
      expect(bodyobj.access_token.length).toBeGreaterThan(1);

      return express_server.close();
    });
});

test('normal_authorized_case', () => {
  let thedh = null;
  let theat = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      thedh.botConfig.config.permissions = {
        'zack@fb.com': true,
      };
      return thedh.botConfig.save();
    })
    .then(() => {
      return startServer(port);
    })
    .then((listener) => {
      express_server = listener;
      // try get without access_token
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        qs: {
          userid: 4,
          accesstoken: 'hello',
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);

      const bodyobj = JSON.parse(resp.body);
      expect(bodyobj.user_name).toBeDefined();
      expect(bodyobj.user_email).toBeDefined();
      expect(bodyobj.access_token).toBeDefined();

      theat = bodyobj.access_token;

      return request.post({
        uri: `http://localhost:${port}/subscribe_page`,
        json: {
          page: sample_page,
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      return request.post({
        uri: `http://localhost:${port}/access_token`,
        json: {
          page_id: sample_page_id,
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      let data = fs.readJsonSync(
        `${constant.LOCAL_FILE_STORE_PATH}/access_token_default.json`,
      );
      expect(data).toEqual({
        page_access_token: '9999',
      });
      expect(FBGraphHelper.setWebsiteURL()).resolves.toBe(undefined);
      return express_server.close();
    });
});

afterAll(() => {
  fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
});

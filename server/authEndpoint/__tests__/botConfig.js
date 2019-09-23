import fs from 'fs-extra';
import request from 'request-promise';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';
import {start as startServer} from 'server/server';

const port = constant.port;

let express_server = null;

jest.mock('common/constant', () => {
  const port = Math.floor(Math.random() * 10000 + 1024);
  return {
    ACCESS_TOKEN_TTL: 30 * 60, // 30 minutes of seconds
    ACCESS_TOKEN_REAP_INTERVAL: 60 * 1000, // 1 min
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_botconfig',
    FB_APP_ID: 1234,
    FB_APP_ACCESS_TOKEN: '1234|5678',
    FB_APP_SECRET: 'helloworld',
    WEBHOOK_VERIFY_TOKEN: 'jedi',
    HEROKU_APP_URL: `http://localhost:${port}/`,
    port: port,
    WEBHOOK_PATH: '/webhook',
  };
});

jest.mock('common/fbrequest', () => {
  let greeting_msg = 'Default is jedi!';
  return {
    get: jest.fn().mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        if (params.uri == 'https://graph.facebook.com/v2.11/me/messenger_profile') {
          resolve({
            data: [
              {
                greeting: [
                  { locale: 'default', text: greeting_msg }
                ],
              },
            ],
          });
          return;
        }
        if (params.uri == 'https://graph.facebook.com/v2.11/4') {
          resolve({
            id: 4,
            name: 'zack',
            email: 'zack@fb.com',
          });
          return;
        }
        reject('err');
      });
    }),
    post: jest.fn().mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        if (params.uri === 'https://graph.facebook.com/v2.11/me/messenger_codes') {
          resolve({
            uri: 'https://via.placeholder.com/728x90.png'
          });
          return;
        }
        if (params.uri == 'https://graph.facebook.com/v2.11/me/messenger_profile') {
          greeting_msg = params.json.greeting[0].text;
          resolve();
          return;
        }
        reject('err');
      });
    }),
  };
});

jest.useFakeTimers();

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
  fs.writeJsonSync(
    `${constant.LOCAL_FILE_STORE_PATH}/access_token_default.json`,
    {
      page_access_token: '9999',
    }
  );
});

test('all', () => {
  let theat = null;
  return DataHandler.get()
    .then((dh) => {
      dh.botConfig.config.permissions = {
        'zack@fb.com': true,
      };
      return dh.botConfig.save();
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
      theat = JSON.parse(resp.body).access_token;
      return request.get({
        uri: `http://localhost:${port}/welcome_screen`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual('Default is jedi!');
      return request.post({
        uri: `http://localhost:${port}/welcome_screen`,
        qs: {
          access_token: theat,
        },
        json: {
          text: 'Now seth takes over!',
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      return request.get({
        uri: `http://localhost:${port}/welcome_screen`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual('Now seth takes over!');
      return request.get({
        uri: `http://localhost:${port}/parametric_code`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body).uri).toBeDefined();
    });
});

afterAll((done) => {
  express_server.close(() => {
    fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
    done();
  });
});

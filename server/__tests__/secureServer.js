import fs from 'fs-extra';
import request from 'request-promise';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';
import {start as startServer} from 'server/server';

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    LOCAL_FILE_STORE_PATH: './var/data_test_secure_server',
    ACCESS_TOKEN_REAP_INTERVAL: 1 * 1000,
    ACCESS_TOKEN_TTL: 4,
    WEBHOOK_PATH: '/webhook',
  };
});

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
        }
        reject('err');
      });
    }),
  };
});

jest.useFakeTimers();

let sample_questions = [
  {
    'type': 'greeting',
    'text': 'hello',
  },
  {
    'type': 'question',
    'text': 'world',
    'options': [
      {
        'text': 'jedi',
        'resp_payload': 'jedi',
      }
    ],
  },
  {
    'type': 'input',
    'text': 'your name',
  },
];

let sample_csv = [
  '\"uid\",\"q1\",\"payload1\",\"timeofmessage1\",\"q2\",\"payload2\",\"timeofmessage2\"',
  '\"4\",\"1\",\"hello\",\"19700101\",,,',
  '\"5\",,,,\"2\",\"hello\",\"19700101\"',
  '',
].join('\r\n');

function user_response(qid) {
  return {
    qid: qid,
    timeOfMessage: 19700101,
    payload: 'hello'
  };
}

const port = Math.floor(Math.random() * 10000 + 1024);
const SAMPLE_USERID = 4;
const SAMPLE_USER_ACCESSTOKEN = 'helloworld';
let express_server = null;

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
  fs.outputJsonSync(
    `${constant.LOCAL_FILE_STORE_PATH}/question_flow_default.json`,
    sample_questions,
  );
});

test('all', () => {
  let thedh = null;
  let theat = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      return Promise.all([
        dh.getUserResponse(4)
          .then((user_response_mgr) => {
            user_response_mgr.push(user_response(1));
          }),
        dh.getUserResponse(5)
          .then((user_response_mgr) => {
            user_response_mgr.push(user_response(2));
          }),
      ]);
    })
    .then(() => {
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
        uri: `http://localhost:${port}/download_leads`,
        resolveWithFullResponse: true,
      });
    })
    .catch((resp) => {
      // should be denied
      expect(resp.statusCode).toBe(401);
      // now let us try getting access_token
      return request.get({
        uri: `http://localhost:${port}/auth/fbuser`,
        qs: {
          userid: SAMPLE_USERID,
          accesstoken: SAMPLE_USER_ACCESSTOKEN,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      theat = JSON.parse(resp.body).access_token;
      // but let us try to fool the system
      return request.get({
        uri: `http://localhost:${port}/download_leads`,
        qs: {
          access_token: theat + 'hello',
        },
        resolveWithFullResponse: true,
      });
    })
    .catch((resp) => {
      // must be denied
      expect(resp.statusCode).toBe(401);
      // now with access_token try again
      return request.get({
        uri: `http://localhost:${port}/download_leads`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      // should work this time
      expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(resp.body).toBe(sample_csv);
      // and now let us wait for half of TTL time
      jest.advanceTimersByTime(constant.ACCESS_TOKEN_TTL * 1000 / 2);
      return request.get({
        uri: `http://localhost:${port}/download_leads`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      // we should still be good
      expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(resp.body).toBe(sample_csv);
      // and now let us wait for access_token expired
      jest.advanceTimersByTime(constant.ACCESS_TOKEN_TTL * 1000 + 10);
      // and with expired access_token try again
      return request.get({
        uri: `http://localhost:${port}/download_leads`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .catch((resp) => {
      // must be denied again
      expect(resp.statusCode).toBe(401);
    });
});

afterAll((done) => {
  express_server.close(() => {
    fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
    done();
  });
});

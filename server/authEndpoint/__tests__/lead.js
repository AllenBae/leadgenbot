import fs from 'fs-extra';
import request from 'request-promise';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';
import {start as startServer} from 'server/server';

jest.mock('common/constant', () => {
  return {
    ACCESS_TOKEN_TTL: 30 * 60, // 30 minutes of seconds
    ACCESS_TOKEN_REAP_INTERVAL: 60 * 1000, // 1 min
    GRAPH_BASE_URL: 'https://graph.facebook.com/v2.11',
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_lead',
    WEBHOOK_PATH: '/webhook',
  };
});

jest.useFakeTimers();

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
        } else {
          reject('err');
        }
      });
    }),
  };
});

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

function user_response(qid) {
  return {
    qid: qid, 
    timeOfMessage: 19700101, 
    payload: 'hello'
  };
}

const port = Math.floor(Math.random() * 10000 + 1024);
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
      thedh.botConfig.config.permissions = {
        'zack@fb.com': true,
      };
      return Promise.all([
        thedh.botConfig.save(),
        thedh.getUserResponse(4)
          .then((user_response_mgr) => {
            user_response_mgr.push(user_response(1));
          }),
        thedh.getUserResponse(5)
          .then((user_response_mgr) => {
            user_response_mgr.push(user_response(2));
          }),
      ]);
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
        uri: `http://localhost:${port}/download_leads`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(resp.body).toBe([
        '\"uid\",\"q1\",\"payload1\",\"timeofmessage1\",\"q2\",\"payload2\",\"timeofmessage2\"',
        '\"4\",\"1\",\"hello\",\"19700101\",,,',
        '\"5\",,,,\"2\",\"hello\",\"19700101\"',
        '',
      ].join('\r\n'));

      fs.removeSync(`${constant.LOCAL_FILE_STORE_PATH}/user_response_4.json`);
      fs.removeSync(`${constant.LOCAL_FILE_STORE_PATH}/user_response_5.json`);
      return request.get({
        uri: `http://localhost:${port}/download_leads`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      // after delete all user responses, the csv file should be empty
      expect(resp.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(resp.body).toBe([
        '\"uid\",\"q1\",\"payload1\",\"timeofmessage1\",\"q2\",\"payload2\",\"timeofmessage2\"',
        '',
      ].join('\r\n'));
    });
});

afterAll((done) => {
  express_server.close(() => {
    fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
    done();
  });
});

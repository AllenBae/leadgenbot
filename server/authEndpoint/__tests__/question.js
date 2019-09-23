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
    LOCAL_FILE_STORE_PATH: './var/data_test_endpoint_question',
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

const port = Math.floor(Math.random() * 10000 + 1024);

let sample_questions = fs.readJsonSync('./sample/data/question_flow_default.json');
let sample_questions_modified = [].concat(sample_questions, [{
  'type': 'greeting',
  'text': 'jedi',
}]);

let express_server = null;

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
  fs.writeJsonSync(
    `${constant.LOCAL_FILE_STORE_PATH}/question_flow_default.json`,
    sample_questions,
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
        uri: `http://localhost:${port}/questions`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(sample_questions);
      return request.post({
        uri: `http://localhost:${port}/questions`,
        qs: {
          access_token: theat,
        },
        json: sample_questions_modified,
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      return request.get({
        uri: `http://localhost:${port}/questions`,
        qs: {
          access_token: theat,
        },
        resolveWithFullResponse: true,
      });
    })
    .then((resp) => {
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(sample_questions_modified);
    });
});

afterAll((done) => {
  express_server.close(() => {
    fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
    done();
  });
});

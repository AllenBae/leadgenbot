import fs from 'fs-extra';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_user_response',
  };
});

function user_response(qid) {
  return {
    qid: qid, 
    timeOfMessage: 19700101, 
    payload: 'hello'
  };
}

beforeAll(() => {
  constant.LOCAL_FILE_STORE_PATH = './var/data_test_user_response';
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('all', () => {
  let thedh = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      return dh.getUserResponse(4)
        .then((user_response_mgr) => {
          return user_response_mgr.push(user_response(1));
        })
        .then((user_response_mgr) => {
          return user_response_mgr.push(user_response(2));
        });
    })
    .then(() => {
      expect(fs.readJsonSync(
        `${thedh.datastore.paths.user_response}_4.json`,
      ))
      .toMatchObject([
        {qid: 1, timeOfMessage: 19700101, payload: 'hello'},
        {qid: 2, timeOfMessage: 19700101, payload: 'hello'},
      ]);
    });
});

afterAll(() => {
  fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
});

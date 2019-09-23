import fs from 'fs-extra';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_localfiledatastore',
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
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('all', () => {
  let thedh = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      return Promise.all([
        dh.getUserResponse(4)
          .then((user_response_mgr) => {
            return user_response_mgr.push(user_response(1));
          }),
        dh.getUserResponse(5)
          .then((user_response_mgr) => {
            return user_response_mgr.push(user_response(1));
          }),
      ]);
    })
    .then(() => {
      return thedh.datastore._scan(thedh.datastore.paths.user_response);
    })
    .then((keys) => {
      expect(keys).toMatchObject(
        ['4', '5'],
      );
      return thedh.getUserResponse(4);
    })
    .then((user_resp_mgr) => {
      return user_resp_mgr.del();
    })
    .then(() => {
      expect(fs.pathExistsSync(
        `${constant.LOCAL_FILE_STORE_PATH}/user_response_4.json`,
      )).toBe(false);
    });
});

afterAll(() => {
  fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
});

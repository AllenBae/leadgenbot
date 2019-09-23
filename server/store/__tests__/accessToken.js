import fs from 'fs-extra';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_accesstoken',
  };
});

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('all', () => {
  let thedh = null;
  let theatmgr = null;
  return DataHandler.get()
    .then((datahandler) => {
      thedh = datahandler;
      return thedh.getAccessToken();
    })
    .then((at_mgr) => {
      theatmgr = at_mgr;
      expect(theatmgr.get('hello')).toBe(null);
      return theatmgr.update({ page_access_token: '12345' });
    })
    .then(() => {
      let data = fs.readJsonSync(
        `${constant.LOCAL_FILE_STORE_PATH}/access_token_default.json`,
      );
      expect(data).toEqual({ page_access_token: '12345' });
      return theatmgr.load();
    })
    .then(() => {
      expect(theatmgr.get('page_access_token')).toEqual('12345');
    });
});

afterAll(() => {
  fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
});

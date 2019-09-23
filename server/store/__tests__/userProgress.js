import fs from 'fs-extra';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_user_progress',
  };
});

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('all', () => {
  let thedh = null;
  return DataHandler.get()
    .then((dh) => {
      thedh = dh;
      return thedh.getUserProgress(4);
    })
    .then((user_progress_mgr) => {
      return user_progress_mgr.update({
        expectRespType: 'quick_reply',
        nextQid: 2,
        stopAtQid: 1,
      });
    })
    .then(() => {
      expect(fs.readJsonSync(
        `${thedh.datastore.paths.user_progress}_4.json`,
      ))
      .toMatchObject({
        expectRespType: 'quick_reply',
        nextQid: 2,
        stopAtQid: 1,
      });
      return thedh.getUserProgress(4);
    })
    .then((user_progress_mgr) => {
      expect(user_progress_mgr.userProgress).toMatchObject({
        expectRespType: 'quick_reply',
        nextQid: 2,
        stopAtQid: 1,
      });
    });
});

afterAll(() => {
  fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
});

import fs from 'fs-extra';

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';

jest.mock('common/constant', () => {
  return {
    REDISCLOUD_URL: '',
    LOCAL_FILE_STORE_PATH: './var/data_test_botconfig',
    ACCESS_TOKEN_REAP_INTERVAL: 1 * 1000,
    ACCESS_TOKEN_TTL: 2,
  };
});

jest.useFakeTimers();

const SAMPLE_EMAIL = 'liyu@fb.com';

beforeAll(() => {
  fs.ensureDirSync(constant.LOCAL_FILE_STORE_PATH);
});

test('save_load', () => {
  let thedh = null;
  return DataHandler.get()
    .then((datahandler) => {
      thedh = datahandler;
      expect(thedh.botConfig.config).toEqual({});
      thedh.botConfig.config.hello = 'world';
      return thedh.botConfig.save();
    })
    .then(() => {
      let data = fs.readJsonSync(
        `${constant.LOCAL_FILE_STORE_PATH}/bot_config_default.json`,
      );
      expect(data).toEqual({ hello: 'world' });
      return thedh.botConfig.load();
    })
    .then(() => {
      expect(thedh.botConfig.config).toEqual({ hello: 'world' });
    });
});

test('access_token_reap', () => {
  let thedh = null;
  return DataHandler.get()
    .then((datahandler) => {
      thedh = datahandler;
      expect(thedh.botConfig.checkEmailForAuthorized(SAMPLE_EMAIL)).toBeNull();
      thedh.botConfig.config.permissions = {
        [SAMPLE_EMAIL]: true,
      };
      return thedh.botConfig.save();
    })
    .then(() => {
      expect(thedh.botConfig.config.permissions.hasOwnProperty(SAMPLE_EMAIL)).toBeTruthy();
      expect(thedh.botConfig.checkEmailForAuthorized(SAMPLE_EMAIL)).not.toBeNull();
      // advance half of TTL
      jest.advanceTimersByTime(constant.ACCESS_TOKEN_TTL * 1000/2);
      // the access_token should still there
      expect(thedh.botConfig.inMemConfig.hasOwnProperty('accessTokens')).toBeTruthy();
      expect(thedh.botConfig.inMemConfig.accessTokens[SAMPLE_EMAIL].hasOwnProperty('hash')).toBeTruthy();
      // now use the access_token again, it should be reseted for TTL
      expect(thedh.botConfig.checkEmailForAuthorized(SAMPLE_EMAIL)).not.toBeNull();
      expect(thedh.botConfig.inMemConfig.accessTokens[SAMPLE_EMAIL].hasOwnProperty('ttl')).toBeTruthy();
      expect(thedh.botConfig.inMemConfig.accessTokens[SAMPLE_EMAIL].ttl).toBe(constant.ACCESS_TOKEN_TTL);
      // finally advance the time to make our access_token expire
      jest.advanceTimersByTime(constant.ACCESS_TOKEN_TTL * 1000 + 10);
      expect(thedh.botConfig.initInMemConfig).not.toContain('accessTokens');
    });
});

afterAll(() => {
  fs.removeSync(constant.LOCAL_FILE_STORE_PATH);
});

import constant from 'common/constant';
import DataHandler from 'server/store/DataHandler';

function user_response(qid) {
  return {
    qid: qid, 
    timeOfMessage: 19700101, 
    payload: 'hello'
  };
}

jest.mock('redis', () => {
  const redis = require('redis-js');
  return redis;
});

beforeAll(() => {
  constant.REDISCLOUD_URL = 'http://localhost:12345';
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
      return thedh.getUserResponse(5);
    })
    .then((user_response_mgr) => {
      expect(user_response_mgr.userResponses).toHaveLength(1);
      expect(user_response_mgr.userResponses[0]).toEqual({
        qid: 1, 
        timeOfMessage: 19700101, 
        payload: 'hello'
      });
    });
});

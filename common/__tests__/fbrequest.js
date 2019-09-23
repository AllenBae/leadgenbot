import fbrequest from 'common/fbrequest';

const fb_graph_api = 'https://graph.facebook.com/v2.12/me';
const sample_resp = {
  'id': '10207432638402470',
  'name': 'YU LI',
};

jest.mock('request-promise', () => {
  const sample_resp = {
    'id': '10207432638402470',
    'name': 'YU LI',
  };
  const sample_error_resp = {
    error: 'oops',
  };
  let first_resp = (_params) => {
    return Promise.resolve(JSON.stringify(sample_resp));
  };
  let second_resp = (_params) => {
    return Promise.resolve(JSON.stringify(sample_error_resp));
  };
  let third_resp = (_params) => {
    return Promise.reject('what?');
  };

  return jest.fn()
    .mockImplementationOnce(first_resp)
    .mockImplementationOnce(second_resp)
    .mockImplementationOnce(third_resp)
    .mockImplementationOnce(first_resp)
    .mockImplementationOnce(second_resp)
    .mockImplementationOnce(third_resp)
    .mockImplementationOnce((_params) => {
      return Promise.resolve(['this will not pass JSON.parse']);
    })
    .mockImplementation((params) => {
      return new Promise((resolve, reject) => {
        reject('err');
      });
    });
});

test('get', () => {
  let params = {
    uri: fb_graph_api,
    qs: {
      fields: 'id,name',
    },
  };
  return fbrequest.get(params)
    .then((bodyobj) => {
      expect(bodyobj).toEqual(sample_resp);
      return fbrequest.get(params);
    })
    .catch((err) => {
      expect(err).toEqual('oops');
      return fbrequest.get(params);
    })
    .catch((err) => {
      expect(err).toEqual('what?');
    });
});

test('post', () => {
  let params = {
    uri: fb_graph_api,
    qs: {
      fields: 'id,name',
    },
  };
  return fbrequest.post(params)
    .then((bodyobj) => {
      expect(bodyobj).toEqual(sample_resp);
      return fbrequest.post(params);
    })
    .catch((err) => {
      expect(err).toEqual('oops');
      return fbrequest.post(params);
    })
    .catch((err) => {
      expect(err).toEqual('what?');
      return fbrequest.post(params);
    })
    .catch((err) => {
      expect(err).toBeInstanceOf(SyntaxError);
    });
});

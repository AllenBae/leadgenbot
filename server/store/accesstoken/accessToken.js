import logger from 'common/logger';

const KEY = 'default';

export default class AccessToken {
  constructor(datahandler) {
    this.datastore = datahandler.datastore;
    this.allAccessTokens = {};
  }

  load() {
    return new Promise((resolve, _reject) => {
      this.datastore._read(this.datastore.paths.access_token, KEY)
        .then((data) => {
          this.allAccessTokens = JSON.parse(data);
          resolve(this);
        })
        .catch((err) => {
          // any error in reading access token, fallback to no accesstoken
          logger.error(`load access_token failed with: ${JSON.stringify(err)}`);
          logger.info('create new access_token store.');
          this.allAccessTokens = {};
          resolve(this);
        });
    });
  }

  save() {
    return this.datastore._write(
      this.datastore.paths.access_token,
      KEY,
      JSON.stringify(this.allAccessTokens),
    )
    .then(() => {
      logger.info('access_token saved.');
      return this;
    })
    .catch((err) => {
      logger.error(`save access_token failed with ${JSON.stringify(err)}`);
      return err;
    });
  }

  update(options) {
    this.allAccessTokens = Object.assign({}, this.allAccessTokens, options);
    return this.save();
  }

  get(key) {
    return (key in this.allAccessTokens) ? this.allAccessTokens[key] : null;
  }
}

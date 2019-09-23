import logger from 'common/logger';
import moment from 'moment-timezone';

export default class UserResponse {
  constructor(datahandler) {
    this.datastore = datahandler.datastore;
    this.userID = null;
    this.userResponses = null;
  }

  currentDatestamp() {
    return moment().tz('Asia/Hong_Kong').format('YYYYMMDD');
  }

  load(userID) {
    this.userID = userID;
    return new Promise((resolve, _reject) => {
      this.datastore._read(this.datastore.paths.user_response, this.userID)
        .then((data) => {
          this.userResponses = JSON.parse(data);
          resolve(this);
        })
        .catch((err) => {
          logger.error(`load user ${this.userID} response failed with ${JSON.stringify(err)}`);
          logger.info(`create new response for user ${this.userID}`);
          this.userResponses = [];
          resolve(this);
        });
    });
  }

  save() {
    return this.datastore._write(
      this.datastore.paths.user_response,
      this.userID,
      JSON.stringify(this.userResponses),
    )
    .then(() => {
      logger.info(`user ${this.userID} response saved.`);
      return this;
    })
    .then(() => {
      this.datastore._zadd(
        this.datastore.paths.user_response_updated,
        this.currentDatestamp(),
        (new Date()).getTime(), // epoch
        this.userID,
      );

      // having a single key storing all last responsed time
      this.datastore._zadd(
        this.datastore.paths.user_response_updated,
        'all',
        (new Date()).getTime(), // epoch
        this.userID,
      );
    })
    .then(() => {
      logger.info(`user ${this.userID} response last updated saved with date ${this.currentDatestamp()}`);
      return this;
    })
    .catch((err) => {
      logger.error(`save user ${this.userID} response failed with ${JSON.stringify(err)}`);
      return err;
    });
  }

  push(response) {
    this.userResponses.push(response);
    return this.save();
  }

  del() {
    return this.datastore._del(this.datastore.paths.user_response, this.userID);
  }
}

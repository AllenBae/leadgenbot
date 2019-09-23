import AccessToken from 'server/store/accesstoken/accessToken';
import BotConfig from 'server/store/bot/config';
import constant from 'common/constant';
import LocalFileDataStore from 'server/store/datastore/LocalFileDatastore';
import QuestionFlow from 'server/store/question/questionFlow';
import RedisDataStore from 'server/store/datastore/RedisDatastore';
import UserProgress from 'server/store/user/userProgress';
import UserResponse from 'server/store/user/userResponse';
import UserProfile from 'server/store/user/userProfile';
import moment from 'moment-timezone';

let datahandler_singleton_promise = null;
let datahandler_singleton = null;

export default class DataHandler {

  static get() {
    if (datahandler_singleton_promise) {
      return datahandler_singleton_promise;
    }
    if (!datahandler_singleton) {
      datahandler_singleton_promise =
        DataHandler._get()
          .then((dh) => {
            datahandler_singleton = dh;
            datahandler_singleton_promise = null;
            return dh;
          });
      return datahandler_singleton_promise;
    }
    return Promise.resolve(datahandler_singleton);
  }

  static _get() {
    if (constant.REDISCLOUD_URL == '') {
      return (new DataHandler('local')).init();
    } else {
      return (new DataHandler('redis')).init();
    }
  }

  constructor(storeType) {
    this.datastoreType = storeType;
    this.datastore = null;
    this.botConfig = null;
    this.botAllDataUserResponse = null;
  }

  init() {
    let paths = {
      access_token: 'access_token',
      bot_config: 'bot_config',
      question_flow: 'question_flow',
      user_progress: 'user_progres',
      user_response: 'user_response',
      user_profile: 'user_profile',
      user_response_updated: 'user_response_updated',
    };

    switch (this.datastoreType) {
      case 'local':
        this.datastore = new LocalFileDataStore();
        this.datastore.paths = Object.keys(paths).reduce((acc, key) => {
          acc[key] = `${constant.LOCAL_FILE_STORE_PATH}/${paths[key]}`;
          return acc;
        }, {});
        break;
      case 'redis':
        this.datastore = new RedisDataStore();
        this.datastore.paths = paths;
        break;
    }

    this.botConfig = new BotConfig(this);

    return Promise.all([
      this.botConfig.load(),
    ])
    .then(() => {
      return this;
    });
  }

  getQuestionFlow(key) {
    return (new QuestionFlow(this)).load(key);
  }

  getUserResponse(userID) {
    return (new UserResponse(this)).load(userID);
  }

  scanUserResponses() {
    return this.datastore._scan(this.datastore.paths.user_response);
  }

  getResponedUsersBetween(start_date, end_date) {
    var start_moment = moment(start_date, 'YYYY/MM/DD');
    var end_moment = moment(end_date, 'YYYY/MM/DD');
    var current_moment = start_moment;

    var dates = [];
    do {
      dates.push(current_moment.format('YYYYMMDD'));
      current_moment.add(1, 'd');
    } while (current_moment.isSameOrBefore(end_moment));

    return Promise.all(dates.map((date_id) => {
      return this.datastore._zrange(
        this.datastore.paths.user_response_updated,
        date_id,
        0, -1
      );
    })).then((all_user_ids) => {
      return [].concat(...all_user_ids);
    });
  }

  getLastRespondedBetween(start_time, end_time) {
    return this.datastore._zrangebyscore(
      this.datastore.paths.user_response_updated,
      'all',
      start_time,
      end_time,
    );
  }

  getUserProgress(userID) {
    return (new UserProgress(this)).load(userID);
  }

  getAccessToken() {
    return (new AccessToken(this)).load();
  }

  getUserProfile(userID) {
    return (new UserProfile(this)).load(userID);
  }
}

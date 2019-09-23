import crypto from 'crypto';

import constant from 'common/constant';
import logger from 'common/logger';

const KEY = 'default';

/* reaper assumes dict to be in the form of
     {
       'group_name': {
         'key': { 'hash': '<value>', ttl: '<ttl>' }
       },
       ...
     }

   reaper will remove the key-hash pair when the ttl is down to zero,
   reaper will also remove the group_name when all key-hash pairs are
   removed.
 */
function startReaper(dict) {
  const _reap = () => {
    Object.keys(dict).forEach((group_name) => {
      const group = dict[group_name];
      let new_group_dict = {};
      Object.keys(group).forEach((key) => {
        const {ttl} = group[key];
        const new_ttl = ttl - constant.ACCESS_TOKEN_REAP_INTERVAL / 1000; // in seconds
        if (new_ttl > 0) {
          new_group_dict[key] = {
            hash: group[key].hash,
            ttl: new_ttl,
          };
        }
      });
      if (new_group_dict !== {}) {
        dict[group_name] = new_group_dict;
      } else {
        delete dict[group_name];
      }
    });
  };
  return setInterval(_reap, constant.ACCESS_TOKEN_REAP_INTERVAL);
}

export default class BotConfig {
  constructor(datahandler) {
    this.datastore = datahandler.datastore;
    this.config = {};
    this.initInMemConfig();
  }

  load() {
    return new Promise((resolve, _reject) => {
      this.datastore._read(this.datastore.paths.bot_config, KEY)
        .then((data) => {
          this.config = JSON.parse(data);
          resolve(this);
        })
        .catch((err) => {
          logger.error(`load bot config failed with: ${JSON.stringify(err)}`);
          logger.info('create new bot config.');
          this.config = {};
          resolve(this);
        });
    });
  }

  save() {
    return new Promise((resolve, _reject) => {
      this.datastore._write(
        this.datastore.paths.bot_config,
        KEY,
        JSON.stringify(this.config),
      )
      .then(() => {
        logger.info('bot config saved.');
        resolve(this);
      })
      .catch((err) => {
        logger.error(`saving bot config failed with: ${JSON.stringify(err)}`);
        resolve(this);
      });
    });
  }

  initInMemConfig() {
    this.inMemConfig = {};
    this.inMemConfigReaper = startReaper(this.inMemConfig);
  }

  getInMemConfigAccessToken(email) {
    if (!this.inMemConfig.accessTokens) {
      this.inMemConfig.accessTokens = {};
    }
    if (this.inMemConfig.accessTokens.hasOwnProperty(email)) {
      this.inMemConfig.accessTokens[email].ttl = constant.ACCESS_TOKEN_TTL;
    } else {
      // we generate access_token as sha(email+time)
      const hash = crypto.createHash('sha256')
        .update(`${email}+${(new Date()).getTime()}`)
        .digest('hex');
      this.inMemConfig.accessTokens[email] = {
        hash: hash,
        ttl: constant.ACCESS_TOKEN_TTL,
      };
    }
    return this.inMemConfig.accessTokens[email].hash;
  }

  checkEmailForAuthorized(email) {
    const permissions = this.config.permissions || {};
    if (email in permissions) {
      return this.getInMemConfigAccessToken(email);
    } else {
      return null;
    }
  }

  checkAccessToken(access_token) {
    if (this.inMemConfig.accessTokens) {
      const found = Object.keys(this.inMemConfig.accessTokens).find((key) => {
        const {hash} = this.inMemConfig.accessTokens[key];
        return hash == access_token;
      });
      return found;
    }
    return false;
  }

  getSubscribedPage() {
    return this.config.subscribedPage;
  }

  setSubscribedPage(page) {
    if (!this.config.subscribedPage) {
      this.config.subscribedPage = {};
    }
    this.config.subscribedPage.name = page.name;
    this.config.subscribedPage.id = page.id;
    return this;
  }

  updateSettings(settings) {
    this.config = Object.assign({}, this.config, settings);
  }

  getCampaignPayload() {
    return this.config.campaign_payload;
  }

  getTargetAppID() {
    return this.config.target_app_id;
  }

  getDropboxAppKey() {
    if (this.config.dropboxIntegration) {
      return this.config.dropboxIntegration.appKey;
    } else {
      return null;
    }
  }

  setDropboxAppKey(key) {
    if (!this.config.dropboxIntegration) {
      this.config.dropboxIntegration = {};
    }
    this.config.dropboxIntegration.appKey = key;
    return this;
  }

}

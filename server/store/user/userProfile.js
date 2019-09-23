import logger from 'common/logger';

export default class UserProfile {
  constructor(datahandler) {
    this.datastore = datahandler.datastore;
    this.userID = null;
    this.userProfile = null;
    this.profileFetched = false;
    this.reminderSent = false;
  }

  load(userID) {
    this.userID = userID;
    return new Promise((resolve, _reject) => {
      this.datastore._read(this.datastore.paths.user_profile, this.userID)
        .then((data) => {
          this.userProfile = JSON.parse(data);
          this.profileFetched = true;
          resolve(this);
        })
        .catch((err) => {
          logger.error(`load user ${this.userID} profile failed with ${JSON.stringify(err)}`);
          logger.info(`marking UserID: ${this.userID} as not fetched`);
          this.userProfile = null;
          this.profileFetched = false;
          resolve(this);
        });
    });
  }

  isProfileFetched() {
    return this.profileFetched;
  }

  isReminderSent() {
    return this.reminderSent;
  }

  save() {
    return this.datastore._write(
      this.datastore.paths.user_profile,
      this.userID,
      JSON.stringify(this.userProfile),
    )
    .then(() => {
      logger.info(`user ${this.userID} profile saved.`);
      return this;
    })
    .catch((err) => {
      logger.error(`save user ${this.userID} profile failed with ${JSON.stringify(err)}`);
      return err;
    });
  }

  update(profile) {
    this.userProfile = Object.assign({}, this.userProfile, profile);
    return this.save();
  }

  del() {
    return this.datastore._del(this.datastore.paths.user_profile, this.userID);
  }
}

import logger from 'common/logger';

export default class UserProgress {
  constructor(datahandler) {
    this.datastore = datahandler.datastore;
    this.userID = null;
    this.userProgress = null;
  }

  load(userID) {
    this.userID = userID;
    return new Promise((resolve, _reject) => {
      this.datastore._read(this.datastore.paths.user_progress, this.userID)
        .then((data) => {
          this.userProgress = JSON.parse(data);
          resolve(this);
        })
        .catch((err) => {
          logger.error(`load user ${this.userID} progress failed with: ${JSON.stringify(err)}`);
          logger.info(`create new progress for user ${this.userID}`);
          this.userProgress = [];
          resolve(this);
        });
    });
  }

  save() {
    return this.datastore._write(
      this.datastore.paths.user_progress,
      this.userID,
      JSON.stringify(this.userProgress),
    )
    .then(() => {
      logger.info(`user ${this.userID} progess saved.`);
      return this;
    })
    .catch((err) => {
      logger.error(`save user ${this.userID} progress failed with ${JSON.stringify(err)}`);
      return err;
    });
  }

  update(options) {
    this.userProgress = Object.assign({}, this.userProgress, options);
    return this.save();
  }

  isInProgress() {
    return (!Array.isArray(this.userProgress) && this.userProgress.expectRespType !== 'finished');
  }

  findNextQid(questionFlow, payload) {
    let { stopAtQid } = this.userProgress;
    let question = questionFlow.findQuestionWithQid(stopAtQid);
    if (question.options) {
      return questionFlow.findNextQidOfQuestionInOptions(question, stopAtQid, payload);
    } else if (question.elements) {
      return questionFlow.findNextQidOfQuestionInElements(question, stopAtQid, payload);
    } else {
      return questionFlow.findNextQidOfQuestion(question, stopAtQid);
    }
  }

  del() {
    return this.datastore._del(this.datastore.paths.user_progress, this.userID);
  }
}

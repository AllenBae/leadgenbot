import logger from 'common/logger';

const DEFAULT_QUESTION_FLOW_KEY = 'default';

export default class QuestionFlow {
  constructor(datahandler) {
    this.datastore = datahandler.datastore;
    this.key = null;
    this.questions = [];
  }

  load(key = DEFAULT_QUESTION_FLOW_KEY) {
    this.key = key;
    return new Promise((resolve, _reject) => {
      this.datastore._read(this.datastore.paths.question_flow, key)
        .then((data) => {
          this.questions = JSON.parse(data);
          resolve(this);
        })
        .catch((err) => {
          logger.error(`load question flow ${key} failed with ${JSON.stringify(err)}`);
          logger.info(`create new question flow ${key}`);
          this.questions = [];
          resolve(this);
        });
    });
  }

  save(key = DEFAULT_QUESTION_FLOW_KEY) {
    this.key = key;
    return this.datastore._write(
      this.datastore.paths.question_flow,
      key,
      JSON.stringify(this.questions),
    )
    .then(() => {
      logger.info(`question flow ${key} saved.`);
      return this;
    })
    .catch((err) => {
      logger.error(`save question flow ${key} failed with ${JSON.stringify(err)}`);
      return err;
    });
  }

  findQidWithAnchor(anchor) {
    if (anchor == '#end') {
      return this.questions.length;
    } else {
      return this.questions.findIndex((question) => {
        return question.anchor && question.anchor == anchor;
      });
    }
  }

  findQuestionWithQid(qid) {
    if (qid >= 0 && qid < this.questions.length) {
      return this.questions[qid];
    } else {
      return null;
    }
  }

  findNextQidOfQuestion(question, questionID) {
    if (question.next) {
      return this.findQidWithAnchor(question.next);
    } else {
      return questionID + 1;
    }
  }

  findNextQidOfQuestionInOptions(question, questionID, payload) {
    let option = question.options.find((option) => {
      return option.resp_payload == payload;
    });
    if (option && option.next) {
      return this.findQidWithAnchor(option.next);
    } else {
      return questionID + 1;
    }
  }

  findNextQidOfQuestionInElements(question, questionID, payload) {
    var nextQid = null;

    question.elements.forEach((element) => {
      if (nextQid) {
        return;
      }

      if (element.buttons) {
        let button = element.buttons.find((button) => {
          return button.next === payload;
        });

        if (button && button.next) {
          nextQid = this.findQidWithAnchor(button.next);
        }
      }
    });

    if (nextQid) {
      return nextQid;
    } else {
      return questionID + 1;
    }
  }
}

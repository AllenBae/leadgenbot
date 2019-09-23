export default class QuestionFlowUtil {

  constructor(questions, questionConfig) {
    this.questions = questions;
    this.questionConfig = questionConfig;
  }

  getAllAnchors() {
    const allAnchors = this.questions.map((question, index) => {
      if (question.anchor) {
        return [question.anchor, index];
      } else {
        return undefined;
      }
    }).filter(n => n);
    // #end is a special anchor to the end
    return allAnchors.concat([['#end', this.questions.length]]);
  }

  updateQuestion(qid, newQuestion) {
    this.questionConfig.updateQuestion(qid, newQuestion);
  }

  updateQuestionOption(qid, optionIndex, newOption) {
    let options = this.questions[qid].options;
    let new_options = [].concat(
      options.slice(0, optionIndex),
      [newOption],
      options.slice(optionIndex+1),
    );
    let new_question = Object.assign({}, this.questions[qid], {'options': new_options});
    this.updateQuestion(qid, new_question);
  }

  findNextAttrsWithQidsInDefault(_qid, question, allAnchors) {
    if (question.next && allAnchors[question.next]) {
      return [{nextPayload: 'default', nextText: 'default', nextQid: allAnchors[question.next]}];
    } else {
      return [];
    }
  }

  findNextAttrsWithQidsInOptions(qid, question, allAnchors) {
    if (question.options) {
      let ret = [];
      let defaultOptionPayloads = [];
      let defaultOptionTexts = [];
      question.options.forEach((option) => {
        if (option.next && allAnchors[option.next]) {
          ret.push({
            nextPayload: option.resp_payload,
            nextText: option.text,
            nextQid: allAnchors[option.next],
          });
        } else {
          defaultOptionPayloads.push(option.resp_payload);
          defaultOptionTexts.push(option.text);
        }
      });
      if (defaultOptionPayloads.length > 0) {
        ret.push({
          nextPayload: defaultOptionPayloads.join(' | '),
          nextText: defaultOptionTexts.join(' | '),
          nextQid: qid + 1,
        });
      }
      return ret;
    } else {
      return [];
    }
  }

  findNextAttrsWithQidsInElements(qid, question, allAnchors) {
    if (question.elements) {
      let ret = [];
      let nonPostbackButtons = 0;
      question.elements.forEach((element) => {
        if (element.buttons) {
          element.buttons.forEach((button) => {
            if (button.next && allAnchors[button.next]) {
              ret.push({
                nextPayload: `postback => ${button.next}`,
                nextText: button.title,
                nextQid: allAnchors[button.next],
              });
            } else {
              nonPostbackButtons += 1;
            }
          });
        }
      });
      if (nonPostbackButtons > 0) {
        ret.push({
          nextPayload: `${nonPostbackButtons} buttons`,
          nextText: `${nonPostbackButtons} buttons`,
          nextQid: qid + 1,
        });
      }
      return ret;
    } else {
      return [];
    }
  }

  findAllNextAttrsWithQids(qid, question) {
    const allAnchors = this.getAllAnchors().reduce((acc, [anchor, index]) => {
      acc[anchor] = index;
      return acc;
    }, {});
    let ret = [];
    switch (question.type) {
      case 'greeting':
      case 'input':
      case 't&c':
      case 'image':
        ret = ret.concat(
          this.findNextAttrsWithQidsInDefault(qid, question, allAnchors),
        );
        break;
      case 'question':
        ret = ret.concat(
          this.findNextAttrsWithQidsInDefault(qid, question, allAnchors),
          this.findNextAttrsWithQidsInOptions(qid, question, allAnchors),
        );
        break;
      case 'carousel':
        ret = ret.concat(
          this.findNextAttrsWithQidsInDefault(qid, question, allAnchors),
          this.findNextAttrsWithQidsInElements(qid, question, allAnchors),
        );
        break;
      case 'confirmation':
        ret = ret.concat(
          this.findNextAttrsWithQidsInDefault(qid, question, allAnchors),
        );
        break;
    }
    return ret;
  }
}

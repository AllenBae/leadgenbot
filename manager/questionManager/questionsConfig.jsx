import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
import Modal from 'react-responsive-modal';

import constant from 'manager/constant';
import {questionSamples} from 'common/question';
import {questionCardGeneratorMap} from './questionCard/index';
import Anchor from './questionCard/anchor.jsx';
import AppEvent from './questionCard/appEvent.jsx';
import DataExport from './questionCard/dataExport.jsx';
import LeadQualtification from './questionCard/leadQualification.jsx';
import ConditionalLogicHelper from './questionCard/ConditionalLogicHelper.jsx';
import Link from 'manager/components/Link.jsx';
import QuestionChart from './questionChart.jsx';
import QuestionFlowUtil from './questionFlowUtil';
import {cx} from 'manager/components/utils';

const FIX_UIPADDING_HEIGHT = 300;

export default class QuestionsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      newQuestionType: 'greeting',
      inSaving: false,
      visibleQuestionCardId: null,
      visibleQuestionCardCss: null,
      showModalCopyQuestionJSONDialog: false,
      showModalPasteQuestionJSONDialog: false,
      showQuestionChart: true,
      uiPaddingHeight: 0,
      botConfig: {},
    };
    this.questionCardRefs = {};
    this.questionChartElem = null;
  }

  static getID() {
    return 'question_manager';
  }

  static getTitle() {
    return 'Manage Questions';
  }

  componentDidMount() {
    if (constant.DEV_MANAGER) {
      return;
    } else {
      const request = this.props.requestPromise;
      request.get({
        uri: `${constant.HEROKU_APP_URL}/questions`,
      })
      .then((body) => {
        toast.success('Questionaire loaded from server!');
        let question = JSON.parse(body);
        if (question.length === 0) {
          this.addNewQuestion();
        } else {
          this.setState({
            questions: question,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Oops, can not load questions!');
      });

      request.get({
        uri: `${constant.HEROKU_APP_URL}/dropbox/app_key`,
      })
      .then((data) => {
        const newBotConfig = Object.assign({}, this.state.botConfig, {dropboxAppKey: data});
        this.setState({botConfig: newBotConfig});
      })
      .catch((err) => {
        console.error(`load dropbox app_key failed with ${JSON.stringify(err)}`);
      });
    }
  }

  addNewQuestion() {
    let new_question = questionSamples[this.state.newQuestionType]();
    this.setState({
      questions: this.state.questions.concat([new_question]),
    });
  }

  updateQuestion(qid, new_question) {
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      [new_question],
      this.state.questions.slice(qid+1),
    );
    this.setState({questions: new_questions});
  }

  saveChanges() {
    const request = this.props.requestPromise;
    request.post({
      uri: `${constant.HEROKU_APP_URL}/questions`,
      json: this.state.questions,
    })
    .then((_body) => {
      toast.success('Questionaire has been saved.');
    })
    .catch((err) => {
      console.error(err);
      toast.error('Oops, saving questionaire has failed.');
    });
  }

  changeNewQuestionType(event) {
    this.setState({ newQuestionType: event.target.value });
  }

  moveQuestionDown(index) {
    return () => {
      if (index + 1 >= this.state.questions.length) {
        return;
      }
      let question = this.state.questions[index];
      let next_question = this.state.questions[index + 1];
      let new_questions = [].concat(
        this.state.questions.slice(0, index),
        next_question,
        question,
        this.state.questions.slice(index + 2),
      );
      this.setState({ questions: new_questions });
    };
  }

  moveQuestionUp(index) {
    return () => {
      if (index <= 0) {
        return;
      }
      let question = this.state.questions[index];
      let pre_question = this.state.questions[index - 1];
      let new_questions = [].concat(
        this.state.questions.slice(0, index - 1),
        question,
        pre_question,
        this.state.questions.slice(index + 1),
      );
      this.setState({ questions: new_questions });
    };
  }

  removeQuestion(index) {
    return () => {
      let new_questions = Array.from(this.state.questions);
      new_questions.splice(index, 1);
      this.setState({questions: new_questions});
    };
  }

  onChangeAnchor(qid, value) {
    let question = this.state.questions[qid];
    question.anchor = value;
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      question,
      this.state.questions.slice(qid + 1),
    );
    this.setState({questions: new_questions});
  }

  onChangeEvent(qid, obj) {
    let question = this.state.questions[qid];
    question.event = obj;
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      question,
      this.state.questions.slice(qid + 1),
    );
    this.setState({questions: new_questions});
  }

  onChangeLeadQualification(qid, obj) {
    let question = this.state.questions[qid];
    console.log(obj)
    question.leadQualification = obj;
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      question,
      this.state.questions.slice(qid + 1),
    );
    this.setState({questions: new_questions});
  }

  onChangeExport(qid, obj) {
    console.log('onChangeExport');
    let question = this.state.questions[qid];
    question.export = obj;
    let new_questions = [].concat(
      this.state.questions.slice(0, qid),
      question,
      this.state.questions.slice(qid + 1),
    );
    this.setState({questions: new_questions});
  }

  onAddNext(qid) {
    return (_event) => {
      const quesiton = this.state.questions[qid];
      const anchorAndIndexArray =
        (new QuestionFlowUtil(this.state.questions, this)).getAllAnchors()[0];
      const new_question = Object.assign({}, quesiton, {'next': anchorAndIndexArray[0]});
      this.updateQuestion(qid, new_question);
    };
  }

  onPaste(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');
    try {
      let pastedQuestions = JSON.parse(pastedData);
      if (Object.prototype.toString.call(pastedQuestions) != '[object Array]') {
        throw new Error('Not an array.');
      }
      this.setState({
        showModalPasteQuestionJSONDialog: true,
        pastedQuestions: pastedQuestions,
      });
      event.stopPropagation();
      event.preventDefault();
    } catch (e) {
      // ignore if pasted data isn't JSON
    }
  }

  showQuestionCard(id, css) {
    if (!id || !this.questionCardRefs[id]) {
      return;
    }
    const cardHeight = this.questionCardRefs[id].offsetHeight;
    const cardNextTop = parseInt(css.top, 10);
    const questionChartBottom =
      this.questionChartElem.offsetTop + this.questionChartElem.offsetHeight;
    console.log(cardNextTop, cardHeight, questionChartBottom);
    let uiPaddingHeight = ((cardNextTop + cardHeight) - questionChartBottom) + FIX_UIPADDING_HEIGHT;
    uiPaddingHeight = uiPaddingHeight < 0 ? 0 : uiPaddingHeight;
    this.setState({
      visibleQuestionCardId: id,
      visibleQuestionCardCss: css,
      uiPaddingHeight: uiPaddingHeight,
    });
  }

  hideActiveQuestionCard() {
    this.setState({
      visibleQuestionCardId: null,
      visibleQuestionCardCss: null,
      uiPaddingHeight: 0,
    });
  }

  renderQuestionChart() {
    return (
      <div ref={elem => this.questionChartElem = elem}
        className={this.state.showQuestionChart ? '' : 'hide'}>
        <QuestionChart
          questions={this.state.questions}
          showQuestionCard={this.showQuestionCard.bind(this)}
          hideActiveQuestionCard={this.hideActiveQuestionCard.bind(this)}
          questionFlowUtil={new QuestionFlowUtil(this.state.questions, this)} />
      </div>
    );
  }

  renderCommonCardTools(index) {
    let question = this.state.questions[index];
    return (
      <div className="card-header">
        <Anchor qid={index} question={question} onChangeAnchor={this.onChangeAnchor.bind(this)} />
        <AppEvent qid={index} question={question} onChangeEvent={this.onChangeEvent.bind(this)} />
        <DataExport qid={index} question={question} onChangeExport={this.onChangeExport.bind(this)} />
        <LeadQualtification qid={index} question={question} onChangeLeadQualification={this.onChangeLeadQualification.bind(this)} />

        <div />
        <b>{question.type}</b> &nbsp;&nbsp;
        #{index} &nbsp;&nbsp;
        <Link onClick={this.moveQuestionDown(index)}
          title="Move Question Down">
          <i className="fa fa-level-down" />
        </Link>&nbsp;&nbsp;
        <Link onClick={this.moveQuestionUp(index)}
          title="Move Question Up">
          <i className="fa fa-level-up" />
        </Link>&nbsp;&nbsp;
        <Link onClick={this.removeQuestion(index)}
          title="Remove Question">
          <i className="fa fa-trash" />
        </Link>&nbsp;&nbsp;
        {ConditionalLogicHelper.renderAddNextIfPossible(question, this.onAddNext(index))}
      </div>
    );
  }

  renderQuestionsHeader() {
    return (
      <div className="alert alert-secondary">
        <div className="float-right">
          <div className="btn-group">
            <Link
              onClick={() => {this.setState({showQuestionChart: true});}}
              title="Switch to ChartView"
              className={cx(
                'btn',
                this.state.showQuestionChart ? 'btn-outline-secondary' : 'btn-outline-primary',
                this.state.showQuestionChart ? 'disabled' : '',
              )}>
              <i className="fa fa-sitemap"></i> Chart
            </Link>
            <Link
              onClick={() => {this.setState({showQuestionChart: false});}}
              title="Switch to CardView"
              className={cx(
                'btn',
                this.state.showQuestionChart ? 'btn-outline-primary' : 'btn-outline-secondary',
                this.state.showQuestionChart ? '' : 'disabled',
              )}>
              <i className="fa fa-list-alt"></i> Card
            </Link>
          </div>
          &nbsp;&nbsp;

          <Link
            onClick={() => {this.setState({showModalCopyQuestionJSONDialog: true});}}
            title="Export current questions as JSON">
            Export <i className="fa fa-external-link"></i>
          </Link>
        </div>
        <form className="form form-inline" style={{marginBottom: '0'}}>
          Questionaire KEY: &nbsp;&nbsp; <select className="form-control">
            <option>Default</option>
          </select>
        </form>
      </div>
    );
  }

  renderQuestionCards() {
    const cardsMode = !this.state.showQuestionChart;
    return this.state.questions.map((question, index) => {
      const cardjsx = questionCardGeneratorMap[question.type](
        index,
        question,
        this.renderCommonCardTools(index),
        new QuestionFlowUtil(this.state.questions, this),
        this.state.botConfig,
      );

      let visibleClass = null;
      let visibleStyle = null;
      if (cardsMode) {
        visibleClass = '';
        visibleStyle = { paddingBottom: '1em'};
      } else {
        const visible = this.state.visibleQuestionCardId === index ? '' : 'none';
        visibleClass = this.state.visibleQuestionCardId === index ? 'question-card-visible' : '';
        visibleStyle = Object.assign({},
          { paddingBottom: '1em', display: visible },
          this.state.visibleQuestionCardCss
        );
      }

      return (
        <div ref={elem => this.questionCardRefs[index] = elem }
             key={index}
             className={visibleClass}
             style={visibleStyle}>
          {cardjsx}
        </div>
      );
    });
  }

  renderNewQuestionButton() {
    let options = Object.keys(questionCardGeneratorMap).map((key) => {
      return <option value={key} key={key}>{key}</option>;
    });
    return (
      <div className="input-group">
        <select className="custom-select"
          value={this.state.newQuestionType}
          onChange={this.changeNewQuestionType.bind(this)}>
          {options}
        </select>
        <div className="input-group-append">
          <Link className="btn btn-primary"
            onClick={this.addNewQuestion.bind(this)}>
            New Question
          </Link>
        </div>
      </div>
    );
  }

  renderSaveButton() {
    if (this.state.inSaving) {
      return (
        <Link className="btn btn-primary">
          <i className="fa fa-spinner fa-spin" />
        </Link>
      );
    } else {
      return (
        <Link className="btn btn-primary" onClick={this.saveChanges.bind(this)}>
          Save
        </Link>
      );
    }
  }

  renderFooterButtons() {
    return (
      // hack: set zIndex to be 1 so it on top of question cards,
      // but in below of modal dialogs
      <div className="footer fixed-bottom" style={{zIndex: '1'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col col-md-10 bg-light" style={{ paddingTop: '8px' }}>
              <form className="form-inline justify-content-center">
                <div className="form-group">
                  {this.renderNewQuestionButton()}
                  &nbsp;&nbsp;
                </div>
                <div className="form-group">
                  {this.renderSaveButton()}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderModalPasteQuestionJSONDialog() {
    let replaceQuestionsWithPastedQuestions = () => {
      this.setState({
        showModalPasteQuestionJSONDialog: false,
        questions: this.state.pastedQuestions,
        pastedQuestions: [],
      });
    };
    let closeDialog = () => {
      this.setState({showModalPasteQuestionJSONDialog: false});
    };
    return (
      <Modal open={this.state.showModalPasteQuestionJSONDialog}
        onClose={closeDialog}
        style={{zIndex: '1000'}}>
        <h4>Confirm replacing questions?</h4>
        <p>You have just pasted below questions, do you want to replace you current questions with them?</p>
        <textarea className="form-control"
          value={JSON.stringify(this.state.pastedQuestions, null, 2)}
          rows={16}
          readOnly={true} />
        <br />
        <button type="button"
                className="btn btn-primary"
                onClick={replaceQuestionsWithPastedQuestions}>
          Replace
        </button>
        &nbsp;
        <button type="button"
                className="btn btn-secondary"
                onClick={closeDialog}>
          Cancel
        </button>
      </Modal>
    );
  }

  renderModalCopyQuestionJSONDialog() {
    return (
      <Modal open={this.state.showModalCopyQuestionJSONDialog}
        onClose={() => {this.setState({showModalCopyQuestionJSONDialog: false});}}
        style={{zIndex: '1000'}}>
        <h4>Export Your Questions</h4>
        <p>They are exported below in JSON. Please click and copy them.</p>
        <textarea className="form-control"
          ref="modalCopyQuestionJSONTextarea"
          value={JSON.stringify(this.state.questions, null, 2)}
          onClick={() => {
            this.refs.modalCopyQuestionJSONTextarea.focus();
            this.refs.modalCopyQuestionJSONTextarea.select();
          }}
          rows={10}
          readOnly={true} />
      </Modal>
    );
  }

  renderQuestionUIPadding() {
    /*
      liyuhk: UI padding is a hack for our layout. Sometimes, because of
      fixed footer buttons, the last question card is covered, or the
      question card is longer than client window. So we insert an
      empty div with enough height so user can scroll down to find the
      last card.
    */
    const height = this.state.showQuestionChart
      ? this.state.uiPaddingHeight
      : FIX_UIPADDING_HEIGHT;
    return (
      <div style={{height: `${height}px`}}>
      {this.state.showQuestionChart
        ? ''
        : (<h3>
            <span className="badge badge-info"
                  id={`anchor-${this.state.questions.length}`}>
              End
            </span>
          </h3>)
      }
      </div>
    );
  }

  render() {
    return (
      <div>
        <div id="question-cards-container" onPaste={this.onPaste.bind(this)}>
          {this.renderQuestionsHeader()}
          {this.renderQuestionChart()}
          {this.renderQuestionCards()}
          {this.renderQuestionUIPadding()}
          <ToastContainer autoClose={3000} />
        </div>
        {this.renderFooterButtons()}
        {this.renderModalPasteQuestionJSONDialog()}
        {this.renderModalCopyQuestionJSONDialog()}
      </div>
    );
  }
}

import React from 'react';
import ConditionalLogicHelper from './ConditionalLogicHelper.jsx';
import {questionSamples} from 'common/question';
import immutable from 'object-path-immutable';

export default class QuestionCard extends React.Component {
  constructor() {
    super();
  }

  static getType() {
    return 'question';
  }

  static canHaveNext() {
    return false;
  }

  static getGenerator() {
    return (qid, question, commonToolbar, questionFlowUtil, botConfig) => {
      return (
        <QuestionCard
          key={qid}
          qid={qid}
          question={question}
          commonToolbar={commonToolbar}
          questionFlowUtil={questionFlowUtil}
          botConfig={botConfig}
        />
      );
    };
  }

  onAddOptionNext(optionIndex) {
    return () => {
      let allAnchors = this.props.questionFlowUtil.getAllAnchors();
      let new_option = Object.assign({},
        this.props.question.options[optionIndex],
        {'next': allAnchors[0][0]},
      );
      this.props.questionFlowUtil.updateQuestionOption(this.props.qid, optionIndex, new_option);
    };
  }

  onAddNewOption() {
    let sample_question = questionSamples['question']();
    let new_options = [].concat(
      this.props.question.options,
      [Object.assign({}, sample_question.options[0])],
    );
    let new_question = Object.assign({}, this.props.question, {options: new_options});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onRemoveOption(optionIndex) {
    return () => {
      let new_question = immutable.del(
        this.props.question,
        `options.${optionIndex}`,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onChangeText(event) {
    let new_question = Object.assign({}, this.props.question, {text: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onChangeOptionText(optionIndex) {
    return (event) => {
      let option = this.props.question.options[optionIndex];
      let new_option = Object.assign({}, option, {'text': event.target.value});
      this.props.questionFlowUtil.updateQuestionOption(this.props.qid, optionIndex, new_option);
    };
  }

  onChangeOptionRespPayload(optionIndex) {
    return (event) => {
      let option = this.props.question.options[optionIndex];
      let new_option = Object.assign({}, option, {'resp_payload': event.target.value});
      this.props.questionFlowUtil.updateQuestionOption(this.props.qid, optionIndex, new_option);
    };
  }

  onChangeOptionNext(optionIndex) {
    return (event) => {
      let option = this.props.question.options[optionIndex];
      let new_option = Object.assign({}, option, {'next': event.target.value});
      this.props.questionFlowUtil.updateQuestionOption(this.props.qid, optionIndex, new_option);
    };
  }

  onRemoveOptionNext(optionIndex) {
    return (_event) => {
      let option = this.props.question.options[optionIndex];
      let new_option = Object.assign({}, option, {'next': undefined});
      this.props.questionFlowUtil.updateQuestionOption(this.props.qid, optionIndex, new_option);
    };
  }

  renderOptions() {
    return this.props.question.options.map((option, index) => {
      return (
        <div key={index} className="form-group">
          <label>Option
          &nbsp;
          <span className="badge badge-secondary"
            style={{cursor: 'pointer'}}
            onClick={this.onRemoveOption(index)}>
            <i className="fa fa-trash" />
          </span>
          &nbsp;

          {ConditionalLogicHelper.renderAddNextIfPossible(
            option,
            this.onAddOptionNext(index),
          )}</label>
          <div style={{marginLeft: '1em'}}>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Text</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={option.text}
                  onChange={this.onChangeOptionText(index)}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Resp Payload</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={option.resp_payload}
                  onChange={this.onChangeOptionRespPayload(index)}
                />
              </div>
            </div>
            {ConditionalLogicHelper.renderNextInOptionIfPossible(
              this.props.qid,
              index,
              option,
              this.props.questionFlowUtil,
              this.onChangeOptionNext(index),
              this.onRemoveOptionNext(index),
            )}
          </div>
        </div>
      );
    });
  }

  renderAddNewOptionButton() {
    return (
      <div className="form-group">
        <span className="badge badge-secondary"
          style={{cursor: 'pointer'}}
          onClick={this.onAddNewOption.bind(this)}>
          +Option
        </span>
      </div>
    );
  }

  render() {
    return (
      <div className="card">
        {this.props.commonToolbar}
        <div className="card-body">
          <form className="form">
            <div className="form-group">
              <label>Text</label>
              <textarea
                className="form-control"
                rows="3"
                value={this.props.question.text}
                onChange={this.onChangeText.bind(this)}
              />
            </div>
            {this.renderOptions()}
            {this.renderAddNewOptionButton()}
          </form>
        </div>
      </div>
    );
  }
}
